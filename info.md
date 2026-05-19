# Panel de Administracion - FJR Services

## Contexto
Sitio web FJR Services (fjrservices.com) con panel de administracion completo. El sitio tiene 4 paginas publicas (Inicio, Servicios, Nosotros, Contacto) y un sistema de gestion de contenido (CMS) integrado.

## Estructura del Proyecto

```
fjrservices/
├── app/                    # Frontend - React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Componentes publicos
│   │   ├── admin/          # Panel de administracion
│   │   └── lib/            # Utilidades (api.ts, storage.ts)
│   ├── public/             # Assets estaticos
│   ├── Dockerfile          # Build multi-stage con nginx
│   └── nginx.conf          # Config nginx para SPA
├── server/                 # Backend - Express + Prisma + TypeScript
│   ├── src/
│   │   ├── controllers/    # Logica de negocio
│   │   ├── services/       # MinIO, etc.
│   │   └── utils/          # Configuraciones
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de DB
│   │   └── seed.js         # Datos iniciales
│   └── Dockerfile          # Build multi-stage Node.js
├── nginx/
│   └── nginx.prod.conf     # Proxy reverso para produccion
├── docker-compose.yml      # Dev (DB + MinIO solamente)
├── docker-compose.prod.yml # Produccion (todo el stack)
├── .env.example            # Variables de entorno de ejemplo
└── DEPLOY.md               # Guia completa de deploy
```

## Deploy con Docker

Ver archivo completo: **[DEPLOY.md](DEPLOY.md)**

Resumen rapido:

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus passwords

# 2. Deploy
docker compose -f docker-compose.prod.yml up -d --build

# 3. Seed inicial (primera vez)
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js
```

### Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Nginx | 80 | Proxy reverso - unico punto de entrada |
| Frontend | Interno | React SPA compilada |
| Backend | 4000 (interno) | API Express + Prisma |
| PostgreSQL | 5432 (interno) | Base de datos |
| MinIO | 9000/9001 (interno) | Almacenamiento de archivos |

### URLs en produccion

| Ruta | Destino |
|------|---------|
| `/` | Sitio web publico |
| `/admin` | Panel de administracion |
| `/api/` | Backend API |
| `/storage/` | Archivos de MinIO (imagenes, videos) |
| `/cliente/:token` | Portal del cliente (acceso por QR) |

## Datos de Demo

- **Admin:** `admin@fjrservices.com` / `admin123`
- **Editor:** `editor@fjrservices.com` / `editor123`

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v3 + shadcn/ui
- **Backend:** Express + Prisma + TypeScript + MinIO
- **Database:** PostgreSQL 16
- **Storage:** MinIO (S3-compatible)
- **Deploy:** Docker Compose + Nginx

## Comandos utiles

```bash
# Desarrollo local (solo DB + MinIO)
docker compose up -d

# Produccion
docker compose -f docker-compose.prod.yml up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Backup DB
docker compose -f docker-compose.prod.yml exec db pg_dump -U fjruser fjrservices > backup.sql

# Actualizar despues de git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Variables de entorno

Ver `.env.example` para la lista completa.

Las mas importantes:
- `POSTGRES_PASSWORD` - Password de la base de datos
- `MINIO_ROOT_PASSWORD` - Password de MinIO
- `JWT_SECRET` - Clave secreta para tokens (minimo 32 caracteres)

## Repositorio

https://github.com/israelbari/fjrservices
