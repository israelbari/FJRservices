import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function getByClient(req: Request, res: Response): Promise<void> {
  try {
    const projects = await prisma.project.findMany({
      where: { clientId: req.params.clientId as string },
      include: {
        comments: true,
        timeEntries: true,
        medias: { include: { media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ message: 'Error al obtener proyectos' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: { ...data, clientId: req.params.clientId as string },
      include: {
        comments: true,
        timeEntries: true,
        medias: { include: { media: true } },
      },
    });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al crear proyecto' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data,
      include: {
        comments: true,
        timeEntries: true,
        medias: { include: { media: true } },
      },
    });
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar proyecto' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Proyecto eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar proyecto' });
  }
}
