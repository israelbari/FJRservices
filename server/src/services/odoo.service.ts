import { env } from '../utils/env';

/**
 * Servicio de integracion con Odoo - PREPARADO PERO NO CONECTADO
 *
 * Configurar las variables de entorno ODOO_* cuando se tenga acceso a la API.
 * Este servicio implementa lectura SOLO (search_read, read) via JSON-RPC.
 */

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

function getConfig(): OdooConfig | null {
  if (!env.ODOO_URL || !env.ODOO_DB || !env.ODOO_USERNAME || !env.ODOO_API_KEY) {
    return null;
  }
  return {
    url: env.ODOO_URL,
    db: env.ODOO_DB,
    username: env.ODOO_USERNAME,
    apiKey: env.ODOO_API_KEY,
  };
}

async function odooJsonRpc(
  endpoint: string,
  service: string,
  method: string,
  args: unknown[]
): Promise<unknown> {
  const config = getConfig();
  if (!config) {
    throw new Error('Odoo no configurado. Revise las variables de entorno ODOO_*');
  }

  const response = await fetch(`${config.url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Math.floor(Math.random() * 1000000),
    }),
  });

  const data = await response.json() as { error?: unknown; result?: unknown };
  if (data.error) {
    throw new Error(`Odoo error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

let uidCache: number | null = null;

async function authenticate(): Promise<number> {
  if (uidCache) return uidCache;
  const config = getConfig();
  if (!config) throw new Error('Odoo no configurado');

  const uid = (await odooJsonRpc(
    '/jsonrpc',
    'common',
    'authenticate',
    [config.db, config.username, config.apiKey, {}]
  )) as number;

  uidCache = uid;
  return uid;
}

export async function searchRead(
  model: string,
  domain: unknown[][] = [],
  fields: string[] = [],
  limit = 100
): Promise<unknown[]> {
  const uid = await authenticate();
  const config = getConfig()!;

  const result = await odooJsonRpc('/jsonrpc', 'object', 'execute_kw', [
    config.db,
    uid,
    config.apiKey,
    model,
    'search_read',
    [domain],
    { fields, limit },
  ]);

  return (result as unknown[]) || [];
}

export async function read(model: string, ids: number[], fields: string[] = []): Promise<unknown[]> {
  const uid = await authenticate();
  const config = getConfig()!;

  const result = await odooJsonRpc('/jsonrpc', 'object', 'execute_kw', [
    config.db,
    uid,
    config.apiKey,
    model,
    'read',
    [ids],
    { fields },
  ]);

  return (result as unknown[]) || [];
}

// Cache en memoria simple (5 minutos)
const cache = new Map<string, { data: unknown; expires: number }>();

export async function searchReadCached(
  model: string,
  domain: unknown[][] = [],
  fields: string[] = [],
  limit = 100,
  cacheSeconds = 300
): Promise<unknown[]> {
  const key = `${model}:${JSON.stringify(domain)}:${JSON.stringify(fields)}:${limit}`;
  const cached = cache.get(key);

  if (cached && cached.expires > Date.now()) {
    return cached.data as unknown[];
  }

  const data = await searchRead(model, domain, fields, limit);
  cache.set(key, { data, expires: Date.now() + cacheSeconds * 1000 });
  return data;
}

export async function getClientInvoices(clientId: number): Promise<unknown[]> {
  return searchReadCached(
    'account.move',
    [['partner_id', '=', clientId], ['move_type', '=', 'out_invoice']],
    ['name', 'amount_total', 'invoice_date', 'payment_state', 'state'],
    50,
    300
  );
}

export async function getClientProjects(clientId: number): Promise<unknown[]> {
  return searchReadCached(
    'project.project',
    [['partner_id', '=', clientId]],
    ['name', 'date_start', 'date_end', 'user_id', 'state'],
    50,
    300
  );
}

export async function getClientQuotes(clientId: number): Promise<unknown[]> {
  return searchReadCached(
    'sale.order',
    [['partner_id', '=', clientId]],
    ['name', 'amount_total', 'date_order', 'state'],
    50,
    300
  );
}

export async function getOdooClients(): Promise<unknown[]> {
  return searchReadCached(
    'res.partner',
    [['customer_rank', '>', 0]],
    ['id', 'name', 'email', 'phone', 'mobile', 'city', 'country_id'],
    1000,
    600
  );
}

export function isOdooConfigured(): boolean {
  return getConfig() !== null;
}
