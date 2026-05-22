import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1),
  visible: z.boolean().default(false),
});

export async function getByProject(req: Request, res: Response): Promise<void> {
  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: req.params.projectId as string },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch {
    res.status(500).json({ message: 'Error al obtener comentarios' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = commentSchema.parse(req.body);
    const comment = await prisma.comment.create({
      data: { ...data, projectId: req.params.projectId as string },
    });
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al crear comentario' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = commentSchema.partial().parse(req.body);
    const comment = await prisma.comment.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar comentario' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.comment.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Comentario eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar comentario' });
  }
}
