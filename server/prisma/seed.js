"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@fjrservices.com' } });
    if (adminExists) {
        console.log('Seed already applied');
        return;
    }
    // Users
    await prisma.user.createMany({
        data: [
            {
                id: 'u1',
                name: 'Administrador',
                email: 'admin@fjrservices.com',
                password: await bcryptjs_1.default.hash('admin123', 12),
                role: 'admin',
                status: 'active',
            },
            {
                id: 'u2',
                name: 'Editor',
                email: 'editor@fjrservices.com',
                password: await bcryptjs_1.default.hash('editor123', 12),
                role: 'editor',
                status: 'active',
            },
        ],
        skipDuplicates: true,
    });
    // Pages
    await prisma.page.createMany({
        data: [
            { id: 'p1', title: 'Inicio', slug: 'inicio', description: 'Pagina principal con hero, servicios, galeria y mas', active: true, order: 1 },
            { id: 'p2', title: 'Servicios', slug: 'servicios', description: 'Detalle de servicios maritimos ofrecidos', active: true, order: 2 },
            { id: 'p3', title: 'Nosotros', slug: 'nosotros', description: 'Informacion sobre FJR Services', active: true, order: 3 },
            { id: 'p4', title: 'Contacto', slug: 'contacto', description: 'Formulario e informacion de contacto', active: true, order: 4 },
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
            { id: 's5', pageId: 'p1', title: 'Ubicacion', subtitle: 'Clubes Nauticos y Puertos', content: '{"description":"Trabajamos en los principales clubes nauticos de la Region de Murcia"}', type: 'clubs', active: true, order: 5 },
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
