import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ShieldCheck, Clock, HeartHandshake } from 'lucide-react'
import { usePage } from '@/hooks/usePage'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/* ─── Animated counter helper ─── */
function useCountUp(end: number, suffix: string, inView: boolean) {
  const [value, setValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const obj = { val: 0 }
    gsap.to(obj, {
      val: end,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => setValue(Math.round(obj.val)),
    })
  }, [inView, end])

  return `${value}${suffix}`
}

/* ─── Stat item component ─── */
interface StatItemProps {
  number: number
  suffix: string
  label: string
  inView: boolean
}

function StatItem({ number, suffix, label, inView }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(number, suffix, inView)

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="font-sans text-[48px] font-bold text-[#00B4D8] leading-tight">
        {count}
      </span>
      <div
        className="w-10 h-[2px] bg-[#00B4D8] mt-3 origin-center"
        style={{
          transform: inView ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1) 1.2s',
        }}
      />
      <span
        className="text-[14px] uppercase tracking-[0.05em] font-sans font-medium mt-3 text-[rgba(255,255,255,0.7)]"
        style={{
          opacity: inView ? 1 : 0,
          transition: 'opacity 0.3s ease 1.5s',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function About() {
  const { sections, loading } = usePage('nosotros');

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

  return <AboutContent />;
}

/* ─── Main About page ─── */
function AboutContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroImgRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const historiaRef = useRef<HTMLDivElement>(null)
  const valoresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsInView, setStatsInView] = useState(false)

  useGSAP(
    () => {
      /* ── Hero parallax ── */
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      /* ── Hero content entrance ── */
      const heroTl = gsap.timeline({ delay: 0.2 })
      if (heroContentRef.current) {
        const breadcrumb = heroContentRef.current.querySelector('.hero-breadcrumb')
        const heading = heroContentRef.current.querySelector('.hero-heading')
        const tagline = heroContentRef.current.querySelector('.hero-tagline')

        if (breadcrumb) {
          heroTl.fromTo(
            breadcrumb,
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
          )
        }
        if (heading) {
          heroTl.fromTo(
            heading,
            {
              opacity: 0,
              clipPath: 'inset(0 100% 0 0)',
            },
            {
              opacity: 1,
              clipPath: 'inset(0 0% 0 0)',
              duration: 0.8,
              ease: 'expo.out',
            },
            '-=0.3'
          )
        }
        if (tagline) {
          heroTl.fromTo(
            tagline,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
          )
        }
      }

      /* ── Bienvenido section animations ── */
      if (historiaRef.current) {
        const leftCol = historiaRef.current.querySelector('.historia-left')
        const rightCol = historiaRef.current.querySelector('.historia-right')

        if (leftCol) {
          const overline = leftCol.querySelector('.section-overline')
          const heading = leftCol.querySelector('.section-heading')
          const paragraphs = leftCol.querySelectorAll('.story-paragraph')

          gsap.fromTo(
            [overline, heading],
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: historiaRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )

          gsap.fromTo(
            paragraphs,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: historiaRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        if (rightCol) {
          const images = rightCol.querySelectorAll('.story-image')
          gsap.fromTo(
            images,
            { clipPath: 'inset(0 0 0 100%)', opacity: 0 },
            {
              clipPath: 'inset(0 0 0 0%)',
              opacity: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: historiaRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          )
        }
      }

      /* ── Valores section animations ── */
      if (valoresRef.current) {
        const header = valoresRef.current.querySelector('.valores-header')
        const cards = valoresRef.current.querySelectorAll('.valor-card')

        if (header) {
          gsap.fromTo(
            header,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: valoresRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        if (cards.length) {
          gsap.fromTo(
            cards,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: valoresRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          )

          /* Border-left scale animation */
          const borders = valoresRef.current.querySelectorAll('.valor-border')
          gsap.fromTo(
            borders,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.5,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: valoresRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          )
        }
      }

      /* ── Stats section ── */
      if (statsRef.current) {
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 80%',
          onEnter: () => setStatsInView(true),
        })

        const cta = statsRef.current.querySelector('.stats-cta')
        if (cta) {
          gsap.fromTo(
            cta,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 70%',
                toggleActions: 'play none none none',
              },
            }
          )
        }
      }
    },
    { scope: containerRef }
  )

  const values = [
    {
      icon: Award,
      title: 'Experiencia',
      description:
        'Más de 20 años trabajando en el sector naval nos han permitido adquirir un conocimiento profundo de cada sistema y componente de las embarcaciones.',
    },
    {
      icon: ShieldCheck,
      title: 'Garantía',
      description:
        'Todos nuestros trabajos cuentan con garantía. Utilizamos recambios originales y seguimos los procedimientos técnicos de cada fabricante.',
    },
    {
      icon: Clock,
      title: 'Disponibilidad',
      description:
        'Entendemos la importancia de tu tiempo. Ofrecemos flexibilidad horaria y respuesta rápida para que puedas disfrutar de tu embarcación cuando quieras.',
    },
    {
      icon: HeartHandshake,
      title: 'Compromiso',
      description:
        'Tratamos cada embarcación como si fuera nuestra. El compromiso con la calidad y la satisfacción del cliente es el pilar de nuestra empresa.',
    },
  ]

  const stats = [
    { number: 20, suffix: '+', label: 'Años de Experiencia' },
    { number: 500, suffix: '+', label: 'Embarcaciones Atendidas' },
    { number: 6, suffix: '', label: 'Marcas Especializadas' },
    { number: 4, suffix: '', label: 'Clubes Náuticos' },
  ]

  return (
    <div ref={containerRef}>
      {/* ═══════ Section 1: Hero Banner ═══════ */}
      <section
        ref={heroRef}
        className="relative h-[55vh] min-h-[400px] overflow-hidden"
      >
        {/* Background image with parallax */}
        <div
          ref={heroImgRef}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
        >
          <img
            src="/about-sunset.jpg"
            alt="Atardecer sobre el océano"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,22,40,0.4) 0%, rgba(10,22,40,0.75) 100%)',
          }}
        />

        {/* Hero content */}
        <div
          ref={heroContentRef}
          className="relative z-10 h-full flex flex-col items-center justify-end pb-[12%] px-4"
        >
          {/* Breadcrumb */}
          <nav className="hero-breadcrumb opacity-0">
            <ol className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.6)]">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors duration-300"
                >
                  Inicio
                </Link>
              </li>
              <li>{'>'}</li>
              <li className="text-[rgba(255,255,255,0.8)]">Sobre Nosotros</li>
            </ol>
          </nav>

          {/* Heading */}
          <h1 className="hero-heading mt-3 font-sans text-[36px] md:text-[48px] font-bold text-white leading-[1.2] tracking-[-0.01em] text-center opacity-0">
            Sobre Nosotros
          </h1>

          {/* Tagline */}
          <p className="hero-tagline mt-3 text-[17px] text-[rgba(255,255,255,0.8)] text-center max-w-xl opacity-0">
            Más de 20 años de experiencia en el sector naval
          </p>
        </div>
      </section>

      {/* ═══════ Section 2: Bienvenido / Company Story ═══════ */}
      <section
        ref={historiaRef}
        id="historia"
        className="bg-white py-20 md:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column — Text */}
            <div className="historia-left">
              <span className="section-overline block text-[12px] uppercase tracking-[0.12em] font-sans font-semibold text-[#00B4D8]">
                Bienvenido
              </span>
              <h2 className="section-heading mt-3 font-sans text-[28px] md:text-[36px] font-semibold text-[#1F2937] leading-[1.25]">
                Quiénes Somos
              </h2>

              <div className="mt-6 flex flex-col gap-5">
                <p className="story-paragraph text-[15px] text-[#374151] leading-[1.8]">
                  FJR Services nace de la pasión de Francisco Javier Rivero
                  Sánchez por el mundo náutico. Con más de dos décadas de
                  experiencia en el sector naval, hemos construido una reputación
                  sólida basada en la calidad del trabajo, la honestidad y el
                  compromiso con cada cliente.
                </p>
                <p className="story-paragraph text-[15px] text-[#374151] leading-[1.8]">
                  Nuestra empresa se especializa en la reparación y mantenimiento
                  integral de embarcaciones de recreo. Desde motores intraborda
                  hasta sistemas de refrigeración, pasando por la pintura de obra
                  muerta y el aislamiento de salas de máquinas, ofrecemos un
                  servicio completo que cubre todas las necesidades de tu barco.
                </p>
                <p className="story-paragraph text-[15px] text-[#374151] leading-[1.8]">
                  Trabajamos en los principales clubes náuticos y puertos de la
                  Región de Murcia, incluyendo Cartagena, La Manga, Los Alcázares
                  y San Pedro del Pinatar. Nuestra proximidad y disponibilidad
                  garantizan una respuesta rápida ante cualquier necesidad.
                </p>
              </div>
            </div>

            {/* Right Column — Images */}
            <div className="historia-right flex flex-col gap-6">
              <div className="story-image overflow-hidden rounded-lg shadow-md group">
                <img
                  src="/about-welcome-1.jpg"
                  alt="Técnico trabajando en un motor marino"
                  className="w-full aspect-[3/2] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-lg"
                />
              </div>
              <div className="story-image overflow-hidden rounded-lg shadow-md group">
                <img
                  src="/about-welcome-2.jpg"
                  alt="Vista aérea de un puerto deportivo"
                  className="w-full aspect-[3/2] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Section 3: Valores (Values Grid) ═══════ */}
      <section
        ref={valoresRef}
        id="valores"
        className="bg-[#F5F7FA] py-20 md:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          {/* Section header */}
          <div className="valores-header text-center">
            <span className="block text-[12px] uppercase tracking-[0.12em] font-sans font-semibold text-[#00B4D8]">
              Nuestros Valores
            </span>
            <h2 className="mt-3 font-sans text-[28px] md:text-[36px] font-semibold text-[#1F2937] leading-[1.25]">
              Lo Que Nos Define
            </h2>
          </div>

          {/* Values Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="valor-card relative bg-white p-8 md:p-10 shadow-sm flex flex-col"
                >
                  {/* Animated left border */}
                  <div
                    className="valor-border absolute left-0 top-0 bottom-0 w-1 bg-[#00B4D8] origin-top"
                    style={{ transform: 'scaleY(0)' }}
                  />

                  <div className="pl-2">
                    <Icon
                      size={36}
                      className="text-[#00B4D8]"
                      strokeWidth={1.5}
                    />
                    <h3 className="mt-4 font-sans text-[22px] font-semibold text-[#1F2937]">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-[15px] text-[#6B7280] leading-[1.7]">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Section 4: Experiencia / Stats ═══════ */}
      <section
        ref={statsRef}
        id="experiencia"
        className="bg-[#001529] py-20 md:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          {/* Stats Row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 lg:gap-24">
            {stats.map((stat) => (
              <StatItem
                key={stat.label}
                number={stat.number}
                suffix={stat.suffix}
                label={stat.label}
                inView={statsInView}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="stats-cta mt-12 flex flex-col items-center text-center">
            <p className="text-[17px] text-[rgba(255,255,255,0.8)]">
              ¿Quieres formar parte de nuestra historia?
            </p>
            <Link
              to="/contacto"
              className="mt-4 inline-block bg-[#00B4D8] text-white text-[13px] uppercase font-sans font-semibold tracking-[0.08em] px-8 py-[14px] hover:bg-[#009FBF] hover:-translate-y-[1px] hover:shadow-lg transition-all duration-300"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
