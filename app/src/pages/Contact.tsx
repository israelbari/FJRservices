import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Ship,
} from 'lucide-react'
import { usePage } from '@/hooks/usePage'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

/* ─────────── easing helpers ─────────── */
const easeSmooth = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const easeOutExpo = [0.19, 1, 0.22, 1] as [number, number, number, number]

/* ═══════════════════════════════════════
   Section 1 — Page Header
   ═══════════════════════════════════════ */
function PageHeader() {
  return (
    <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden bg-[#001529]">
      {/* Animated wave background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #002952 0px, #002952 1px, transparent 1px, transparent 60px)',
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #002952 0px, #002952 1px, transparent 1px, transparent 60px)',
          }}
          animate={{ x: [0, 60] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easeSmooth }}
          className="text-[13px] text-[rgba(255,255,255,0.5)] font-sans"
        >
          <Link to="/" className="hover:text-white transition-colors duration-300">
            Inicio
          </Link>
          <span className="mx-2">{'>'}</span>
          <span>Contacto</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOutExpo }}
          className="mt-4 font-sans font-bold text-[36px] md:text-[48px] leading-[1.2] tracking-[-0.01em] text-white"
        >
          Contacto
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: easeSmooth }}
          className="mt-3 text-[17px] leading-[1.7] text-[rgba(255,255,255,0.75)] max-w-[600px] mx-auto font-sans"
        >
          Estamos aquí para ayudarte. Cuéntanos qué necesitas y te responderemos en menos de 24 horas.
        </motion.p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   Section 2 — Contact Info Cards
   ═══════════════════════════════════════ */
const infoCards = [
  {
    icon: Phone,
    label: 'Teléfono',
    value: '474-937-8270',
    subtext: 'Lunes a Sábado, 8:00 - 18:00',
    href: 'tel:4749378270',
  },
  {
    icon: Mail,
    label: 'Correo Electrónico',
    value: 'info@fjrservices.com',
    subtext: 'Respondemos en menos de 24h',
    href: 'mailto:info@fjrservices.com',
    valueSize: 'text-[18px]',
  },
  {
    icon: MapPin,
    label: 'Zona de Servicio',
    value: 'Región de Murcia, España',
    subtext: 'Cartagena \u00B7 La Manga \u00B7 Los Alc\u00E1zares \u00B7 San Pedro',
    href: null,
  },
]

function InfoCards() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="info-contacto" className="bg-white py-16">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card, i) => {
            const Icon = card.icon
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: easeSmooth }}
                whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                className="bg-[#F5F7FA] p-8 text-center rounded-lg transition-shadow duration-300 cursor-pointer"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.1 + 0.2,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="flex justify-center"
                >
                  <Icon size={36} className="text-[#00B4D8]" />
                </motion.div>
                <p className="mt-4 text-[12px] uppercase tracking-[0.08em] font-semibold text-[#6B7280] font-sans">
                  {card.label}
                </p>
                <p className={`mt-1 font-semibold text-[#1F2937] font-sans ${card.valueSize || 'text-[20px]'}`}>
                  {card.value}
                </p>
                <p className="mt-2 text-[13px] text-[#6B7280] font-sans">
                  {card.subtext}
                </p>
              </motion.div>
            )

            if (card.href) {
              return (
                <a key={card.label} href={card.href} className="block no-underline">
                  {content}
                </a>
              )
            }
            return <div key={card.label}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   Section 3 — Contact Form + Locations
   ═══════════════════════════════════════ */
const boatTypes = [
  'Yate a motor',
  'Velero',
  'Embarcaci\u00F3n neum\u00E1tica',
  'Barco de pesca',
  'Jet ski',
  'Otro',
]

const locations = [
  {
    name: 'Club N\u00E1utico de Cartagena',
    address: 'Poblaci\u00F3n de la Azoh\u00EDa, 30390 Cartagena, Murcia',
    phone: '968 123 456',
  },
  {
    name: 'Club N\u00E1utico Dos Mares',
    address: 'La Manga del Mar Menor, 30380 Murcia',
    phone: null,
  },
  {
    name: 'Club N\u00E1utico Los Alc\u00E1zares',
    address: '30710 Los Alc\u00E1zares, Murcia',
    phone: null,
  },
  {
    name: 'Puerto Deportivo San Pedro del Pinatar',
    address: '30740 San Pedro del Pinatar, Murcia',
    phone: null,
  },
]

function ContactForm() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    tipoEmbarcacion: '',
    comentario: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const inputClasses =
    'w-full bg-white border border-[#D1D5DB] rounded-[6px] px-4 py-[14px] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] font-sans transition-all duration-250 ease-smooth focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.12)] focus:outline-none'

  return (
    <section id="formulario" className="bg-[#F5F7FA] py-24">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: easeSmooth }}
          >
            <h2 className="font-sans font-semibold text-[28px] leading-[1.25] text-[#1F2937]">
              Env&iacute;anos un Mensaje
            </h2>
            <p className="mt-2 text-[15px] leading-[1.7] text-[#6B7280] font-sans">
              Rellena el formulario y te contactaremos lo antes posible.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {/* Nombre */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.05, ease: easeSmooth }}
              >
                <label htmlFor="nombre" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Nombre <span className="text-[#00B4D8]">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </motion.div>

              {/* Apellidos */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1, ease: easeSmooth }}
              >
                <label htmlFor="apellidos" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Apellidos <span className="text-[#00B4D8]">*</span>
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  placeholder="Tus apellidos"
                  required
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15, ease: easeSmooth }}
              >
                <label htmlFor="email" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Email <span className="text-[#00B4D8]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </motion.div>

              {/* Teléfono */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2, ease: easeSmooth }}
              >
                <label htmlFor="telefono" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Tel&eacute;fono <span className="text-[#00B4D8]">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="+34 600 000 000"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </motion.div>

              {/* Tipo de Embarcación */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25, ease: easeSmooth }}
              >
                <label htmlFor="tipoEmbarcacion" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Tipo de Embarcaci&oacute;n
                </label>
                <select
                  id="tipoEmbarcacion"
                  name="tipoEmbarcacion"
                  value={formData.tipoEmbarcacion}
                  onChange={handleChange}
                  className={inputClasses + ' cursor-pointer'}
                >
                  <option value="">Selecciona...</option>
                  {boatTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Comentario */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3, ease: easeSmooth }}
              >
                <label htmlFor="comentario" className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-sans">
                  Comentario <span className="text-[#00B4D8]">*</span>
                </label>
                <textarea
                  id="comentario"
                  name="comentario"
                  rows={5}
                  placeholder="\u00BFEn qu\u00E9 podemos ayudarte?"
                  required
                  value={formData.comentario}
                  onChange={handleChange}
                  className={inputClasses + ' resize-none'}
                />
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.35, ease: easeSmooth }}
                className="mt-2"
              >
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#00B4D8] text-white text-[13px] uppercase font-semibold tracking-[0.08em] px-8 py-[14px] font-sans transition-all duration-300 ease-smooth hover:bg-[#009FBF] hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
                >
                  {submitted ? '\u00A1Mensaje enviado!' : 'Enviar Mensaje'}
                </button>
                <p className="mt-3 text-[12px] text-[#9CA3AF] font-sans">
                  <span className="text-[#00B4D8]">*</span> Campos obligatorios
                </p>
              </motion.div>
            </form>
          </motion.div>

          {/* Right — Locations */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: easeSmooth }}
            >
              <h2 className="font-sans font-semibold text-[28px] leading-[1.25] text-[#1F2937]">
                D&oacute;nde Encontrarnos
              </h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-[#6B7280] font-sans">
                Trabajamos en los principales puertos y clubes n&aacute;uticos de la zona.
              </p>
            </motion.div>

            <div className="mt-8 flex flex-col gap-5">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: easeSmooth }}
                  whileHover={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    borderLeftWidth: '3px',
                    borderLeftColor: '#00B4D8',
                  }}
                  className="bg-white p-6 rounded-lg shadow-sm border-l-[3px] border-l-transparent transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <Ship size={20} className="text-[#00B4D8] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-sans font-semibold text-[16px] text-[#1F2937]">
                        {loc.name}
                      </h3>
                      <p className="mt-1 text-[14px] text-[#6B7280] font-sans leading-[1.5]">
                        {loc.address}
                      </p>
                      {loc.phone && (
                        <a
                          href={`tel:${loc.phone.replace(/\s/g, '')}`}
                          className="mt-2 inline-block text-[14px] text-[#00B4D8] font-sans hover:underline"
                        >
                          {loc.phone}
                        </a>
                      )}
                      {/* Map placeholder */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: easeSmooth }}
                        className="mt-3 aspect-video rounded bg-[#E2E8F0] overflow-hidden"
                      >
                        <iframe
                          title={`Mapa - ${loc.name}`}
                          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25000!2d-0.98!3d37.62!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDM3JzEyLjAiTiAwwrA1OCczNi4wIlc!5e0!3m2!1ses!2ses!4v1`}
                          width="100%"
                          height="100%"
                          style={{ border: 0, filter: 'grayscale(0.2)' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   Section 4 — Response Promise Banner
   ═══════════════════════════════════════ */
function ResponseBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#001529] py-16">
      <div className="max-w-[600px] mx-auto px-4 text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="flex justify-center"
        >
          <MessageCircle size={40} className="text-[#00B4D8]" />
        </motion.div>

        {/* Heading */}
        <motion.h3
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: easeSmooth }}
          className="mt-5 font-sans font-semibold text-[22px] leading-[1.3] text-white"
        >
          Respuesta Garantizada en 24h
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: easeSmooth }}
          className="mt-3 text-[15px] leading-[1.7] text-[rgba(255,255,255,0.75)] font-sans"
        >
          Entendemos que cada d&iacute;a sin tu embarcaci&oacute;n cuenta. Por eso nos comprometemos a responderte en menos de 24 horas con un presupuesto detallado y un plan de acci&oacute;n.
        </motion.p>

        {/* Phone CTA */}
        <motion.a
          href="tel:4749378270"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4, ease: easeSmooth }}
          className="mt-5 inline-block text-[16px] font-semibold text-[#66D6ED] font-sans hover:text-white transition-colors duration-300 underline underline-offset-4"
        >
          O ll&aacute;manos ahora: 474-937-8270
        </motion.a>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   Main Contact Page
   ═══════════════════════════════════════ */
function ContactContent() {
  return (
    <main>
      <PageHeader />
      <InfoCards />
      <ContactForm />
      <ResponseBanner />
    </main>
  )
}

export default function Contact() {
  const { page, sections, loading } = usePage('contacto');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001529]">
        <div className="text-white text-sm animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (page?.useDynamicContent && sections.length > 0) {
    return (
      <div>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    );
  }

  return <ContactContent />;
}
