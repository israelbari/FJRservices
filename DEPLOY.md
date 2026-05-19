# Guia de Deploy - FJR Services

Deploy completo con Docker Compose. Un solo comando levanta todo: PostgreSQL, MinIO, Backend (Express), Frontend (React) y Nginx.

---

## Requisitos

- Docker + Docker Compose
- Git
- Dominio apuntando al servidor (opcional, funciona con IP)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/israelbari/fjrservices.git
cd fjrservices
```

---

## 2. Configurar variables de entorno

Copiar el archivo de ejemplo y editar:

```bash
cp .env.example .env
nano .env   # o vim, o cualquier editor
```

### Variables obligatorias:

```env
# Database
POSTGRES_USER=fjruser
POSTGRES_PASSWORD=TU_PASSWORD_SEGURA_AQUI
POSTGRES_DB=fjrservices

# MinIO
MINIO_ROOT_USER=fjrminio
MINIO_ROOT_PASSWORD=TU_PASSWORD_MINIO_AQUI

# JWT (minimo 32 caracteres)
JWT_SECRET=una-clave-super-secreta-muy-larga-minimo-32-caracteres
```

> **IMPORTANTE:** Nunca subas el archivo `.env` a Git. Ya esta incluido en `.gitignore`.

---

## 3. Deploy con Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Esto construye y levanta todos los servicios:
- `nginx`   - Proxy reverso en puerto 80
- `frontend` - React SPA compilada
- `backend`  - API Express en puerto 4000 (interno)
- `db`       - PostgreSQL 16
- `minio`    - Object storage

### Primera vez - correr seed

Para crear el usuario admin y datos iniciales:

```bash
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js
```

Credenciales por defecto:
- **Admin:** `admin@fjrservices.com` / `admin123`
- **Editor:** `editor@fjrservices.com` / `editor123`

---

## 4. Acceder a la aplicacion

| Servicio        | URL                                |
|-----------------|------------------------------------|
| Sitio web       | http://TU_IP_O_DOMINIO             |
| Admin Panel     | http://TU_IP_O_DOMINIO/admin       |
| MinIO Console   | http://TU_IP_O_DOMINIO:9001        |
| API             | http://TU_IP_O_DOMINIO/api         |

### Rutas de Nginx

| Ruta         | Destino                                |
|--------------|----------------------------------------|
| `/`          | Frontend (React SPA)                   |
| `/api/`      | Backend Express                        |
| `/storage/`  | MinIO (archivos media, imagenes, videos)|

---

## 5. SSL / HTTPS (Recomendado)

### Opcion A: Cloudflare (mas facil)
1. Apunta tu dominio a Cloudflare
2. Activa "Full (Strict)" SSL
3. Crea un registro A apuntando a la IP del servidor
4. Listo - Cloudflare maneja el SSL

### Opcion B: Let's Encrypt con Certbot

```bash
# Instalar certbot
docker run -it --rm \
  -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  -v "$(pwd)/nginx:/data/nginx" \
  certbot/certbot certonly \
  --standalone -d tudominio.com
```

Luego descomenta las lineas SSL en `nginx/nginx.prod.conf` y reinicia:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 6. Comandos utiles

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Logs de un servicio especifico
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Detener todo
docker compose -f docker-compose.prod.yml down

# Detener y borrar datos (CUIDADO)
docker compose -f docker-compose.prod.yml down -v

# Backup de la base de datos
docker compose -f docker-compose.prod.yml exec db pg_dump -U fjruser fjrservices > backup.sql

# Restaurar base de datos
docker compose -f docker-compose.prod.yml exec -T db psql -U fjruser fjrservices < backup.sql

# Acceder a la base de datos
docker compose -f docker-compose.prod.yml exec db psql -U fjruser -d fjrservices

# Acceder al contenedor del backend
docker compose -f docker-compose.prod.yml exec backend sh
```

---

## 7. Actualizar despues de cambios en el codigo

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

