import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SECTION_TYPES = [
  {
    type: 'hero',
    label: 'Hero (Banner principal)',
    description: 'Seccion de banner principal con imagen/video de fondo, titulo y CTA',
    icon: 'Flame',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'ctaText', label: 'Texto del boton', type: 'text', required: false, default: 'Ver Servicios' },
      { name: 'ctaTarget', label: 'Destino del boton (ID seccion o URL)', type: 'text', required: false, default: 'servicios' },
    ]),
    order: 1,
  },
  {
    type: 'services-grid',
    label: 'Grid de servicios',
    description: 'Grid de tarjetas de servicios, usa imagenes asignadas o fallback JSON',
    icon: 'Grid3X3',
    color: '#4A90D9',
    bgColor: '#EFF6FF',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'ctaText', label: 'Texto del boton', type: 'text', required: false, default: 'Ver Todos los Servicios' },
      { name: 'ctaLink', label: 'Enlace del boton', type: 'text', required: false, default: '/servicios' },
    ]),
    order: 2,
  },
  {
    type: 'content',
    label: 'Contenido (Texto + imagen)',
    description: 'Bloque de contenido con diferentes layouts de texto e imagenes',
    icon: 'FileText',
    color: '#4A90D9',
    bgColor: '#EFF6FF',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'paragraphs', label: 'Parrafos', type: 'array-text', required: false },
      { name: 'layout', label: 'Layout', type: 'select', options: ['text-only', 'text-left', 'text-right', 'two-col'], required: false, default: 'text-only' },
      { name: 'bgColor', label: 'Color de fondo', type: 'select', options: ['white', 'dark', 'gray'], required: false, default: 'white' },
    ]),
    order: 3,
  },
  {
    type: 'gallery',
    label: 'Galeria de imagenes',
    description: 'Galeria filtrable de imagenes, usa medias asignadas o items JSON',
    icon: 'Image',
    color: '#10B981',
    bgColor: '#F0FDF4',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
    ]),
    order: 4,
  },
  {
    type: 'brands',
    label: 'Marcas / Logos',
    description: 'Seccion de marcas/logos, usa medias asignadas o lista JSON',
    icon: 'Award',
    color: '#E8913A',
    bgColor: '#FFF7ED',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
    ]),
    order: 5,
  },
  {
    type: 'clubs',
    label: 'Clubes / Mapa',
    description: 'Mapa y lista de clubes nauticos',
    icon: 'MapPin',
    color: '#4A90D9',
    bgColor: '#EFF6FF',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'mapUrl', label: 'URL del mapa (iframe)', type: 'text', required: false },
      { name: 'clubs', label: 'Clubes', type: 'array-object', fields: [{ name: 'id', label: 'ID', type: 'text' }, { name: 'name', label: 'Nombre', type: 'text' }, { name: 'location', label: 'Ubicacion', type: 'text' }, { name: 'mapLink', label: 'Enlace Google Maps', type: 'text', required: false }], required: false },
    ]),
    order: 6,
  },
  {
    type: 'weather-apps',
    label: 'Apps recomendadas',
    description: 'Tarjetas de aplicaciones recomendadas para navegacion',
    icon: 'Cloud',
    color: '#10B981',
    bgColor: '#F0FDF4',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
    ]),
    order: 7,
  },
  {
    type: 'maintenance',
    label: 'Mantenimiento (Carrusel)',
    description: 'Carrusel antes/despues de trabajos de mantenimiento',
    icon: 'Wrench',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'slides', label: 'Diapositivas', type: 'array-object', fields: [{ name: 'beforeImage', label: 'Imagen antes', type: 'text' }, { name: 'afterImage', label: 'Imagen despues', type: 'text' }], required: false },
    ]),
    order: 8,
  },
  {
    type: 'contact',
    label: 'Contacto + Formulario',
    description: 'Formulario de contacto con informacion lateral',
    icon: 'Mail',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'email', label: 'Email', type: 'text', required: false },
      { name: 'phone', label: 'Telefono', type: 'text', required: false },
      { name: 'location', label: 'Ubicacion', type: 'text', required: false },
    ]),
    order: 9,
  },
  {
    type: 'page-header',
    label: 'Header de pagina',
    description: 'Encabezado de pagina con breadcrumb y fondo opcional',
    icon: 'PanelTop',
    color: '#64748B',
    bgColor: '#F1F5F9',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
    ]),
    order: 10,
  },
  {
    type: 'stats',
    label: 'Estadisticas',
    description: 'Contadores animados con numeros destacados',
    icon: 'BarChart3',
    color: '#E8913A',
    bgColor: '#FFF7ED',
    configSchema: JSON.stringify([
      { name: 'stats', label: 'Estadisticas', type: 'array-object', fields: [{ name: 'number', label: 'Numero', type: 'number' }, { name: 'suffix', label: 'Sufijo', type: 'text' }, { name: 'label', label: 'Etiqueta', type: 'text' }], required: false },
    ]),
    order: 11,
  },
  {
    type: 'cta',
    label: 'Llamada a la accion',
    description: 'Banner de llamada a la accion con texto y boton',
    icon: 'Flame',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    configSchema: JSON.stringify([
      { name: 'description', label: 'Descripcion', type: 'textarea', required: false },
      { name: 'ctaText', label: 'Texto del boton', type: 'text', required: false },
      { name: 'ctaLink', label: 'Enlace del boton', type: 'text', required: false },
      { name: 'icon', label: 'Icono (nombre Lucide)', type: 'text', required: false },
    ]),
    order: 12,
  },
  {
    type: 'info-cards',
    label: 'Tarjetas de info',
    description: 'Tarjetas de informacion de contacto u otros datos',
    icon: 'Grid3X3',
    color: '#4A90D9',
    bgColor: '#EFF6FF',
    configSchema: JSON.stringify([
      { name: 'cards', label: 'Tarjetas', type: 'array-object', fields: [{ name: 'icon', label: 'Icono', type: 'text' }, { name: 'label', label: 'Etiqueta', type: 'text' }, { name: 'value', label: 'Valor', type: 'text' }, { name: 'subtext', label: 'Subtexto', type: 'text' }, { name: 'href', label: 'Enlace', type: 'text' }], required: false },
    ]),
    order: 13,
  },
  {
    type: 'values',
    label: 'Valores empresa',
    description: 'Grid de valores o principios de la empresa',
    icon: 'HeartHandshake',
    color: '#10B981',
    bgColor: '#F0FDF4',
    configSchema: JSON.stringify([
      { name: 'values', label: 'Valores', type: 'array-object', fields: [{ name: 'icon', label: 'Icono', type: 'text' }, { name: 'title', label: 'Titulo', type: 'text' }, { name: 'description', label: 'Descripcion', type: 'textarea' }], required: false },
    ]),
    order: 14,
  },
  {
    type: 'service-categories',
    label: 'Categorias de servicios',
    description: 'Tres categorias de servicios con caracteristicas',
    icon: 'Layers',
    color: '#4A90D9',
    bgColor: '#EFF6FF',
    configSchema: JSON.stringify([
      { name: 'categories', label: 'Categorias', type: 'array-object', fields: [{ name: 'icon', label: 'Icono', type: 'text' }, { name: 'title', label: 'Titulo', type: 'text' }, { name: 'description', label: 'Descripcion', type: 'textarea' }, { name: 'features', label: 'Caracteristicas (array)', type: 'array-text' }], required: false },
    ]),
    order: 15,
  },
  {
    type: 'service-detail',
    label: 'Detalle de servicios',
    description: 'Detalle de servicios con slider de imagenes y patron A/B',
    icon: 'Wrench',
    color: '#E8913A',
    bgColor: '#FFF7ED',
    configSchema: JSON.stringify([
      { name: 'services', label: 'Servicios', type: 'array-object', fields: [{ name: 'overline', label: 'Etiqueta superior', type: 'text' }, { name: 'title', label: 'Titulo', type: 'text' }, { name: 'description', label: 'Descripcion', type: 'textarea' }, { name: 'features', label: 'Caracteristicas', type: 'array-text' }, { name: 'images', label: 'Imagenes', type: 'array-text' }, { name: 'pattern', label: 'Patron', type: 'select', options: ['A', 'B'] }, { name: 'bgColor', label: 'Color fondo', type: 'select', options: ['white', 'dark', 'gray'] }], required: false },
    ]),
    order: 16,
  },
];

