import { useRef, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

export function ContactSection({ section }: { section: Section }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const overline = section.title || 'Contacto';
  const heading = section.subtitle || 'Hablamos?';
  const description = content.description || 'Cuentanos que necesitas y te daremos la mejor solucion';
  const imageUrl = getImageUrl(section.imageUrl || '/contact-marina.jpg');
  const email = content.email || 'info@fjrservices.com';
  const phone = content.phone || '474-937-8270';
  const location = content.location || 'Region de Murcia, Espana';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contacto" className="py-20 md:py-24 bg-[#001529]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#66D6ED] font-inter font-semibold">
            {overline}
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-white">
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.7)]">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src={imageUrl}
                alt="Marina"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-[#00B4D8] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Correo Electronico</span>
                  <span className="text-[16px] text-white">{email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-[#00B4D8] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Numero de Telefono</span>
                  <span className="text-[16px] text-white">{phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[#00B4D8] shrink-0" />
                <div>
                  <span className="block text-[14px] text-[rgba(255,255,255,0.5)]">Ubicacion</span>
                  <span className="text-[16px] text-white">{location}</span>
                </div>
              </div>
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#00B4D8] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">Apellidos</label>
              <input
                type="text"
                placeholder="Tus apellidos"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#00B4D8] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#00B4D8] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">Telefono</label>
              <input
                type="tel"
                placeholder="+34 600 000 000"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#00B4D8] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[rgba(255,255,255,0.6)] mb-2">Comentario</label>
              <textarea
                rows={4}
                placeholder="En que podemos ayudarte?"
                required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] rounded px-4 py-[14px] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[#00B4D8] focus:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,217,0.15)] transition-all duration-250"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00B4D8] text-white text-[13px] uppercase font-semibold tracking-[0.08em] py-[14px] rounded-full font-inter transition-all duration-300 hover:bg-[#009FBF] hover:-translate-y-px hover:shadow-lg mt-2"
            >
              {submitted ? 'Enviado!' : 'Enviar'}
            </button>

            <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-1">
              * Todos los campos son obligatorios
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
