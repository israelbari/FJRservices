# Datos y Contenedores — IMPORTANTE

> Este documento explica qué datos **NO** se suben a GitHub y cómo preservarlos al cambiar de máquina o reinstalar.

---

## ⚠️ Lo que NO está en GitHub

Git solo almacena **código fuente**. Los siguientes elementos viven únicamente en tu máquina local:

| Elemento | Ubicación local | ¿Por qué no está en Git? |
|---|---|---|
| **Base de datos PostgreSQL** | Volumen Docker `fjrservices_postgres_data` | Datos sensibles y binarios |
| **Archivos de MinIO** | Volumen Docker `fjrservices_minio_data` | Objetos binarios (fotos, videos) |
| **Credenciales (.env)** | `server/.env`, `app/.env` | Passwords, tokens, claves API |
| **node_modules** | `server/node_modules/`, `app/node_modules/` | Dependencias, se regeneran con `npm install` |
| **Builds compiladas** | `app/dist/`, `server/dist/` | Se regeneran con `npm run build` |

---

## 🐳 Contenedores Docker

### `docker-compose.yml` crea estos servicios:

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Frontend  │   │   Backend   │   │   PostgreSQL│   │    MinIO    │
│   (React)   │   │  (Express)  │   │   (Base de  │   │  (Storage)  │
│   :3000     │   │   :4000     │   │    datos)   │   │   :9000     │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### Volúmenes persistentes

```yaml
# docker-compose.yml
volumes:
  postgres_data:  ← Aquí vive tu base de datos
  minio_data:     ← Aquí viven tus fotos y videos
```

**Si eliminas los volúmenes, pierdes TODOS los datos.**

---

## 💾 Cómo hacer backup de los datos

### 1. Backup de PostgreSQL

```bash
# Exportar la base de datos a un archivo SQL
cd server
docker exec fjrservices-postgres-1 pg_dump -U fjruser fjrservices > backup_db_$(date +%Y%m%d).sql
```

### 2. Backup de MinIO (fotos/videos)

```bash
# Copiar los archivos de MinIO a una carpeta local
docker cp fjrservices-minio-1:/data ./backup_minio_$(date +%Y%m%d)
```

### 3. Backup del .env

```bash
# Copiar credenciales (nunca subir a Git)
cp server/.env backup_env_$(date +%Y%m%d).txt
```

---

## 🔄 Cómo restaurar en otra máquina

### 1. Clonar el repositorio

```bash
git clone https://github.com/israelbari/FJRservices.git
cd FJRservices
```

### 2. Crear los archivos .env

Copiar los valores del backup (o crear nuevos):

```bash
# server/.env
DATABASE_URL="postgresql://fjruser:TU_PASSWORD@localhost:5432/fjrservices?schema=public"
JWT_SECRET="tu-jwt-secret-minimo-32-caracteres"
JWT_REFRESH_SECRET="tu-refresh-secret-minimo-32-caracteres"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="fjrminio"
MINIO_SECRET_KEY="tu-minio-password"
MINIO_BUCKET_MEDIA="media"
MINIO_BUCKET_CLIENTS="client-media"
TELEGRAM_BOT_TOKEN="8447984561:AAFduAWaj4UedVarQRNLfjgP3ToH1A_9fNQ"

# Opcional: Odoo
ODOO_URL=""
ODOO_DB=""
ODOO_USERNAME=""
ODOO_API_KEY=""
```

### 3. Levantar los contenedores

```bash
docker-compose up -d
```

### 4. Restaurar la base de datos

```bash
cat backup_db_YYYYMMDD.sql | docker exec -i fjrservices-postgres-1 psql -U fjruser -d fjrservices
```

### 5. Restaurar archivos de MinIO

```bash
docker cp ./backup_minio_YYYYMMDD/. fjrservices-minio-1:/data
```

### 6. Instalar dependencias y aplicar migraciones

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma db push

# Frontend
cd ../app
npm install
```

### 7. Iniciar en desarrollo

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd app
npm run dev
```

---

## 📁 Estructura de volúmenes Docker

```
Docker Volumes
├── fjrservices_postgres_data
│   └── PostgreSQL data files (tablas, índices, etc.)
│
└── fjrservices_minio_data
    ├── media/          ← Fotos públicas del sitio web
    └── client-media/   ← Fotos privadas de clientes (presigned URLs)
```

---

## 🚨 Comandos útiles

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de un servicio
docker logs fjrservices-backend-1 -f
docker logs fjrservices-frontend-1 -f

# Reiniciar un servicio
docker restart fjrservices-backend-1

# Entrar a la base de datos
docker exec -it fjrservices-postgres-1 psql -U fjruser -d fjrservices

# Listar buckets de MinIO
docker exec -it fjrservices-minio-1 mc ls local/

# Backup completo (script)
./scripts/backup.sh   # si existe
```

---

## ❓ Preguntas frecuentes

**¿Puedo borrar `node_modules` sin problema?**
> Sí. Se regenera con `npm install`.

**¿Puedo borrar `app/dist` y `server/dist`?**
> Sí. Se regeneran con `npm run build`.

**¿Puedo borrar los volúmenes Docker?**
> **NO**, a menos que quieras perder TODOS los datos (clientes, proyectos, fotos, horas, etc.).

**¿El token de Telegram se pierde al cambiar de máquina?**
> Sí, porque vive en `server/.env` (no está en Git). Guárdalo en un lugar seguro.

**¿Las fotos subidas por los técnicos desde Telegram se pierden?**
> No, si haces backup del volumen de MinIO. Si no, sí se pierden.

---

## 📞 Soporte

Si necesitas migrar a otra máquina o hacer un backup completo, sigue los pasos de arriba en orden.