Si hay cambios en la base de datos (nuevas migraciones):

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## 8. Configurar dominio personalizado

Edita `nginx/nginx.prod.conf` y cambia:

```nginx
server_name _;
```

Por:

```nginx
server_name tudominio.com www.tudominio.com;
```

Luego reinicia nginx:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 9. MinIO en produccion

MinIO esta configurado como **private network** (sin puertos expuestos). Los archivos se acceden unicamente a traves de Nginx en `/storage/`.

Para acceder al panel de administracion de MinIO:
- URL: http://TU_IP:9001
- Usuario: valor de `MINIO_ROOT_USER` en `.env`
- Password: valor de `MINIO_ROOT_PASSWORD` en `.env`

Si necesitas exponer el panel de MinIO publicamente, agrega esto al `docker-compose.prod.yml`:

```yaml
minio:
  ports:
    - "9001:9001"
```

> **Nota:** No expongas el puerto 9000 (API S3) publicamente. Usa `/storage/` a traves de Nginx.

---

## 10. Troubleshooting

### Los archivos media no cargan

Verifica que MinIO tenga el bucket `media` publico:

```bash
docker compose -f docker-compose.prod.yml exec backend node -e "
const { minioClient } = require('./dist/services/minio.service');
minioClient.bucketExists('media').then(e => console.log('Bucket exists:', e));
"
```

### Error 502 Bad Gateway

```bash
# Verificar que backend esta corriendo
docker compose -f docker-compose.prod.yml ps

# Ver logs del backend
docker compose -f docker-compose.prod.yml logs backend
```

### Frontend muestra pagina en blanco

```bash
# Reconstruir solo el frontend
docker compose -f docker-compose.prod.yml up -d --build frontend
```

### Problemas de permisos en Windows

Si ves errores `EPERM` con Prisma, asegurate de que no haya procesos de Node corriendo en segundo plano:

```bash
taskkill /F /IM node.exe
```

---

## Arquitectura del Deploy

```
Usuario
  |
  v
+-----------+      +-----------+      +-----------+
|   Nginx   |----->|  Frontend |      |           |
|  (puerto  |      |  (React)  |      |           |
|    80)    |----->|  (puerto  |      |           |
+-----------+      |  interno) |      |           |
  |                +-----------+      |           |
  |                                 |           |
  |-----> /api/  +-----------+      |           |
  |             |  Backend  |<-----|   MinIO   |
  |             | (Express) |      |  (puerto  |
  |             | (puerto   |      |  interno) |
  |             |  4000)    |----->|           |
  |             +-----------+      +-----------+
  |                   |
  |                   v
  |             +-----------+
  |             |    DB     |
  |             | (PostgreSQL|
  |             |  puerto   |
  |             |  5432)    |
  |             +-----------+
  |
  v
/storage/ ----> MinIO (archivos estaticos)
```

---

## Variables de entorno completas

| Variable             | Descripcion                           | Ejemplo                          |
|----------------------|---------------------------------------|----------------------------------|
| `POSTGRES_USER`      | Usuario de PostgreSQL                 | `fjruser`                        |
| `POSTGRES_PASSWORD`  | Password de PostgreSQL                | `password_segura`                |
| `POSTGRES_DB`        | Nombre de la base de datos            | `fjrservices`                    |
| `MINIO_ROOT_USER`    | Usuario de MinIO                      | `fjrminio`                       |
| `MINIO_ROOT_PASSWORD`| Password de MinIO                     | `minio_seguro`                   |
| `JWT_SECRET`         | Clave secreta para JWT                | `clave-super-secreta-32-chars`   |
| `JWT_REFRESH_SECRET` | Clave secreta para refresh tokens     | `clave-refresh-secreta-32-chars` |
| `MINIO_PUBLIC_URL`   | URL publica de MinIO (opcional)       | `https://storage.tudominio.com`  |

---

## Soporte

Si tienes problemas, revisa los logs primero:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Para issues especificos del codigo, abre un issue en: https://github.com/israelbari/fjrservices/issues
