import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { uploadFile, deleteFile, getPublicUrl, getPresignedUrl } from '../services/minio.service';
import { env } from '../utils/env';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import { processImage, isImage } from '../utils/image-processor';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { folder, clientId, sectionId } = req.query;
    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder as string;
    if (clientId) where.clientId = clientId as string;
    if (sectionId) where.sectionId = sectionId as string;

    const media = await prisma.media.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(media);
  } catch {
    res.status(500).json({ message: 'Error al obtener media' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id as string } });
    if (!media) {
      res.status(404).json({ message: 'Media no encontrada' });
      return;
    }
    res.json(media);
  } catch {
    res.status(500).json({ message: 'Error al obtener media' });
  }
}

export async function upload(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se proporciono archivo' });
      return;
    }

    const { folder = 'General', clientId, sectionId } = req.body;
    const id = uuidv4();
    const bucket = clientId ? env.MINIO_BUCKET_CLIENTS : env.MINIO_BUCKET_MEDIA;
    const originalMime = req.file.mimetype;
    let src = '';
    let thumbnailSrc = '';
    let dimensions = '';
    let finalSize = req.file.size;

    if (isImage(originalMime)) {
      // Process with Sharp: generate preview + thumbnail
      const processed = await processImage(req.file.buffer);
      const previewName = `${id}-preview.webp`;
      const thumbName = `${id}-thumb.webp`;

      await uploadFile(bucket, previewName, processed.preview, processed.preview.length, 'image/webp');
      await uploadFile(bucket, thumbName, processed.thumbnail, processed.thumbnail.length, 'image/webp');

      src = `${bucket}/${previewName}`;
      thumbnailSrc = `${bucket}/${thumbName}`;
      dimensions = `${processed.width}x${processed.height}`;
      finalSize = processed.preview.length;
    } else {
      // Non-image: upload as-is
      const ext = req.file.originalname.split('.').pop() || '';
      const objectName = `${id}.${ext}`;
      await uploadFile(bucket, objectName, req.file.buffer, req.file.size, originalMime);
      src = `${bucket}/${objectName}`;
      thumbnailSrc = src;
    }

    const media = await prisma.media.create({
      data: {
        id,
        name: req.file.originalname,
        src,
        thumbnailSrc,
        folder: folder as string,
        dimensions,
        size: `${Math.round(finalSize / 1024)} KB`,
        mimeType: isImage(originalMime) ? 'image/webp' : originalMime,
        clientId: clientId || null,
        sectionId: sectionId || null,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error al subir archivo' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { name, folder, clientId, sectionId, order } = req.body;
    const media = await prisma.media.findUnique({ where: { id: req.params.id as string } });
    if (!media) {
      res.status(404).json({ message: 'Media no encontrada' });
      return;
    }

    const { title, link } = req.body;
    const updated = await prisma.media.update({
      where: { id: req.params.id as string },
      data: {
        name: name !== undefined ? name.trim() : media.name,
        folder: folder !== undefined ? folder : media.folder,
        clientId: clientId !== undefined ? (clientId || null) : media.clientId,
        sectionId: sectionId !== undefined ? (sectionId || null) : media.sectionId,
        order: order !== undefined ? order : media.order,
        title: title !== undefined ? title : media.title,
        link: link !== undefined ? link : media.link,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ message: 'Error al actualizar media' });
  }
}

export async function getUrl(req: Request, res: Response): Promise<void> {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id as string } });
    if (!media) {
      res.status(404).json({ message: 'Media no encontrada' });
      return;
    }

    const useThumb = req.query.size === 'thumb' && media.thumbnailSrc;
    const src = useThumb ? media.thumbnailSrc : media.src;

    const [bucket, ...rest] = src.split('/');
    const objectName = rest.join('/');
    const isPrivate = bucket === env.MINIO_BUCKET_CLIENTS;

    if (isPrivate) {
      const url = await getPresignedUrl(bucket, objectName, 900);
      res.redirect(url);
    } else {
      const url = getPublicUrl(bucket, objectName);
      res.redirect(url);
    }
  } catch {
    res.status(500).json({ message: 'Error al generar URL' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id as string } });
    if (!media) {
      res.status(404).json({ message: 'Media no encontrada' });
      return;
    }

    // Delete preview
    const [bucket, ...rest] = media.src.split('/');
    const objectName = rest.join('/');
    await deleteFile(bucket, objectName);

    // Delete thumbnail if different
    if (media.thumbnailSrc && media.thumbnailSrc !== media.src) {
      const [thumbBucket, ...thumbRest] = media.thumbnailSrc.split('/');
      const thumbObjectName = thumbRest.join('/');
      await deleteFile(thumbBucket, thumbObjectName);
    }

    await prisma.media.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Media eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar media' });
  }
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];

