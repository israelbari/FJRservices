import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const sectionTypeSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().default('Layers'),
  color: z.string().default('#64748B'),
  bgColor: z.string().default('#F1F5F9'),
  configSchema: z.string().default('[]'),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const types = await prisma.sectionType.findMany({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
    res.json(types);
  } catch {
    res.status(500).json({ message: 'Error al obtener tipos de seccion' });
  }
}

export async function getByType(req: Request, res: Response): Promise<void> {
  try {
    const sectionType = await prisma.sectionType.findUnique({
      where: { type: req.params.type as string },
    });
    if (!sectionType) {
      res.status(404).json({ message: 'Tipo de seccion no encontrado' });
      return;
    }
    res.json(sectionType);
  } catch {
    res.status(500).json({ message: 'Error al obtener tipo de seccion' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = sectionTypeSchema.parse(req.body);
    const sectionType = await prisma.sectionType.create({ data });
    res.status(201).json(sectionType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    if (error instanceof Error && error.message.includes('P2002')) {
      res.status(400).json({ message: 'Ya existe un tipo con ese slug' });
      return;
    }
    res.status(500).json({ message: 'Error al crear tipo de seccion' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = sectionTypeSchema.partial().parse(req.body);
    const sectionType = await prisma.sectionType.update({
      where: { type: req.params.type as string },
      data,
    });
    res.json(sectionType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar tipo de seccion' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.sectionType.delete({ where: { type: req.params.type as string } });
    res.json({ message: 'Tipo de seccion eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar tipo de seccion' });
  }
}
