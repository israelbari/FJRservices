import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Wrench,
  ClipboardList,
  Users,
  Anchor,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { usePage } from '@/hooks/usePage'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceCategory {
  icon: typeof Wrench
  title: string
  description: string
  features: string[]
}

interface ServiceDetail {
  overline: string
  title: string
  description: string
  features: string[]
  images: string[]
  pattern: 'A' | 'B'
  bgColor: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const categories: ServiceCategory[] = [
  {
    icon: Wrench,
    title: 'Mantenimiento y Reparacion',
    description:
      'Servicios tecnicos especializados para mantener tu embarcacion en perfectas condiciones.',
    features: [
      'Motores intraborda y fueraborda',
      'Linea de ejes y helices',
      'Sistemas de refrigeracion',
      'Aislamiento de sala de maquinas',
      'Limpieza de tanques de combustible',
      'Obra muerta y pintura',
    ],
  },
  {
    icon: ClipboardList,
    title: 'Gestion y Asesoramiento',
    description:
      'Te acompanamos en todo el proceso de mantenimiento de tu embarcacion.',
    features: [
      'Gestion de mantenimientos periodicos',
      'Asesoramiento tecnico personalizado',
      'Presupuestos detallados sin compromiso',
      'Coordinacion con astilleros y proveedores',
      'Inspecciones pre-compra',
      'Certificaciones y documentacion',
    ],
  },
  {
    icon: Users,
    title: 'Colaboracion y Recomendacion',
    description:
      'Trabajamos con los mejores profesionales del sector para ofrecerte un servicio integral.',
    features: [
      'Colaboracion con astilleros locales',
      'Red de tecnicos especializados',
      'Recomendacion de proveedores de confianza',
      'Servicios de transporte y varada',
      'Electricidad naval',
      'Electronica y navegacion',
    ],
  },
]

const detailedServices: ServiceDetail[] = [
  {
    overline: 'Mecanica Naval',
    title: 'Linea de Ejes y Helices',
    description:
      'La linea de ejes es uno de los sistemas mas criticos de cualquier embarcacion. Nuestro equipo cuenta con la experiencia y las herramientas necesarias para el diagnostico, reparacion y mantenimiento completo de este sistema.',
    features: [
      'Alineacion de ejes y rodamientos',
      'Sustitucion de estopas y retenes',
      'Reparacion y equilibrado de helices',
      'Cambio de ejes y couplings',
      'Inspeccion con endoscopio',
      'Pruebas de estanqueidad',
    ],
    images: ['/service-prop-shaft.jpg', '/gallery-4.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Propulsion',
    title: 'Motores Intraborda',
    description:
      'Especialistas en motores diesel marinos de las principales marcas. Realizamos desde cambios de aceite y filtros hasta reparaciones mayores de motor, incluyendo rectificado de culatas y cambio de segmentos.',
    features: [
      'Revision y puesta a punto de motores',
      'Cambio de aceite, filtros y refrigerante',
      'Rectificado de culatas',
      'Cambio de segmentos y camisas',
      'Reprogramacion de centralitas',
      'Sustitucion de motores completos',
    ],
    images: ['/service-inboard-engine.jpg', '/gallery-1.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
  {
    overline: 'Climatizacion',
    title: 'Sistema de Refrigeracion',
    description:
      'Los sistemas de refrigeracion marina requieren un mantenimiento especifico debido a la corrosion del agua salada. Ofrecemos servicio completo de intercambiadores de calor, circuitos de refrigeracion y aire acondicionado marina.',
    features: [
      'Limpieza de intercambiadores de calor',
      'Reparacion de circuitos de refrigeracion',
      'Instalacion de aire acondicionado marina',
      'Sustitucion de bombas de agua salada',
      'Tratamiento anticorrosion',
      'Recarga de gas refrigerante',
    ],
    images: ['/service-refrigeration.jpg', '/gallery-6.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Confort a Bordo',
    title: 'Aislamiento de Sala de Maquinas',
    description:
      'El aislamiento acustico y termico de la sala de maquinas es fundamental para el confort a bordo. Utilizamos materiales de alta calidad resistentes al fuego y a la humedad marina.',
    features: [
      'Aislamiento acustico de alta densidad',
      'Aislamiento termico ignifugo',
      'Revestimiento de suelos y paredes',
      'Sellado de pasacables y conductos',
      'Materiales certificados IMO',
      'Reduccion de vibraciones',
    ],
    images: ['/service-insulation.jpg', '/gallery-5.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
  {
    overline: 'Mantenimiento Critico',
    title: 'Limpieza de Tanques de Combustible',
    description:
      'La acumulacion de sedimentos y microorganismos en los tanques de combustible es una de las principales causas de averias en motores marinos. Realizamos limpieza profesional con equipos especializados.',
    features: [
      'Limpieza mecanica y quimica de tanques',
      'Eliminacion de bacterias y algas',
      'Inspeccion con camara interior',
      'Filtrado y tratamiento del combustible',
      'Sustitucion de aforadores y juntas',
      'Certificado de limpieza',
    ],
    images: ['/service-fuel-tank.jpg', '/gallery-7.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Pintura y Casco',
    title: 'Obra Muerta',
    description:
      'La obra muerta es la parte del casco sumergida en el agua y requiere un mantenimiento periodico para protegerla de la corrosion y el fouling. Realizamos tratamientos completos en dique seco o varada.',
    features: [
      'Limpieza y preparacion de superficies',
      'Aplicacion de primers anticorrosion',
      'Pintura antifouling de alta calidad',
      'Reparacion de osmosis en fibra de vidrio',
      'Pulido y abrillantado de obra viva',
      'Sellado de thru-hulls y colleras',
    ],
    images: ['/service-underwater.jpg', '/gallery-2.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function WavePattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.3 }}
      preserveAspectRatio="none"
      viewBox="0 0 1200 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[80, 160, 240, 320, 400].map((y, i) => (
        <path
          key={i}
          d={`M0 ${y} C150 ${y - 25}, 300 ${y + 25}, 450 ${y} C600 ${y - 25}, 750 ${y + 25}, 900 ${y} C1050 ${y - 25}, 1150 ${y + 25}, 1200 ${y}`}
          stroke="#002952"
          strokeWidth="1.2"
          fill="none"
        />
      ))}
    </svg>
  )
}

export default function Services() {
  const { sections, loading } = usePage('servicios');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001529]">
        <div className="text-white text-sm animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (sections.length > 0) {
    return (
      <div>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    );
  }

  return <ServicesContent />;
}


function ImageSlider({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0"
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={
                  'w-2 h-2 rounded-full transition-all duration-300 ' +
                  (i === selectedIndex
                    ? 'bg-[#00B4D8] w-5'
                    : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]')
                }
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

function ServicesContent() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      /* ---- Hero timeline (on page load) ---- */
      const heroTl = gsap.timeline({
        defaults: { ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
      })
      heroTl
        .from('.hero-breadcrumb', {
          opacity: 0,
          duration: 0.4,
        })
        .from(
          '.hero-heading',
          {
            clipPath: 'inset(0 100% 0 0)',
            opacity: 0,
            duration: 0.7,
            ease: 'cubic-bezier(0.19, 1, 0.22, 1)',
          },
          '-=0.25'
        )
        .from(
          '.hero-desc',
          {
            y: 25,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.35'
        )

      /* ---- Category cards ---- */
      gsap.fromTo('.category-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          scrollTrigger: {
            trigger: '.categories-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      gsap.fromTo('.category-check',
        { x: -10, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: {
            each: 0.04,
            from: 'start',
          },
          ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          scrollTrigger: {
            trigger: '.categories-section',
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      )

      /* ---- Service detail sections ---- */
      const serviceSections = gsap.utils.toArray<HTMLElement>('.service-section')
      serviceSections.forEach((section) => {
        const isPatternA = section.classList.contains('pattern-a')

        gsap.from(
          section.querySelectorAll('.service-overline, .service-title'),
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        )

        gsap.from(section.querySelectorAll('.service-desc'), {
          y: 20,
          opacity: 0,
          duration: 0.5,
          delay: 0.15,
          ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })

        gsap.from(section.querySelectorAll('.service-feature'), {
          x: -15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })

        /* Image slider clip-path wipe */
        gsap.from(section.querySelector('.service-image'), {
          clipPath: isPatternA
            ? 'inset(0 100% 0 0)'
            : 'inset(0 0 0 100%)',
          duration: 0.8,
          delay: 0.1,
          ease: 'cubic-bezier(0.19, 1, 0.22, 1)',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      })

      /* ---- CTA section ---- */
      gsap.from('.cta-icon', {
        scale: 0.5,
        rotation: -10,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from('.cta-heading', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.15,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from('.cta-desc', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.25,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from('.cta-button', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.4,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef}>
      {/* ============================================================= */}
      {/*  Section 1: Hero Banner                                       */}
      {/* ============================================================= */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-[#001529] overflow-hidden">
        <WavePattern />
        <div className="relative z-10 text-center px-4 md:px-6 lg:px-12 max-w-3xl mx-auto py-24">
          {/* Breadcrumb */}
          <nav className="hero-breadcrumb text-[13px] text-[rgba(255,255,255,0.5)] font-sans">
            <Link to="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <span className="mx-2">&gt;</span>
            <span>Servicios</span>
          </nav>

          {/* Heading */}
          <h1 className="hero-heading text-[36px] md:text-[42px] lg:text-[48px] font-sans font-bold text-white mt-4 leading-[1.2] tracking-[-0.01em]">
            Nuestros Servicios
          </h1>

          {/* Description */}
          <p className="hero-desc text-[17px] leading-[1.7] text-[rgba(255,255,255,0.75)] font-sans mt-4 max-w-[700px] mx-auto">
            Ofrecemos un servicio integral de reparacion y mantenimiento de
            embarcaciones de recreo. Desde la mecanica de motores hasta la
            pintura de obra muerta, cubrimos todas las necesidades de tu barco.
          </p>
        </div>
      </section>

      {/* ============================================================= */}
      {/*  Section 2: Service Categories                                */}
      {/* ============================================================= */}
      <section
        id="categorias"
        className="categories-section bg-white py-20 md:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {categories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <div
                  key={idx}
                  className={
                    'category-card bg-[#F5F7FA] p-8 md:p-10 transition-all duration-350 hover:shadow-lg hover:-translate-y-1 ' +
                    'border border-transparent hover:border-[rgba(74,144,217,0.15)] h-full'
                  }
                  style={{
                    transitionTimingFunction:
                      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                >
                  <Icon size={40} className="text-[#00B4D8]" strokeWidth={1.5} />
                  <h3 className="text-[22px] font-sans font-semibold text-[#1F2937] mt-5 leading-[1.3]">
                    {cat.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-[#6B7280] font-sans mt-3">
                    {cat.description}
                  </p>
                  <ul className="flex flex-col gap-2.5 mt-5">
                    {cat.features.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="category-check flex items-start gap-2.5"
                      >
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                          <Check
                            size={16}
                            className="text-[#00B4D8]"
                            strokeWidth={2.5}
                          />
                        </span>
                        <span className="text-[14px] text-[#374151] font-sans">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/*  Section 3: Detailed Services                                 */}
      {/* ============================================================= */}
      <section id="detalle-servicios">
        {detailedServices.map((service, idx) => {
          const isPatternA = service.pattern === 'A'
          return (
            <div
              key={idx}
              className={
                'service-section py-20 md:py-24 ' +
                (isPatternA ? 'pattern-a' : 'pattern-b')
              }
              style={{ backgroundColor: service.bgColor }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12">
                  {/* Image Column */}
                  <div
                    className={
                      'service-image ' +
                      (isPatternA
                        ? 'order-1 lg:order-1'
                        : 'order-1 lg:order-2')
                    }
                  >
                    <ImageSlider images={service.images} />
                  </div>

                  {/* Text Column */}
                  <div
                    className={
                      isPatternA
                        ? 'order-2 lg:order-2'
                        : 'order-2 lg:order-1'
                    }
                  >
                    <span className="service-overline inline-block text-[12px] uppercase font-sans font-semibold tracking-[0.1em] text-[#00B4D8]">
                      {service.overline}
                    </span>
                    <h2 className="service-title text-[28px] font-sans font-semibold text-[#1F2937] mt-2 leading-[1.25]">
                      {service.title}
                    </h2>
                    <p className="service-desc text-[15px] leading-[1.7] text-[#374151] font-sans mt-4">
                      {service.description}
                    </p>
                    <ul className="flex flex-col gap-2.5 mt-5">
                      {service.features.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="service-feature flex items-start gap-2.5"
                        >
                          <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                            <Check
                              size={16}
                              className="text-[#00B4D8]"
                              strokeWidth={2.5}
                            />
                          </span>
                          <span className="text-[15px] text-[#374151] font-sans">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Link
                        to="/contacto"
                        className="inline-block text-[13px] uppercase font-sans font-semibold tracking-[0.08em] text-[#00B4D8] border border-[#00B4D8] px-8 py-3.5 hover:bg-[#00B4D8] hover:text-white transition-all duration-300"
                      >
                        Solicitar Presupuesto
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ============================================================= */}
      {/*  Section 4: CTA Banner                                        */}
      {/* ============================================================= */}
      <section className="cta-section bg-[#001529] py-20 md:py-24">
        <div className="max-w-[700px] mx-auto px-4 md:px-6 lg:px-12 text-center">
          <div className="cta-icon flex items-center justify-center">
            <Anchor size={48} className="text-[#00B4D8]" strokeWidth={1.5} />
          </div>
          <h2 className="cta-heading text-[28px] font-sans font-semibold text-white mt-6 leading-[1.25]">
            Listo para Navegar con Tranquilidad?
          </h2>
          <p className="cta-desc text-[17px] leading-[1.7] text-[rgba(255,255,255,0.75)] font-sans mt-4">
            Contacta con nosotros y te haremos un presupuesto a medida para tu
            embarcacion.
          </p>
          <div className="mt-8">
            <Link
              to="/contacto"
              className="cta-button inline-block text-[13px] uppercase font-sans font-semibold tracking-[0.08em] text-white bg-[#00B4D8] px-8 py-3.5 hover:bg-[#009FBF] hover:-translate-y-px hover:shadow-lg transition-all duration-300"
            >
              Contactar Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
