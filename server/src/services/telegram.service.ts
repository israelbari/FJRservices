import TelegramBot from 'node-telegram-bot-api';

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { env } from '../utils/env';
import { uploadFile } from './minio.service';
import { processImage, isImage } from '../utils/image-processor';

let bot: TelegramBot | null = null;

/* ------------------------------------------------------------------ */
/*  SESSIONS (en memoria)                                              */
/* ------------------------------------------------------------------ */

interface PhotoGroup {
  fileId: string;
  filePath?: string;
}

interface Session {
  command: 'photo' | 'hours' | 'comment';
  step: number;
  data: Record<string, any>;
  photos?: PhotoGroup[];
  chatId: number;
}

const sessions = new Map<number, Session>();

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function getBucket(clientId?: string | null) {
  return clientId ? env.MINIO_BUCKET_CLIENTS : env.MINIO_BUCKET_MEDIA;
}

async function requireAuth(chatId: number): Promise<{ userId: string; name: string } | null> {
  const user = await prisma.user.findFirst({
    where: { telegramId: String(chatId), status: 'active' },
  });
  if (!user) {
    bot!.sendMessage(chatId, '⛔ No estás autorizado. Contacta con el administrador para vincular tu Telegram.');
    return null;
  }
  return { userId: user.id, name: user.name };
}

async function sendClientList(chatId: number, prefix: string) {
  const clients = await prisma.client.findMany({ where: { status: 'active' }, orderBy: { name: 'asc' } });
  if (clients.length === 0) {
    bot!.sendMessage(chatId, '📭 No hay clientes activos.');
    sessions.delete(chatId);
    return;
  }
  const buttons = clients.map((c) => [{ text: c.name, callback_data: `${prefix}:client:${c.id}` }]);
  bot!.sendMessage(chatId, '📁 Selecciona un cliente:', {
    reply_markup: { inline_keyboard: buttons },
  });
}

async function sendProjectList(chatId: number, clientId: string, prefix: string) {
  const projects = await prisma.project.findMany({ where: { clientId }, orderBy: { name: 'asc' } });
  if (projects.length === 0) {
    bot!.sendMessage(chatId, '🔧 Este cliente no tiene proyectos.');
    sessions.delete(chatId);
    return;
  }
  const buttons = projects.map((p) => [{ text: p.name, callback_data: `${prefix}:project:${p.id}` }]);
  bot!.sendMessage(chatId, '🔧 Selecciona un proyecto:', {
    reply_markup: { inline_keyboard: buttons },
  });
}

/* ------------------------------------------------------------------ */
/*  PHOTO FLOW                                                         */
/* ------------------------------------------------------------------ */

async function handlePhoto(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const auth = await requireAuth(chatId);
  if (!auth) return;

  const photos = msg.photo;
  if (!photos || photos.length === 0) return;
  const largest = photos[photos.length - 1];

  const session = sessions.get(chatId);
  if (session && session.command === 'photo') {
    session.photos!.push({ fileId: largest.file_id });
    return;
  }

  // If user sends a photo without starting /foto first, start session and ask for client
  sessions.set(chatId, {
    command: 'photo',
    step: 1,
    data: {},
    photos: [{ fileId: largest.file_id }],
    chatId,
  });

  await sendClientList(chatId, 'photo');
}

async function handleDocument(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const auth = await requireAuth(chatId);
  if (!auth) return;

  const doc = msg.document;
  if (!doc) return;

  if (!doc.mime_type || !doc.mime_type.startsWith('image/')) {
    bot!.sendMessage(chatId, '⚠️ Solo se aceptan archivos de imagen.');
    return;
  }

  const session = sessions.get(chatId);
  if (session && session.command === 'photo') {
    session.photos!.push({ fileId: doc.file_id });
    return;
  }

  sessions.set(chatId, {
    command: 'photo',
    step: 1,
    data: {},
    photos: [{ fileId: doc.file_id }],
    chatId,
  });

  await sendClientList(chatId, 'photo');
}

