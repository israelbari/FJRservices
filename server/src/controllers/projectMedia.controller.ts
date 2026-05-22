import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function assign(req: Request, res: Response): Promise<void> {
  try {
    const { mediaId } = req.body;
    const link = await prisma.projectMedia.create({
      data: {
        projectId: req.params.projectId as string,
        mediaId,
        visible: false,
      },
      include: { media: true },
    });
    res.status(201).json(link);
  } catch {
    res.status(500).json({ message: 'Error al asignar media' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.projectMedia.deleteMany({
      where: {
        projectId: req.params.projectId as string,
        mediaId: req.params.mediaId as string,
      },
    });
    res.json({ message: 'Media desasignada' });
  } catch {
    res.status(500).json({ message: 'Error al desasignar media' });
  }
}

export async function toggleVisible(req: Request, res: Response): Promise<void> {
  try {
    const { visible } = req.body;
    const link = await prisma.projectMedia.update({
      where: { id: req.params.id as string },
      data: { visible: !!visible },
      include: { media: true },
    });
    res.json(link);
  } catch {
    res.status(500).json({ message: 'Error al actualizar visibilidad' });
  }
}
