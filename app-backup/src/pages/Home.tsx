import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Ship,
  Wrench,
  Snowflake,
  Layers,
  Fuel,
  Anchor,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ────────────────────────── DATA ────────────────────────── */
const services = [
  { title: 'Linea de Ejes y Helices', image: '/service-prop-shaft.jpg', icon: Ship },
  { title: 'Motores Intraborda', image: '/service-inboard-engine.jpg', icon: Wrench },
  { title: 'Sistema de Refrigeracion', image: '/service-refrigeration.jpg', icon: Snowflake },
  { title: 'Aislamiento de Sala de Maquinas', image: '/service-insulation.jpg', icon: Layers },
  { title: 'Limpieza de Tanques de Combustible', image: '/service-fuel-tank.jpg', icon: Fuel },
  { title: 'Obra Muerta', image: '/service-underwater.jpg', icon: Anchor },
]

const galleryItems = [
  { id: 1, image: '/gallery-1.jpg', category: 'Motores', title: 'Revision de Motor' },
  { id: 2, image: '/gallery-2.jpg', category: 'Pintura', title: 'Pintura de Casco' },
  { id: 3, image: '/gallery-3.jpg', category: 'Electronica', title: 'Instalacion Electronica' },
  { id: 4, image: '/gallery-4.jpg', category: 'Colaboracion', title: 'Pulido de Helice' },
  { id: 5, image: '/gallery-5.jpg', category: 'Motores', title: 'Rehabilitacion de Sala' },
  { id: 6, image: '/gallery-6.jpg', category: 'Electronica', title: 'Instalacion AC' },
  { id: 7, image: '/gallery-7.jpg', category: 'Colaboracion', title: 'Limpieza de Deposito' },
  { id: 8, image: '/gallery-8.jpg', category: 'Pintura', title: 'Restauracion Interior' },
]

const galleryFilters = ['Todos', 'Colaboracion', 'Motores', 'Pintura', 'Electronica']

const brands = [
  { name: 'Caterpillar', color: '#FFCC00' },
  { name: 'Volvo Penta', color: '#003B7E' },
  { name: 'Yanmar', color: '#E60012' },
  { name: 'Cummins', color: '#E31937' },
  { name: 'Kohler', color: '#001E4F' },
  { name: 'Fischer Panda', color: '#000000' },
]

const clubs = [
  { id: 1, name: 'Club Nautico de Cartagena', location: 'Cartagena, Murcia' },
  { id: 2, name: 'Club Nautico Dos Mares', location: 'La Manga del Mar Menor' },
  { id: 3, name: 'Club Nautico Los Alcazares', location: 'Los Alcazares' },
  { id: 4, name: 'Puerto Deportivo San Pedro del Pinatar', location: 'San Pedro del Pinatar' },
]

/* ────────────────────────── HOME PAGE ────────────────────────── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <BrandsSection />
      <ClubsSection />
      <WeatherAppsSection />
      <MaintenanceSection />
      <ContactSection />
    </div>
  )
}

/* ═══════════════════════════  SECTION 1: HERO  ═══════════════════════════ */
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const overlineRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline()
    tl.fromTo(overlineRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 })
      .fromTo(headingRef.current, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'expo.out' }, '-=0.2')
      .fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
  }, { scope: heroRef })

  const scrollToServices = () => {
    const el = document.getElementById('servicios')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={heroRef} className="relative w-full min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background Image with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-yacht.jpg"
          alt="Luxury yacht"
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.3) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-[72px]">
        <div className="max-w-[640px] py-20 md:py-32">
          <div ref={overlineRef} className="opacity-0">
            <span className="text-[12px] uppercase tracking-[0.15em] text-[#7DB8F0] font-inter font-semibold">
              FJR SERVICES
            </span>
          </div>

          <h1
            ref={headingRef}
            className="mt-4 text-[40px] md:text-[48px] lg:text-[64px] font-outfit font-bold text-white leading-[1.1] tracking-[-0.02em]"
            style={{ textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}
          >
            Reparacion y Mantenimiento de Embarcaciones
          </h1>

          <p
            ref={descRef}
            className="mt-6 text-[17px] leading-[1.7] text-[rgba(255,255,255,0.8)] max-w-[520px] opacity-0"
          >
            Especialistas en mecanica, pintura y electronica naval. Resultados garantizados para que solo te preocupes de navegar.
          </p>

          <div ref={ctaRef} className="mt-8 opacity-0">
            <button
              onClick={scrollToServices}
              className="bg-[#E8913A] text-white text-[13px] uppercase font-semibold tracking-[0.08em] px-8 py-[14px] font-inter transition-all duration-300 hover:bg-[#D47A2A] hover:-translate-y-px hover:shadow-lg"
            >
              Ver Servicios
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] transition-colors animate-bounce-chevron"
        aria-label="Desplazar hacia abajo"
      >
        <ChevronDown size={24} />
      </button>
    </section>
  )
}