async function processPhotoSession(chatId: number, projectId: string) {
  const session = sessions.get(chatId);
  if (!session || !session.photos) return;

  bot!.sendMessage(chatId, '⏳ Procesando imágenes...');

  let successCount = 0;
  for (const photo of session.photos) {
    try {
      const file = await bot!.getFile(photo.fileId);
      if (!file.file_path) continue;
      const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      const bucket = getBucket(project?.clientId);

      const id = uuidv4();
      let previewBuffer: any = buffer;
      let thumbBuffer: any = buffer;
      let dimensions = '';

      // Process with Sharp if image
      if (isImage(file.file_path.endsWith('.webp') ? 'image/webp' : 'image/jpeg')) {
        const processed = await processImage(buffer);
        previewBuffer = processed.preview as Buffer;
        thumbBuffer = processed.thumbnail as Buffer;
        dimensions = `${processed.width}x${processed.height}`;
      }

      const previewName = `${id}-preview.webp`;
      const thumbName = `${id}-thumb.webp`;

      await uploadFile(bucket, previewName, previewBuffer, previewBuffer.length, 'image/webp');
      await uploadFile(bucket, thumbName, thumbBuffer, thumbBuffer.length, 'image/webp');

      const media = await prisma.media.create({
        data: {
          id,
          name: `telegram-${Date.now()}.webp`,
          src: `${bucket}/${previewName}`,
          thumbnailSrc: `${bucket}/${thumbName}`,
          folder: 'Telegram',
          mimeType: 'image/webp',
          dimensions,
          size: `${Math.round(previewBuffer.length / 1024)} KB`,
          source: 'telegram',
          clientId: project?.clientId || null,
        },
      });

      await prisma.projectMedia.create({
        data: { projectId, mediaId: media.id, visible: false },
      });

      successCount++;
    } catch (err) {
      console.error('Error processing Telegram photo:', err);
    }
  }

  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: true } });
  bot!.sendMessage(
    chatId,
    `✅ ${successCount} imagen(es) asignadas a "${project?.name}" (${project?.client.name}).`
  );
  sessions.delete(chatId);
}

/* ------------------------------------------------------------------ */
/*  HOURS FLOW                                                         */
/* ------------------------------------------------------------------ */

async function handleHoursCommand(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const auth = await requireAuth(chatId);
  if (!auth) return;

  sessions.set(chatId, { command: 'hours', step: 1, data: {}, chatId });
  await sendClientList(chatId, 'hours');
}

async function processHoursStep(chatId: number, text: string) {
  const session = sessions.get(chatId);
  if (!session || session.command !== 'hours') return;

  if (session.step === 3) {
    // Hours amount
    const hours = parseFloat(text.replace(',', '.'));
    if (isNaN(hours) || hours <= 0) {
      bot!.sendMessage(chatId, '⚠️ Introduce un número válido de horas (ej: 3.5)');
      return;
    }
    session.data.hours = hours;
    session.step = 4;
    bot!.sendMessage(chatId, '📝 Escribe una descripción:');
    return;
  }

  if (session.step === 4) {
    // Description
    session.data.description = text;
    session.step = 5;
    bot!.sendMessage(chatId, '💰 ¿Es facturable?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Sí, facturable', callback_data: 'hours:billable:true' }],
          [{ text: '❌ No facturable', callback_data: 'hours:billable:false' }],
        ],
      },
    });
    return;
  }
}

async function saveHoursEntry(chatId: number) {
  const session = sessions.get(chatId);
  if (!session) return;

  try {
    await prisma.timeEntry.create({
      data: {
        projectId: session.data.projectId,
        description: session.data.description,
        hours: session.data.hours,
        date: new Date(),
        visible: false,
        billable: session.data.billable,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: session.data.projectId },
      include: { client: true },
    });

    bot!.sendMessage(
      chatId,
      `✅ ${session.data.hours}h registradas en "${project?.name}" (${project?.client.name})\n` +
        `📝 ${session.data.description}\n` +
        `💰 ${session.data.billable ? 'Facturable' : 'No facturable'}`
    );
  } catch (err) {
    console.error('Error saving hours:', err);
    bot!.sendMessage(chatId, '❌ Error al guardar las horas.');
  }
  sessions.delete(chatId);
}

/* ------------------------------------------------------------------ */
/*  COMMENT FLOW                                                       */
/* ------------------------------------------------------------------ */

async function handleCommentCommand(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const auth = await requireAuth(chatId);
  if (!auth) return;

  sessions.set(chatId, { command: 'comment', step: 1, data: {}, chatId });
  await sendClientList(chatId, 'comment');
}

async function processCommentStep(chatId: number, text: string) {
  const session = sessions.get(chatId);
  if (!session || session.command !== 'comment') return;

  if (session.step === 3) {
    // Comment text
    session.data.content = text;
    session.step = 4;
    bot!.sendMessage(chatId, '👁️ ¿Visible para el cliente?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👁️ Sí, visible', callback_data: 'comment:visible:true' }],
          [{ text: '🚫 No, privado', callback_data: 'comment:visible:false' }],
        ],
      },
    });
    return;
  }
}

async function saveComment(chatId: number) {
  const session = sessions.get(chatId);
  if (!session) return;

  try {
    await prisma.comment.create({
      data: {
        projectId: session.data.projectId,
        content: session.data.content,
        visible: session.data.visible,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: session.data.projectId },
      include: { client: true },
    });

    bot!.sendMessage(
      chatId,
      `✅ Comentario añadido a "${project?.name}" (${project?.client.name})\n` +
        `👁️ ${session.data.visible ? 'Visible para el cliente' : 'Privado'}`
    );
  } catch (err) {
    console.error('Error saving comment:', err);
    bot!.sendMessage(chatId, '❌ Error al guardar el comentario.');
  }
  sessions.delete(chatId);
}

/* ------------------------------------------------------------------ */
/*  CALLBACK QUERIES                                                   */
/* ------------------------------------------------------------------ */

