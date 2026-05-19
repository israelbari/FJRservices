import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { uploadFile, deleteFile, getPublicUrl } from '../services/minio.service';
import { env } from '../utils/env';
import { v4 as uuidv4 } from 'uuid';

const videoSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional().default(''),
  src: z.string().optional(),
  playbackRate: z.coerce.number().min(0.1).max(5).default(1),
  sectionId: z.string().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(videos);
  } catch {
    res.status(500).json({ message: 'Error al obtener videos' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, url, sectionId, playbackRate } = videoSchema.parse(req.body);
    let src = '';

    // Si hay archivo subido, guardarlo en MinIO
    if (req.file) {
      const id = uuidv4();
      const ext = req.file.originalname.split('.').pop() || 'mp4';
      const objectName = `videos/${id}.${ext}`;
      await uploadFile(env.MINIO_BUCKET_MEDIA, objectName, req.file.buffer, req.file.size, req.file.mimetype);
      src = `${env.MINIO_BUCKET_MEDIA}/${objectName}`;
    }

    let videoUrl = url || '';
    if (videoUrl.includes('watch?v=')) {
      videoUrl = videoUrl.replace('watch?v=', 'embed/');
    }

    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        url: videoUrl,
        src: src || null,
        playbackRate: playbackRate || 1,
        sectionId: sectionId || null,
      },
    });
    res.status(201).json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Error al crear video' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { title, url, sectionId, playbackRate } = videoSchema.parse(req.body);
    const existing = await prisma.video.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ message: 'Video no encontrado' });
      return;
    }

    let src = existing.src;
    let videoUrl = existing.url;

    // Si hay nuevo archivo subido, reemplazar en MinIO
    if (req.file) {
      // Eliminar archivo anterior si existe
      if (existing.src) {
        const [bucket, ...rest] = existing.src.split('/');
        const objectName = rest.join('/');
        await deleteFile(bucket, objectName);
      }
      const id = uuidv4();
      const ext = req.file.originalname.split('.').pop() || 'mp4';
      const objectName = `videos/${id}.${ext}`;
      await uploadFile(env.MINIO_BUCKET_MEDIA, objectName, req.file.buffer, req.file.size, req.file.mimetype);
      src = `${env.MINIO_BUCKET_MEDIA}/${objectName}`;
    }

    // Si se envió URL nueva, actualizarla
    if (url !== undefined) {
      videoUrl = url;
      if (videoUrl.includes('watch?v=')) {
        videoUrl = videoUrl.replace('watch?v=', 'embed/');
      }
    }

    const video = await prisma.video.update({
      where: { id: req.params.id as string },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        url: videoUrl,
        src: src || null,
        playbackRate: playbackRate !== undefined ? playbackRate : existing.playbackRate,
        sectionId: sectionId !== undefined ? (sectionId || null) : existing.sectionId,
      },
    });
    res.json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Error al actualizar video' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const video = await prisma.video.findUnique({ where: { id: req.params.id as string } });
    if (!video) {
      res.status(404).json({ message: 'Video no encontrado' });
      return;
    }

    // Si hay un archivo en MinIO, eliminarlo
    if (video.src) {
      const [bucket, ...rest] = video.src.split('/');
      const objectName = rest.join('/');
      await deleteFile(bucket, objectName);
    }

    await prisma.video.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Video eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar video' });
  }
}
