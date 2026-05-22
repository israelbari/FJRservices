import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function assign(req: Request, res: Response): Promise<void> {
  try {
    const { mediaId } = req.body;
    const record = await prisma.timeEntryMedia.create({
      data: {
        timeEntryId: req.params.timeEntryId as string,
        mediaId,
      },
      include: { media: true },
    });
    res.status(201).json(record);
  } catch {
    res.status(500).json({ message: 'Error al asignar media' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.timeEntryMedia.deleteMany({
      where: {
        timeEntryId: req.params.timeEntryId as string,
        mediaId: req.params.mediaId as string,
      },
    });
    res.json({ message: 'Media eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar media' });
  }
}