/* ═══════════════════════════  SECTION 2: SERVICES  ═══════════════════════════ */
function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.service-card'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section id="servicios" ref={sectionRef} className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#4A90D9] font-inter font-semibold">
            Servicios
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-[#1F2937]">
            Servicios Ofrecidos
          </h2>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Conocimiento en la manipulacion de los siguientes elementos
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/servicios"
            className="inline-block border border-[#4A90D9] text-[#4A90D9] text-[13px] uppercase font-semibold tracking-[0.08em] px-8 py-[14px] font-inter transition-all duration-300 hover:bg-[#4A90D9] hover:text-white"
          >
            Ver Todos los Servicios
          </Link>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ title, image, icon: Icon }: { title: string; image: string; icon: React.ElementType }) {
  return (
    <div className="service-card group bg-white border border-[#E5E7EB] overflow-hidden transition-all duration-[400ms] hover:shadow-lg hover:border-[#4A90D9] cursor-pointer">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
        />
      </div>
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon size={20} className="text-[#4A90D9]" />
          <h3 className="text-[18px] font-semibold text-[#1F2937] font-outfit">
            {title}
          </h3>
        </div>
        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-[#4A90D9] w-0 group-hover:w-full transition-all duration-500" />
      </div>
    </div>
  )
}

/* ═══════════════════════════  SECTION 3: GALLERY  ═══════════════════════════ */
function GallerySection() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const sectionRef = useRef<HTMLDivElement>(null)

  const filteredItems =
    activeFilter === 'Todos'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter)

  return (
    <section id="trabajos" ref={sectionRef} className="py-20 md:py-24 bg-[#F9F6F0]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#4A90D9] font-inter font-semibold">
            Experiencia
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-[#1F2937]">
            Trabajos
          </h2>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            A continuacion una recopilacion de algunos de nuestros trabajos
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {galleryFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={
                'px-5 py-2 text-[13px] font-inter font-medium transition-all duration-300 border ' +
                (activeFilter === filter
                  ? 'bg-[#E8913A] text-white border-[#E8913A]'
                  : 'bg-transparent text-[#6B7280] border-[#D1D5DB] hover:border-[#4A90D9] hover:text-[#4A90D9]')
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <GalleryCard key={item.id} {...item} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function GalleryCard({ image, category, title }: { image: string; category: string; title: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35 }}
      className="group relative aspect-square overflow-hidden cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.08]"
      />
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-[rgba(10,22,40,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] flex flex-col justify-end p-4">
        <span className="text-[12px] uppercase tracking-[0.1em] text-[#E8913A] font-inter font-semibold">
          {category}
        </span>
        <span className="text-[14px] text-white font-outfit font-medium mt-1">
          {title}
        </span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════  SECTION 4: BRANDS  ═══════════════════════════ */
function BrandsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.brand-item'),
      { opacity: 0 },
      {
        opacity: 0.6,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section id="marcas" ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#4A90D9] font-inter font-semibold">
            Confianza
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-[#1F2937]">
            Marcas
          </h2>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Tenemos experiencia en las siguientes marcas
          </p>
        </div>

        {/* Brands Row */}
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {brands.map((brand) => (
            <BrandSVG key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandSVG({ brand }: { brand: { name: string; color: string } }) {
  return (
    <div
      className="brand-item group flex items-center justify-center min-w-[120px] min-h-[50px] cursor-pointer opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105"
      title={brand.name}
    >
      <BrandLogo name={brand.name} color={brand.color} />
    </div>
  )
}

function BrandLogo({ name, color }: { name: string; color: string }) {
  switch (name) {
    case 'Caterpillar':
      return (
        <svg viewBox="0 0 140 36" className="h-8 w-auto">
          <rect x="2" y="2" width="34" height="32" rx="2" fill={color} />
          <text x="10" y="24" fill="#000" fontSize="16" fontWeight="bold" fontFamily="Arial">CAT</text>
          <text x="44" y="24" fill="#666" fontSize="16" fontWeight="bold" fontFamily="Arial" letterSpacing="-0.5">CATERPILLAR</text>
        </svg>
      )
    case 'Volvo Penta':
      return (
        <svg viewBox="0 0 140 36" className="h-8 w-auto">
          <circle cx="16" cy="18" r="14" fill={color} />
          <text x="5" y="23" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Arial">VOLVO</text>
          <text x="36" y="23" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">PENTA</text>
        </svg>
      )
    case 'Yanmar':
      return (
        <svg viewBox="0 0 120 36" className="h-8 w-auto">
          <text x="0" y="24" fill={color} fontSize="18" fontWeight="bold" fontFamily="Arial" letterSpacing="2">YANMAR</text>
        </svg>
      )
    case 'Cummins':
      return (
        <svg viewBox="0 0 160 36" className="h-8 w-auto">
          <circle cx="16" cy="18" r="14" stroke={color} strokeWidth="3" fill="none" />
          <text x="6" y="24" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">C</text>
          <text x="36" y="24" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">CUMMINS</text>
        </svg>
      )
    case 'Kohler':
      return (
        <svg viewBox="0 0 120 36" className="h-8 w-auto">
          <text x="0" y="24" fill={color} fontSize="18" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1">KOHLER</text>
        </svg>
      )
    case 'Fischer Panda':
      return (
        <svg viewBox="0 0 160 36" className="h-8 w-auto">
          <circle cx="14" cy="18" r="10" fill={color} />
          <text x="10" y="22" fill="#fff" fontSize="12">FP</text>
          <text x="30" y="24" fill="#333" fontSize="14" fontWeight="bold" fontFamily="Arial">FISCHER PANDA</text>
        </svg>
      )
    default:
      return <span className="text-[#6B7280] font-semibold text-sm">{name}</span>
  }
}

/* ═══════════════════════════  SECTION 5: CLUBS  ═══════════════════════════ */
function ClubsSection() {
  return (
    <section id="clubes" className="py-20 md:py-24 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#7DB8F0] font-inter font-semibold">
            Ubicacion
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-white">
            Clubes Nauticos y Puertos
          </h2>
          <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.7)]">
            Trabajamos en los principales clubes nauticos de la Region de Murcia
          </p>
        </div>

        {/* Map + Clubs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map */}
          <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] min-h-[350px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d201512!2d-1.2108!3d37.6257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6341c55c83fa51%3A0xe6a0cbd46944e3d4!2sCartagena%2C%20Murcia%2C%20Spain!5e0!3m2!1sen!2ses!4v1700000000000!5m2!1sen!2ses"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px', filter: 'brightness(0.7) hue-rotate(200deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Clubes Nauticos"
            />
          </div>

          {/* Clubs List */}
          <div className="flex flex-col gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="flex items-start gap-4 p-4 border-b border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] group"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8913A] flex items-center justify-center text-white font-bold text-[14px] shrink-0 transition-transform group-hover:scale-110">
                  {club.id}
                </div>
                <div>
                  <h4 className="text-[18px] font-semibold text-white font-outfit">
                    {club.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={14} className="text-[rgba(255,255,255,0.6)]" />
                    <span className="text-[14px] text-[rgba(255,255,255,0.6)]">
                      {club.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════  SECTION 6: WEATHER APPS  ═══════════════════════════ */
function WeatherAppsSection() {
  return (
    <section id="recomendaciones" className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#4A90D9] font-inter font-semibold">
            No Pierdas el Rumbo
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-[#1F2937]">
            Recomendaciones
          </h2>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Herramientas utiles para tu navegacion
          </p>
        </div>

        {/* App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ventusky */}
          <AppCard
            icon={<VentuskyIcon />}
            title="Ventusky"
            description="Aplicacion meteorologica avanzada con visualizacion de viento, olas y temperatura en tiempo real. Esencial para planificar tu salida al mar."
            link="https://www.ventusky.com"
            linkLabel="Abrir Ventusky"
          />

          {/* VesselFinder */}
          <AppCard
            icon={<VesselFinderIcon />}
            title="VesselFinder"
            description="Seguimiento de embarcaciones en tiempo real. Localiza y rastrea cualquier barco en el mundo con datos AIS actualizados."
            link="https://www.vesselfinder.com"
            linkLabel="Abrir VesselFinder"
          />
        </div>
      </div>
    </section>
  )
}

function AppCard({
  icon,
  title,
  description,
  link,
  linkLabel,
}: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  linkLabel: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-[#F2EEE6] rounded-lg p-8 group"
    >
      <div className="transition-transform duration-300 group-hover:rotate-[5deg] w-fit">
        {icon}
      </div>
      <h3 className="mt-4 text-[20px] font-semibold text-[#1F2937] font-outfit">
        {title}
      </h3>
      <p className="mt-2 text-[15px] text-[#6B7280] leading-[1.7]">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-[#4A90D9] font-inter font-medium hover:underline transition-all"
      >
        {linkLabel}
        <ExternalLink size={14} />
      </a>
    </motion.div>
  )
}

function VentuskyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#4A90D9" />
      <path d="M32 12L16 48H24L32 28L40 48H48L32 12Z" fill="white" />
    </svg>
  )
}

function VesselFinderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#1F3A5F" />
      <path d="M16 44L32 20L48 44H16Z" fill="white" />
      <circle cx="32" cy="16" r="4" fill="white" />
    </svg>
  )
}

/* ═══════════════════════════  SECTION 7: MAINTENANCE  ═══════════════════════════ */
function MaintenanceSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3)

  return (
    <section id="mantenimiento" ref={sectionRef} className="py-20 md:py-24 bg-[#F9F6F0]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#4A90D9] font-inter font-semibold">
            Mantenimiento
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-[#1F2937] max-w-[700px] mx-auto">
            La Importancia del Mantenimiento Preventivo
          </h2>
          <p className="mt-4 text-[15px] text-[#374151] leading-[1.7] max-w-[800px] mx-auto">
            Las embarcaciones de recreo estan expuestas a factores ambientales como el agua salada, el viento, el sol, la lluvia, el frio y el calor. Un mantenimiento preventivo regular no solo prolonga la vida util de tu embarcacion, sino que evita costosas averias inesperadas y garantiza tu seguridad en el mar.
          </p>
        </div>

        {/* Before/After Carousel */}
        <div className="relative mt-12">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {[0, 1, 2].map((slideIdx) => (
                <div key={slideIdx} className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Before */}
                  <div className="relative aspect-[4/3]">
                    <img
                      src="/maintenance-before.jpg"
                      alt="Antes del mantenimiento"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-[#E8913A] text-white text-[12px] uppercase font-semibold tracking-[0.08em] px-3 py-1 font-inter">
                      ANTES
                    </span>
                  </div>
                  {/* After */}
                  <div className="relative aspect-[4/3]">
                    <img
                      src="/maintenance-after.jpg"
                      alt="Despues del mantenimiento"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-[#4A90D9] text-white text-[12px] uppercase font-semibold tracking-[0.08em] px-3 py-1 font-inter">
                      DESPUES
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-[#1F2937] hover:bg-[#F2EEE6] transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-[#1F2937] hover:bg-[#F2EEE6] transition-colors z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((dot) => (
              <button
                key={dot}
                onClick={() => setCurrentSlide(dot)}
                className={
                  'w-2 h-2 rounded-full transition-all duration-300 ' +
                  (currentSlide === dot ? 'bg-[#E8913A]' : 'bg-[#D1D5DB]')
                }
                aria-label={`Ir al slide ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════  SECTION 8: CONTACT  ═══════════════════════════ */
function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder — would connect to form backend
    alert('Formulario enviado (simulado)')
  }

  return (
    <section id="contacto" className="py-20 md:py-24 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#7DB8F0] font-inter font-semibold">
            Contacto
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-outfit font-semibold text-white">
            Hablamos?
          </h2>
          <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.7)]">
            Cuentanos que necesitas y te daremos la mejor solucion
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Info & Image */}
          <div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/contact-marina.jpg"
                alt="Marina"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-[#4A90D9] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Correo Electronico</span>
                  <span className="text-[16px] text-white">info@fjrservices.com</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-[#4A90D9] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Numero de Telefono</span>
                  <span className="text-[16px] text-white">474-937-8270</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[#4A90D9] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Ubicacion</span>
                  <span className="text-[16px] text-white">Region de Murcia, Espana</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField label="Nombre" type="text" placeholder="Tu nombre" required />
            <FormField label="Apellidos" type="text" placeholder="Tus apellidos" required />
            <FormField label="Email" type="email" placeholder="tu@email.com" required />
            <FormField label="Telefono" type="tel" placeholder="+34 600 000 000" required />
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">
                Comentario
              </label>
              <textarea
                rows={4}
                placeholder="En que podemos ayudarte?"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#4A90D9] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E8913A] text-white text-[13px] uppercase font-semibold tracking-[0.08em] py-[14px] font-inter transition-all duration-300 hover:bg-[#D47A2A] hover:-translate-y-px hover:shadow-lg mt-2"
            >
              Enviar
            </button>

            <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-1">
              * Todos los campos son obligatorios
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function FormField({
  label,
  type,
  placeholder,
  required,
}: {
  label: string
  type: string
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#4A90D9] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
      />
    </div>
  )
}
