import { Request, Response } from 'express';
import * as odooService from '../services/odoo.service';

export async function getConfigStatus(req: Request, res: Response): Promise<void> {
  res.json({ configured: odooService.isOdooConfigured() });
}

export async function getClients(req: Request, res: Response): Promise<void> {
  try {
    if (!odooService.isOdooConfigured()) {
      res.status(503).json({ message: 'Odoo no configurado' });
      return;
    }
    const clients = await odooService.getOdooClients();
    res.json(clients);
  } catch (error) {
    console.error('Odoo clients error:', error);
    res.status(500).json({ message: 'Error al obtener clientes de Odoo' });
  }
}

export async function getClientInvoices(req: Request, res: Response): Promise<void> {
  try {
    if (!odooService.isOdooConfigured()) {
      res.status(503).json({ message: 'Odoo no configurado' });
      return;
    }
    const clientId = parseInt(req.params.clientId as string);
    const invoices = await odooService.getClientInvoices(clientId);
    res.json(invoices);
  } catch (error) {
    console.error('Odoo invoices error:', error);
    res.status(500).json({ message: 'Error al obtener facturas' });
  }
}

export async function getClientProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!odooService.isOdooConfigured()) {
      res.status(503).json({ message: 'Odoo no configurado' });
      return;
    }
    const clientId = parseInt(req.params.clientId as string);
    const projects = await odooService.getClientProjects(clientId);
    res.json(projects);
  } catch (error) {
    console.error('Odoo projects error:', error);
    res.status(500).json({ message: 'Error al obtener proyectos' });
  }
}

export async function getClientQuotes(req: Request, res: Response): Promise<void> {
  try {
    if (!odooService.isOdooConfigured()) {
      res.status(503).json({ message: 'Odoo no configurado' });
      return;
    }
    const clientId = parseInt(req.params.clientId as string);
    const quotes = await odooService.getClientQuotes(clientId);
    res.json(quotes);
  } catch (error) {
    console.error('Odoo quotes error:', error);
    res.status(500).json({ message: 'Error al obtener presupuestos' });
  }
}