export async function uploadZip(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se proporciono archivo ZIP' });
      return;
    }

    // Validar extension .zip
    if (!req.file.originalname.toLowerCase().endsWith('.zip')) {
      res.status(400).json({ message: 'El archivo debe ser un ZIP' });
      return;
    }

    const { folder = 'General', clientId } = req.body;
    const bucket = clientId ? env.MINIO_BUCKET_CLIENTS : env.MINIO_BUCKET_MEDIA;

    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();

    const uploadedImages: Array<{ name: string; src: string }> = [];
    const uploadedVideos: Array<{ name: string; src: string }> = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const entry of entries) {
      // Ignorar directorios
      if (entry.isDirectory) continue;

      // Extraer solo nombre de archivo, ignorar carpetas internas
      const rawName = entry.entryName.split('/').pop() || entry.entryName;
      const ext = rawName.substring(rawName.lastIndexOf('.')).toLowerCase();

      const isImage = IMAGE_EXTENSIONS.includes(ext);
      const isVideo = VIDEO_EXTENSIONS.includes(ext);

      if (!isImage && !isVideo) {
        skipped.push(rawName);
        continue;
      }

      try {
        const id = uuidv4();
        const buffer = entry.getData();
        let src = '';
        let thumbnailSrc = '';
        let dimensions = '';
        let finalSize = buffer.length;

        if (isImage) {
          const processed = await processImage(buffer);
          const previewName = `${id}-preview.webp`;
          const thumbName = `${id}-thumb.webp`;

          await uploadFile(bucket, previewName, processed.preview, processed.preview.length, 'image/webp');
          await uploadFile(bucket, thumbName, processed.thumbnail, processed.thumbnail.length, 'image/webp');

          src = `${bucket}/${previewName}`;
          thumbnailSrc = `${bucket}/${thumbName}`;
          dimensions = `${processed.width}x${processed.height}`;
          finalSize = processed.preview.length;
        } else {
          const objectName = `videos/${id}${ext}`;
          await uploadFile(bucket, objectName, buffer, buffer.length, `video/${ext.replace('.', '')}`);
          src = `${bucket}/${objectName}`;
          thumbnailSrc = src;
        }

        if (isImage) {
          const media = await prisma.media.create({
            data: {
              id,
              name: rawName,
              src,
              thumbnailSrc,
              folder: folder as string,
              dimensions,
              size: `${Math.round(finalSize / 1024)} KB`,
              mimeType: 'image/webp',
              clientId: clientId || null,
            },
          });
          uploadedImages.push({ name: rawName, src: media.src });
        } else {
          const videoObjectName = `videos/${id}${ext}`;
          const title = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;
          const video = await prisma.video.create({
            data: {
              title: title.trim(),
              url: '',
              src: `${bucket}/${videoObjectName}`,
              playbackRate: 1,
              sectionId: null,
            },
          });
          uploadedVideos.push({ name: rawName, src: video.src || '' });
        }
      } catch (err) {
        console.error(`Error extrayendo ${rawName}:`, err);
        errors.push(rawName);
      }
    }

    res.status(201).json({
      images: uploadedImages.length,
      videos: uploadedVideos.length,
      skipped: skipped.length,
      errors: errors.length,
      imageFiles: uploadedImages.map((f) => f.name),
      videoFiles: uploadedVideos.map((f) => f.name),
      skippedFiles: skipped,
      errorFiles: errors,
    });
  } catch (error) {
    console.error('Upload ZIP error:', error);
    res.status(500).json({ message: 'Error al procesar ZIP' });
  }
}
