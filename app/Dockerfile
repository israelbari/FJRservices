# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (mejor cacheo)
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Stage 2: Servir con nginx
FROM nginx:1.27-alpine

# Copiar configuración personalizada de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
