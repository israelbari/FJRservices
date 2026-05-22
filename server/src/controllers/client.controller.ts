import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as odooService from '../services/odoo.service';

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  userId: z.string().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const clients = await prisma.client.findMany({
      include: {
        medias: { include: { media: true } },
        projects: {
          include: {
            comments: true,
            timeEntries: { include: { medias: { include: { media: true } } } },
            medias: { include: { media: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch {
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id as string },
      include: {
        medias: { include: { media: true } },
        projects: {
          include: {
            comments: true,
            timeEntries: { include: { medias: { include: { media: true } } } },
            medias: { include: { media: true } },
          },
        },
      },
    });
    if (!client) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    res.json(client);
  } catch {
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
}

export async function getByToken(req: Request, res: Response): Promise<void> {
  try {
    const client = await prisma.client.findUnique({
      where: { token: req.params.token as string },
      include: {
        medias: { include: { media: true } },
        projects: {
          where: { status: 'active' },
          include: {
            comments: { where: { visible: true } },
            timeEntries: { where: { visible: true } },
            medias: {
              where: { visible: true },
              include: { media: true },
            },
          },
        },
      },
    });
    if (!client || client.status !== 'active') {
      res.status(404).json({ message: 'Cliente no encontrado o inactivo' });
      return;
    }
    res.json(client);
  } catch {
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = clientSchema.parse(req.body);
    const token = uuidv4();

    const client = await prisma.client.create({
      data: { ...data, token },
      include: { medias: { include: { media: true } } },
    });

    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      res.status(409).json({ message: 'El email ya esta registrado' });
      return;
    }
    res.status(500).json({ message: 'Error al crear cliente' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = clientSchema.partial().parse(req.body);
    const client = await prisma.client.update({
      where: { id: req.params.id as string },
      data,
      include: { medias: { include: { media: true } } },
    });
    res.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.client.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Cliente eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
}

export async function addMedia(req: Request, res: Response): Promise<void> {
  try {
    const { mediaId } = req.body;
    const link = await prisma.clientMedia.create({
      data: { clientId: req.params.id as string, mediaId },
    });
    res.status(201).json(link);
  } catch {
    res.status(500).json({ message: 'Error al asignar media' });
  }
}

export async function removeMedia(req: Request, res: Response): Promise<void> {
  try {
    await prisma.clientMedia.deleteMany({
      where: { clientId: req.params.id as string, mediaId: req.params.mediaId as string },
    });
    res.json({ message: 'Media desasignada' });
  } catch {
    res.status(500).json({ message: 'Error al desasignar media' });
  }
}

export async function linkOdoo(req: Request, res: Response): Promise<void> {
  try {
    const { odooPartnerId } = req.body;
    const client = await prisma.client.update({
      where: { id: req.params.id as string },
      data: { odooPartnerId: odooPartnerId ? parseInt(odooPartnerId) : null },
      include: {
        medias: { include: { media: true } },
        projects: {
          include: {
            comments: true,
            timeEntries: { include: { medias: { include: { media: true } } } },
            medias: { include: { media: true } },
          },
        },
      },
    });
    res.json(client);
  } catch {
    res.status(500).json({ message: 'Error al vincular con Odoo' });
  }
}

export async function syncOdooProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!odooService.isOdooConfigured()) {
      res.status(503).json({ message: 'Odoo no configurado' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: req.params.id as string },
    });
    if (!client || !client.odooPartnerId) {
      res.status(400).json({ message: 'Cliente no vinculado con Odoo' });
      return;
    }

    const odooProjects = await odooService.getPartnerProjects(client.odooPartnerId);

    const existingProjects = await prisma.project.findMany({
      where: { clientId: client.id },
    });

    const odooIds = new Set<number>();

    for (const op of odooProjects as Array<{ id: number; name: string; description?: string | false }>) {
      odooIds.add(op.id);
      const existing = existingProjects.find(p => p.odooProjectId === op.id);
      const desc = typeof op.description === 'string' ? op.description : null;

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: { name: op.name, description: desc },
        });
      } else {
        await prisma.project.create({
          data: {
            clientId: client.id,
            name: op.name,
            description: desc,
            odooProjectId: op.id,
            status: 'active',
          },
        });
      }
    }

    // Optionally deactivate projects that no longer exist in Odoo
    for (const ep of existingProjects) {
      if (ep.odooProjectId && !odooIds.has(ep.odooProjectId)) {
        await prisma.project.update({
          where: { id: ep.id },
          data: { status: 'inactive' },
        });
      }
    }

    const updated = await prisma.client.findUnique({
      where: { id: req.params.id as string },
      include: {
        medias: { include: { media: true } },
        projects: {
          include: {
            comments: true,
            timeEntries: { include: { medias: { include: { media: true } } } },
            medias: { include: { media: true } },
          },
        },
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Sync Odoo projects error:', error);
    res.status(500).json({ message: 'Error al sincronizar proyectos' });
  }
}