async function main() {
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@fjrservices.com' } });
  if (!adminExists) {
    // Users
    await prisma.user.createMany({
      data: [
        {
          id: 'u1',
          name: 'Administrador',
          email: 'admin@fjrservices.com',
          password: await bcrypt.hash('admin123', 12),
          role: 'admin',
          status: 'active',
        },
        {
          id: 'u2',
          name: 'Editor',
          email: 'editor@fjrservices.com',
          password: await bcrypt.hash('editor123', 12),
          role: 'editor',
          status: 'active',
        },
      ],
      skipDuplicates: true,
    });

    // Pages
    await prisma.page.createMany({
      data: [
        { id: 'p1', title: 'Inicio', slug: 'inicio', description: 'Pagina principal con hero, servicios, galeria y mas', active: true, useDynamicContent: true, order: 1 },
        { id: 'p2', title: 'Servicios', slug: 'servicios', description: 'Detalle de servicios maritimos ofrecidos', active: true, useDynamicContent: true, order: 2 },
        { id: 'p3', title: 'Nosotros', slug: 'nosotros', description: 'Informacion sobre FJR Services', active: true, useDynamicContent: true, order: 3 },
        { id: 'p4', title: 'Contacto', slug: 'contacto', description: 'Formulario e informacion de contacto', active: true, useDynamicContent: true, order: 4 },
      ],
      skipDuplicates: true,
    });

    // Sections
    await prisma.section.createMany({
      data: [
        // Home
        { id: 's1', pageId: 'p1', title: 'FJR SERVICES', subtitle: 'Reparacion y Mantenimiento de Embarcaciones', content: '{"description":"Especialistas en mecanica, pintura y electronica naval. Resultados garantizados para que solo te preocupes de navegar.","ctaText":"Ver Servicios","ctaTarget":"servicios"}', type: 'hero', active: true, order: 1, imageUrl: '/hero-yacht.jpg' },
        { id: 's2', pageId: 'p1', title: 'Servicios', subtitle: 'Servicios Ofrecidos', content: '{"description":"Conocimiento en la manipulacion de los siguientes elementos","ctaText":"Ver Todos los Servicios","ctaLink":"/servicios"}', type: 'services-grid', active: true, order: 2 },
        { id: 's3', pageId: 'p1', title: 'Experiencia', subtitle: 'Trabajos', content: '{"description":"A continuacion una recopilacion de algunos de nuestros trabajos"}', type: 'gallery', active: true, order: 3 },
        { id: 's4', pageId: 'p1', title: 'Confianza', subtitle: 'Marcas', content: '{"description":"Tenemos experiencia en las siguientes marcas"}', type: 'brands', active: true, order: 4 },
        { id: 's5', pageId: 'p1', title: 'Ubicacion', subtitle: 'Clubes Nauticos y Puertos', content: '{"description":"Trabajamos en los principales clubes nauticos de la Region de Murcia","clubs":[{"id":"1","name":"Club Nautico de Cartagena","location":"Cartagena, Murcia","mapLink":"https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Cartagena,+Cartagena,+Espa%C3%B1a"},{"id":"2","name":"Club Nautico Dos Mares","location":"La Manga del Mar Menor","mapLink":"https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Dos+Mares,+La+Manga+del+Mar+Menor,+Espa%C3%B1a"},{"id":"3","name":"Club Nautico Los Alcazares","location":"Los Alcazares","mapLink":"https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Los+Alc%C3%A1zares,+Los+Alc%C3%A1zares,+Espa%C3%B1a"},{"id":"4","name":"Puerto Deportivo San Pedro del Pinatar","location":"San Pedro del Pinatar","mapLink":"https://www.google.com/maps/search/?api=1&query=Puerto+Deportivo+San+Pedro+del+Pinatar,+San+Pedro+del+Pinatar,+Espa%C3%B1a"}]}', type: 'clubs', active: true, order: 5 },
        { id: 's6', pageId: 'p1', title: 'No Pierdas el Rumbo', subtitle: 'Recomendaciones', content: '{"description":"Herramientas utiles para tu navegacion"}', type: 'weather-apps', active: true, order: 6 },
        { id: 's7', pageId: 'p1', title: 'Mantenimiento', subtitle: 'La Importancia del Mantenimiento Preventivo', content: '{"description":"Las embarcaciones de recreo estan expuestas a factores ambientales como el agua salada, el viento, el sol, la lluvia, el frio y el calor. Un mantenimiento preventivo regular no solo prolonga la vida util de tu embarcacion, sino que evita costosas averias inesperadas y garantiza tu seguridad en el mar."}', type: 'maintenance', active: true, order: 7 },
        { id: 's8', pageId: 'p1', title: 'Contacto', subtitle: 'Hablamos?', content: '{"description":"Cuentanos que necesitas y te daremos la mejor solucion","email":"info@fjrservices.com","phone":"474-937-8270","location":"Region de Murcia, Espana"}', type: 'contact', active: true, order: 8, imageUrl: '/contact-marina.jpg' },
        // Services
        { id: 's9', pageId: 'p2', title: 'Servicios', subtitle: 'Nuestros Servicios', content: '{"description":"Ofrecemos un servicio integral de reparacion y mantenimiento de embarcaciones de recreo. Desde la mecanica de motores hasta la pintura de obra muerta, cubrimos todas las necesidades de tu barco."}', type: 'page-header', active: true, order: 1 },
        { id: 's10', pageId: 'p2', title: 'Categorias', subtitle: 'Areas de Especializacion', content: '{"description":"Nuestros servicios se organizan en tres areas principales para cubrir todas tus necesidades."}', type: 'content', active: true, order: 2 },
        { id: 's11', pageId: 'p2', title: 'Detalle', subtitle: 'Servicios Especializados', content: '{"description":"Conoce a fondo cada uno de nuestros servicios y como pueden ayudarte a mantener tu embarcacion en perfectas condiciones."}', type: 'content', active: true, order: 3 },
        { id: 's12', pageId: 'p2', title: 'CTA', subtitle: 'Listo para Navegar con Tranquilidad?', content: '{"description":"Contacta con nosotros y te haremos un presupuesto a medida para tu embarcacion.","ctaText":"Contactar Ahora","ctaLink":"/contacto"}', type: 'cta', active: true, order: 4 },
        // About
        { id: 's13', pageId: 'p3', title: 'Nosotros', subtitle: 'Sobre Nosotros', content: '{"description":"Mas de 20 anos de experiencia en el sector naval"}', type: 'page-header', active: true, order: 1, imageUrl: '/about-sunset.jpg' },
        { id: 's14', pageId: 'p3', title: 'Bienvenido', subtitle: 'Quienes Somos', content: '{"paragraphs":["FJR Services nace de la pasion de Francisco Javier Rivero Sanchez por el mundo nautico. Con mas de dos decadas de experiencia en el sector naval, hemos construido una reputacion solida basada en la calidad del trabajo, la honestidad y el compromiso con cada cliente.","Nuestra empresa se especializa en la reparacion y mantenimiento integral de embarcaciones de recreo. Desde motores intraborda hasta sistemas de refrigeracion, pasando por la pintura de obra muerta y el aislamiento de salas de maquinas, ofrecemos un servicio completo que cubre todas las necesidades de tu barco.","Trabajamos en los principales clubes nauticos y puertos de la Region de Murcia, incluyendo Cartagena, La Manga, Los Alcazares y San Pedro del Pinatar. Nuestra proximidad y disponibilidad garantizan una respuesta rapida ante cualquier necesidad."],"images":["/about-welcome-1.jpg","/about-welcome-2.jpg"],"layout":"text-left"}', type: 'content', active: true, order: 2 },
        { id: 's15', pageId: 'p3', title: 'Nuestros Valores', subtitle: 'Lo Que Nos Define', content: '{}', type: 'values', active: true, order: 3 },
        { id: 's16', pageId: 'p3', title: 'Experiencia', subtitle: 'Numeros que Hablan', content: '{}', type: 'stats', active: true, order: 4 },
        { id: 's17', pageId: 'p3', title: 'CTA', subtitle: 'Quieres formar parte de nuestra historia?', content: '{"ctaText":"Contactar","ctaLink":"/contacto"}', type: 'cta', active: true, order: 5 },
        // Contact
        { id: 's18', pageId: 'p4', title: 'Contacto', subtitle: 'Contacto', content: '{"description":"Estamos aqui para ayudarte. Cuentanos que necesitas y te responderemos en menos de 24 horas."}', type: 'page-header', active: true, order: 1 },
        { id: 's19', pageId: 'p4', title: 'Info', subtitle: 'Informacion de Contacto', content: '{}', type: 'info-cards', active: true, order: 2 },
        { id: 's20', pageId: 'p4', title: 'Formulario', subtitle: 'Envianos un Mensaje', content: '{"description":"Rellena el formulario y te contactaremos lo antes posible."}', type: 'contact', active: true, order: 3 },
        { id: 's21', pageId: 'p4', title: 'CTA', subtitle: 'Respuesta Garantizada en 24h', content: '{"description":"Entendemos que cada dia sin tu embarcacion cuenta. Por eso nos comprometemos a responderte en menos de 24 horas con un presupuesto detallado y un plan de accion."}', type: 'cta', active: true, order: 4 },
      ],
      skipDuplicates: true,
    });

    // Clients
    await prisma.client.createMany({
      data: [
        { id: 'c1', name: 'Juan Garcia', email: 'juan@email.com', phone: '+1 305-123-4567', project: 'Reparacion de casco', status: 'active', token: 'token-juan-001' },
        { id: 'c2', name: 'Maria Lopez', email: 'maria@email.com', phone: '+1 305-234-5678', project: 'Mantenimiento de motor', status: 'active', token: 'token-maria-002' },
        { id: 'c3', name: 'Carlos Ruiz', email: 'carlos@email.com', phone: '+1 305-345-6789', project: 'Instalacion electrica', status: 'active', token: 'token-carlos-003' },
        { id: 'c4', name: 'Ana Martinez', email: 'ana@email.com', phone: '+1 305-456-7890', project: 'Pintura y acabados', status: 'inactive', token: 'token-ana-004' },
        { id: 'c5', name: 'Pedro Sanchez', email: 'pedro@email.com', phone: '+1 305-567-8901', project: 'Reparacion de helice', status: 'active', token: 'token-pedro-005' },
      ],
      skipDuplicates: true,
    });
  }

  // Section Types (siempre seed/upsert para mantener actualizados)
  for (const st of SECTION_TYPES) {
    await prisma.sectionType.upsert({
      where: { type: st.type },
      update: {
        label: st.label,
        description: st.description,
        icon: st.icon,
        color: st.color,
        bgColor: st.bgColor,
        configSchema: st.configSchema,
        order: st.order,
      },
      create: st,
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
