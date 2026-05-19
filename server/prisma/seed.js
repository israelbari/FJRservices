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
            { id: 's1', pageId: 'p1', title: 'Hero Principal', subtitle: 'Bienvenidos a FJR Services', content: 'Tu socio confiable en servicios maritimos. Reparacion, mantenimiento y venta de equipo naval.', type: 'hero', active: true, order: 1 },
            { id: 's2', pageId: 'p1', title: 'Servicios Destacados', subtitle: 'Lo que ofrecemos', content: 'Resumen de nuestros principales servicios maritimos.', type: 'features', active: true, order: 2 },
            { id: 's3', pageId: 'p1', title: 'Galeria de Proyectos', subtitle: 'Nuestro trabajo', content: 'Coleccion de imagenes de proyectos recientes.', type: 'gallery', active: true, order: 3 },
            { id: 's4', pageId: 'p1', title: 'Estadisticas', subtitle: 'Numeros que respaldan', content: 'Anos de experiencia, proyectos completados y clientes satisfechos.', type: 'stats', active: true, order: 4 },
            { id: 's9', pageId: 'p2', title: 'Hero Servicios', subtitle: 'Nuestros Servicios', content: 'Soluciones integrales para la industria maritima.', type: 'hero', active: true, order: 1 },
            { id: 's10', pageId: 'p2', title: 'Lista de Servicios', subtitle: 'Detalle de servicios', content: 'Descripcion completa de cada servicio ofrecido.', type: 'list', active: true, order: 2 },
            { id: 's14', pageId: 'p3', title: 'Hero Nosotros', subtitle: 'Quienes Somos', content: 'Conoce la historia y mision de FJR Services.', type: 'hero', active: true, order: 1 },
            { id: 's18', pageId: 'p4', title: 'Hero Contacto', subtitle: 'Contactanos', content: 'Estamos aqui para ayudarte con tus necesidades maritimas.', type: 'hero', active: true, order: 1 },
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
//# sourceMappingURL=seed.js.map