async function handleCallback(query: TelegramBot.CallbackQuery) {
  const chatId = query.message!.chat.id;
  const data = query.data!;
  const session = sessions.get(chatId);

  // Answer callback to remove loading state
  bot!.answerCallbackQuery(query.id);

  // --- PHOTO FLOW ---
  if (data.startsWith('photo:client:')) {
    const clientId = data.replace('photo:client:', '');
    if (!session) return;
    session.data.clientId = clientId;
    session.step = 2;
    await sendProjectList(chatId, clientId, 'photo');
    return;
  }

  if (data.startsWith('photo:project:')) {
    const projectId = data.replace('photo:project:', '');
    if (!session) return;
    await processPhotoSession(chatId, projectId);
    return;
  }

  // --- HOURS FLOW ---
  if (data.startsWith('hours:client:')) {
    const clientId = data.replace('hours:client:', '');
    if (!session) return;
    session.data.clientId = clientId;
    session.step = 2;
    await sendProjectList(chatId, clientId, 'hours');
    return;
  }

  if (data.startsWith('hours:project:')) {
    const projectId = data.replace('hours:project:', '');
    if (!session) return;
    session.data.projectId = projectId;
    session.step = 3;
    bot!.sendMessage(chatId, '⏱️ ¿Cuántas horas? (ej: 3.5)');
    return;
  }

  if (data.startsWith('hours:billable:')) {
    const billable = data.replace('hours:billable:', '') === 'true';
    if (!session) return;
    session.data.billable = billable;
    await saveHoursEntry(chatId);
    return;
  }

  // --- COMMENT FLOW ---
  if (data.startsWith('comment:client:')) {
    const clientId = data.replace('comment:client:', '');
    if (!session) return;
    session.data.clientId = clientId;
    session.step = 2;
    await sendProjectList(chatId, clientId, 'comment');
    return;
  }

  if (data.startsWith('comment:project:')) {
    const projectId = data.replace('comment:project:', '');
    if (!session) return;
    session.data.projectId = projectId;
    session.step = 3;
    bot!.sendMessage(chatId, '📝 Escribe el comentario:');
    return;
  }

  if (data.startsWith('comment:visible:')) {
    const visible = data.replace('comment:visible:', '') === 'true';
    if (!session) return;
    session.data.visible = visible;
    await saveComment(chatId);
    return;
  }
}

/* ------------------------------------------------------------------ */
/*  TEXT MESSAGES                                                      */
/* ------------------------------------------------------------------ */

async function handleText(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  const session = sessions.get(chatId);

  // Cancel any active session
  if (text === '❌ Cancelar') {
    sessions.delete(chatId);
    bot!.sendMessage(chatId, '✅ Cancelado. ¿Qué quieres hacer?', {
      reply_markup: {
        keyboard: [
          [{ text: '📸 Subir fotos' }, { text: '⏱️ Registrar horas' }],
          [{ text: '📝 Añadir comentario' }],
        ],
        resize_keyboard: true,
      },
    });
    return;
  }

  // Commands
  if (text === '/start') {
    bot!.sendMessage(
      chatId,
      '👋 ¡Hola! Soy el asistente de FJR Services.\n\nElige una acción:',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📸 Subir fotos' }, { text: '⏱️ Registrar horas' }],
            [{ text: '📝 Añadir comentario' }],
          ],
          resize_keyboard: true,
        },
      }
    );
    return;
  }

  if (text === '/foto' || text === '📸 Subir fotos') {
    sessions.set(chatId, { command: 'photo', step: 1, data: {}, photos: [], chatId });
    await sendClientList(chatId, 'photo');
    return;
  }

  if (text === '/horas' || text === '⏱️ Registrar horas') {
    await handleHoursCommand(msg);
    return;
  }

  if (text === '/comentario' || text === '📝 Añadir comentario') {
    await handleCommentCommand(msg);
    return;
  }

  // Session-based text input
  if (session?.command === 'hours') {
    await processHoursStep(chatId, text);
    return;
  }

  if (session?.command === 'comment') {
    await processCommentStep(chatId, text);
    return;
  }
}

/* ------------------------------------------------------------------ */
/*  START BOT                                                          */
/* ------------------------------------------------------------------ */

export function startTelegramBot() {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('Telegram bot disabled (no TELEGRAM_BOT_TOKEN)');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
      try {
        if (msg.photo && msg.photo.length > 0) {
          await handlePhoto(msg);
          return;
        }
        if (msg.document) {
          await handleDocument(msg);
          return;
        }
        if (msg.text) {
          await handleText(msg);
        }
      } catch (err) {
        console.error('Telegram bot message error:', err);
      }
    });

    bot.on('callback_query', async (query) => {
      try {
        await handleCallback(query);
      } catch (err) {
        console.error('Telegram bot callback error:', err);
      }
    });

    console.log('Telegram bot started');
  } catch (err) {
    console.error('Failed to start Telegram bot:', err);
  }
}
