import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const timeEntrySchema = z.object({
  description: z.string().min(1),
  hours: z.number().positive(),
  date: z.string().optional(),
  visible: z.boolean().default(false),
  billable: z.boolean().default(true),
  notes: z.string().optional(),
});

export async function getByProject(req: Request, res: Response): Promise<void> {
  try {
    const entries = await prisma.timeEntry.findMany({
      where: { projectId: req.params.projectId as string },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch {
    res.status(500).json({ message: 'Error al obtener partes de horas' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = timeEntrySchema.parse(req.body);
    const entry = await prisma.timeEntry.create({
      data: {
        description: data.description,
        hours: data.hours,
        date: data.date ? new Date(data.date) : new Date(),
        visible: data.visible,
        billable: data.billable,
        notes: data.notes || null,
        projectId: req.params.projectId as string,
      },
    });
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al crear parte de horas' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = timeEntrySchema.partial().parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.hours !== undefined) updateData.hours = data.hours;
    if (data.visible !== undefined) updateData.visible = data.visible;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    const entry = await prisma.timeEntry.update({
      where: { id: req.params.id as string },
      data: updateData,
    });
    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar parte de horas' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.timeEntry.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Parte de horas eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar parte de horas' });
  }
}
