import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const sectionSchema = z.object({
  pageId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().default(''),
  content: z.string().default(''),
  type: z.string().default('content'),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
  imageUrl: z.string().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { pageId } = req.query;
    const where = pageId ? { pageId: pageId as string } : {};
    const sections = await prisma.section.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    res.json(sections);
  } catch {
    res.status(500).json({ message: 'Error al obtener secciones' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const section = await prisma.section.findUnique({ where: { id: req.params.id as string } });
    if (!section) {
      res.status(404).json({ message: 'Seccion no encontrada' });
      return;
    }
    res.json(section);
  } catch {
    res.status(500).json({ message: 'Error al obtener seccion' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = sectionSchema.parse(req.body);
    const section = await prisma.section.create({ data });
    res.status(201).json(section);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al crear seccion' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = sectionSchema.partial().parse(req.body);
    const section = await prisma.section.update({ where: { id: req.params.id as string }, data });
    res.json(section);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar seccion' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.section.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Seccion eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar seccion' });
  }
}
