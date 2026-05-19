import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { Section } from '@/admin/types';

const DEFAULT_APPS = [
  {
    title: 'Ventusky',
    description: 'Aplicacion meteorologica avanzada con visualizacion de viento, olas y temperatura en tiempo real. Esencial para planificar tu salida al mar.',
    link: 'https://www.ventusky.com',
    linkLabel: 'Abrir Ventusky',
    iconType: 'ventusky',
  },
  {
    title: 'VesselFinder',
    description: 'Seguimiento de embarcaciones en tiempo real. Localiza y rastrea cualquier barco en el mundo con datos AIS actualizados.',
    link: 'https://www.vesselfinder.com',
    linkLabel: 'Abrir VesselFinder',
    iconType: 'vesselfinder',
  },
];

function VentuskyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#00B4D8" />
      <path d="M32 12L16 48H24L32 28L40 48H48L32 12Z" fill="white" />
    </svg>
  );
}

function VesselFinderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#003A6B" />
      <path d="M16 44L32 20L48 44H16Z" fill="white" />
      <circle cx="32" cy="16" r="4" fill="white" />
    </svg>
  );
}

export function WeatherAppsSection({ section }: { section: Section }) {
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const apps = content.apps || DEFAULT_APPS;
  const overline = section.title || 'No Pierdas el Rumbo';
  const heading = section.subtitle || 'Recomendaciones';
  const description = content.description || 'Herramientas utiles para tu navegacion';

  return (
    <section id="recomendaciones" className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-inter font-semibold">
            {overline}
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-[#1A2B3C]">
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-[#5A6B7C]">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {apps.map((app: { title: string; description: string; link: string; linkLabel: string; iconType?: string }) => (
            <motion.div
              key={app.title}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-[#EEF1F5] rounded-lg p-8 group"
            >
              <div className="transition-transform duration-300 group-hover:rotate-[5deg] w-fit">
                {app.iconType === 'vesselfinder' ? <VesselFinderIcon /> : <VentuskyIcon />}
              </div>
              <h3 className="mt-4 text-[20px] font-semibold text-[#1A2B3C] font-sans">{app.title}</h3>
              <p className="mt-2 text-[15px] text-[#5A6B7C] leading-[1.7]">{app.description}</p>
              <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-[#00B4D8] font-inter font-medium hover:underline transition-all"
              >
                {app.linkLabel}
                <ExternalLink size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
