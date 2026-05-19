# Panel de Administración — Requisitos

## Contexto
Se extiende el sitio web FJR Services (fjrservices.com) con un panel de administración completo. El sitio ya tiene 4 páginas públicas (Inicio, Servicios, Nosotros, Contacto) y ahora necesita un sistema de gestión de contenido (CMS) integrado.

## Requisitos Funcionales

### 1. Sistema de Autenticación
- Login para administradores
- Sesión persistida en localStorage
- Protección de rutas de admin
- Logout

### 2. Dashboard (/admin)
- Estadísticas: usuarios, páginas, imágenes, videos
- Gráfico de actividad
- Accesos rápidos a secciones principales
- Últimos cambios

### 3. CRUD de Páginas (/admin/paginas)
- Listado de las 4 páginas existentes
- Editor de contenido por página (títulos, descripciones, textos)
- Activar/desactivar secciones
- Preview de cambios

### 4. CRUD de Secciones (/admin/secciones)
- Todas las secciones de cada página:
  - Home: Hero, Servicios, Galería, Marcas, Clubes, Apps, Mantenimiento, Contacto, Footer
  - Servicios: Categorías, Detalle de servicios
  - Nosotros: Hero, Bienvenido, Valores, Stats
  - Contacto: Info, Formulario, Ubicaciones
- Editar títulos, subtítulos, descripciones, textos
- Reordenar secciones
- Activar/desactivar

### 5. CRUD de Media (/admin/media)
- Galería de imágenes con vista grid/lista
- Subir nuevas imágenes (file input → base64 → localStorage)
- Organizar en carpetas: Hero, Servicios, Galería, Marcas, Clientes
- Asignar imágenes a secciones
- Previsualizar
- Eliminar
- Videos: URLs embebidas (YouTube, etc.)

### 6. CRUD de Usuarios (/admin/usuarios)
- Tabla con: nombre, email, rol, estado, último acceso
- Roles: Admin, Editor, Cliente
- Crear/editar/eliminar usuarios
- Asignar proyectos a clientes

### 7. Clientes y Proyectos (/admin/clientes)
- Cada cliente tiene proyectos asociados
- Proyecto = conjunto de imágenes/videos de trabajo realizado
- Generar QR único por cliente (acceso a su portal)
- Enviar QR por email (simulado con toast)
- Ver portal del cliente como él lo vería

### 8. Portal del Cliente (/cliente/:token)
- Acceso público sin login (solo el token del QR)
- Muestra imágenes/videos asignados al cliente
- Galería visual del trabajo realizado
- Header con logo FJR Services
- Diseño limpio y profesional

## Datos de Demo
- Admin: admin@fjrservices.com / admin123
- 5 clientes de ejemplo con proyectos
- 20+ imágenes de ejemplo en la galería

## Tech Stack (existente)
- React 19 + TypeScript + Vite + Tailwind CSS v3 + shadcn/ui
- Ya instalado: react-router-dom, framer-motion, recharts, lucide-react
- A instalar: qrcode.react (para generar QR), uuid

## Diseño
- Tema claro profesional (light theme)
- Sidebar de navegación a la izquierda (colapsable)
- Header con breadcrumbs y usuario
- Colores: Navy #0A1628 sidebar, blanco contenido, acentos #4A90D9 y #E8913A
- Tablas con shadcn/ui Table
- Formularios con shadcn/ui Form + react-hook-form + zod
