import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(['admin', 'editor', 'cliente']).default('cliente'),
  status: z.enum(['active', 'inactive']).default('active'),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(4).optional(),
  role: z.enum(['admin', 'editor', 'cliente']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, name: true, email: true, role: true, status: true, lastLogin: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      res.status(409).json({ message: 'El email ya esta registrado' });
      return;
    }
    res.status(500).json({ message: 'Error al crear usuario' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = updateUserSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true, lastLogin: true },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Usuario eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}
