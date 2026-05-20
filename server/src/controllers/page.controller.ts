import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(''),
  active: z.boolean().default(true),
  useDynamicContent: z.boolean().default(false),
  order: z.number().int().default(0),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const pages = await prisma.page.findMany({
      include: { sections: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json(pages);
  } catch {
    res.status(500).json({ message: 'Error al obtener paginas' });
  }
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug as string },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!page) {
      res.status(404).json({ message: 'Pagina no encontrada' });
      return;
    }
    const sectionIds = page.sections.map((s) => s.id);
    const [videos, medias] = await Promise.all([
      sectionIds.length > 0
        ? prisma.video.findMany({ where: { sectionId: { in: sectionIds } } })
        : Promise.resolve([]),
      sectionIds.length > 0
        ? prisma.media.findMany({ where: { sectionId: { in: sectionIds } }, orderBy: { order: 'asc' } })
        : Promise.resolve([]),
    ]);
    const sectionsWithMedia = page.sections.map((s) => ({
      ...s,
      videos: videos.filter((v) => v.sectionId === s.id),
      medias: medias.filter((m) => m.sectionId === s.id),
    }));
    res.json({ ...page, sections: sectionsWithMedia });
  } catch {
    res.status(500).json({ message: 'Error al obtener pagina' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id as string },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!page) {
      res.status(404).json({ message: 'Pagina no encontrada' });
      return;
    }
    const sectionIds = page.sections.map((s) => s.id);
    const [videos, medias] = await Promise.all([
      sectionIds.length > 0
        ? prisma.video.findMany({ where: { sectionId: { in: sectionIds } } })
        : Promise.resolve([]),
      sectionIds.length > 0
        ? prisma.media.findMany({ where: { sectionId: { in: sectionIds } }, orderBy: { order: 'asc' } })
        : Promise.resolve([]),
    ]);
    const sectionsWithMedia = page.sections.map((s) => ({
      ...s,
      videos: videos.filter((v) => v.sectionId === s.id),
      medias: medias.filter((m) => m.sectionId === s.id),
    }));
    res.json({ ...page, sections: sectionsWithMedia });
  } catch {
    res.status(500).json({ message: 'Error al obtener pagina' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = pageSchema.parse(req.body);
    const page = await prisma.page.create({ data });
    res.status(201).json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      res.status(409).json({ message: 'El slug ya existe' });
      return;
    }
    res.status(500).json({ message: 'Error al crear pagina' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = pageSchema.partial().parse(req.body);
    const page = await prisma.page.update({ where: { id: req.params.id as string }, data });
    res.json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar pagina' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.page.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Pagina eliminada' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar pagina' });
  }
}
