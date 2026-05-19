import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import type { Section } from '@/admin/types';

const ICON_MAP: Record<string, React.ElementType> = { Phone, Mail, MapPin };

export function InfoCardsSection({ section }: { section: Section }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const cards = content.cards || [
    { icon: 'Phone', label: 'Telefono', value: '474-937-8270', subtext: 'Lunes a Sabado, 8:00 - 18:00', href: 'tel:4749378270' },
    { icon: 'Mail', label: 'Correo Electronico', value: 'info@fjrservices.com', subtext: 'Respondemos en menos de 24h', href: 'mailto:info@fjrservices.com' },
    { icon: 'MapPin', label: 'Zona de Servicio', value: 'Region de Murcia, Espana', subtext: 'Cartagena · La Manga · Los Alcazares · San Pedro', href: null },
  ];

  return (
    <section className="bg-white py-16">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card: { icon: string; label: string; value: string; subtext: string; href?: string | null }, i: number) => {
            const Icon = ICON_MAP[card.icon] || Phone;
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                className="bg-[#F5F7FA] p-8 text-center rounded-lg transition-shadow duration-300 cursor-pointer"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 + 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex justify-center"
                >
                  <Icon size={36} className="text-[#00B4D8]" />
                </motion.div>
                <p className="mt-4 text-[12px] uppercase tracking-[0.08em] font-semibold text-[#6B7280] font-sans">{card.label}</p>
                <p className="mt-1 font-semibold text-[#1F2937] font-sans text-[20px]">{card.value}</p>
                <p className="mt-2 text-[13px] text-[#6B7280] font-sans">{card.subtext}</p>
              </motion.div>
            );
            return card.href ? (
              <a key={card.label} href={card.href} className="block no-underline">{inner}</a>
            ) : (
              <div key={card.label}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
