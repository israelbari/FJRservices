import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Wrench, ClipboardList, Users, Check } from 'lucide-react';
import type { Section } from '@/admin/types';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench, ClipboardList, Users,
};

const DEFAULT_CATEGORIES = [
  {
    icon: 'Wrench',
    title: 'Mantenimiento y Reparacion',
    description: 'Servicios tecnicos especializados para mantener tu embarcacion en perfectas condiciones.',
    features: ['Motores intraborda y fueraborda', 'Linea de ejes y helices', 'Sistemas de refrigeracion', 'Aislamiento de sala de maquinas', 'Limpieza de tanques de combustible', 'Obra muerta y pintura'],
  },
  {
    icon: 'ClipboardList',
    title: 'Gestion y Asesoramiento',
    description: 'Te acompanamos en todo el proceso de mantenimiento de tu embarcacion.',
    features: ['Gestion de mantenimientos periodicos', 'Asesoramiento tecnico personalizado', 'Presupuestos detallados sin compromiso', 'Coordinacion con astilleros y proveedores', 'Inspecciones pre-compra', 'Certificaciones y documentacion'],
  },
  {
    icon: 'Users',
    title: 'Colaboracion y Recomendacion',
    description: 'Trabajamos con los mejores profesionales del sector para ofrecerte un servicio integral.',
    features: ['Colaboracion con astilleros locales', 'Red de tecnicos especializados', 'Recomendacion de proveedores de confianza', 'Servicios de transporte y varada', 'Electricidad naval', 'Electronica y navegacion'],
  },
];

export function ServiceCategoriesSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const categories = content.categories || DEFAULT_CATEGORIES;
  const overline = section.title || 'Categorias';
  const heading = section.subtitle || 'Areas de Especializacion';
  const description = content.description || '';

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo('.category-card', { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
    });
    gsap.fromTo('.category-check', { x: -10, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.4, stagger: { each: 0.04, from: 'start' }, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bg-white py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-inter font-semibold">{overline}</span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-[#1A2B3C]">{heading}</h2>
          {description && <p className="mt-2 text-[15px] text-[#5A6B7C]">{description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {categories.map((cat: { icon: string; title: string; description: string; features: string[] }, idx: number) => {
            const Icon = ICON_MAP[cat.icon] || Wrench;
            return (
              <div key={idx} className="category-card bg-[#F5F7FA] p-8 md:p-10 transition-all duration-350 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-[rgba(74,144,217,0.15)] h-full">
                <Icon size={40} className="text-[#00B4D8]" strokeWidth={1.5} />
                <h3 className="text-[22px] font-sans font-semibold text-[#1F2937] mt-5 leading-[1.3]">{cat.title}</h3>
                <p className="text-[15px] leading-[1.7] text-[#6B7280] font-sans mt-3">{cat.description}</p>
                <ul className="flex flex-col gap-2.5 mt-5">
                  {cat.features.map((feat: string, fIdx: number) => (
                    <li key={fIdx} className="category-check flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                        <Check size={16} className="text-[#00B4D8]" strokeWidth={2.5} />
                      </span>
                      <span className="text-[14px] text-[#374151] font-sans">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
