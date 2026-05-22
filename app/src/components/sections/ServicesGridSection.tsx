import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Ship, Wrench, Snowflake, Layers, Fuel, Anchor,
} from 'lucide-react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, React.ElementType> = {
  Ship, Wrench, Snowflake, Layers, Fuel, Anchor,
};

const DEFAULT_SERVICES = [
  { title: 'Linea de Ejes y Helices', image: '/service-prop-shaft.jpg', icon: 'Ship' },
  { title: 'Motores Intraborda', image: '/service-inboard-engine.jpg', icon: 'Wrench' },
  { title: 'Sistema de Refrigeracion', image: '/service-refrigeration.jpg', icon: 'Snowflake' },
  { title: 'Aislamiento de Sala de Maquinas', image: '/service-insulation.jpg', icon: 'Layers' },
  { title: 'Limpieza de Tanques de Combustible', image: '/service-fuel-tank.jpg', icon: 'Fuel' },
  { title: 'Obra Muerta', image: '/service-underwater.jpg', icon: 'Anchor' },
];

export function ServicesGridSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const hasMedias = section.medias && section.medias.length > 0;
  const services = content.services || DEFAULT_SERVICES;
  const overline = section.title || 'Servicios';
  const heading = section.subtitle || 'Servicios Ofrecidos';
  const description = content.description || 'Conocimiento en la manipulacion de los siguientes elementos';
  const ctaText = content.ctaText || 'Ver Todos los Servicios';
  const ctaLink = content.ctaLink || '/servicios';

  useGSAP(() => {
    if (!sectionRef.current) return;
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
    );
  }, { scope: sectionRef });

  return (
    <section id="servicios" ref={sectionRef} className="py-20 md:py-24 bg-white">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasMedias ? (
            section.medias!.map((media) => {
              const CardContent = (
                <div className="service-card group bg-white border border-[#E2E8F0] overflow-hidden transition-all duration-[400ms] hover:shadow-lg hover:border-[#00B4D8] cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(media.src)}
                      alt={media.title || media.name}
                      className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Wrench size={20} className="text-[#00B4D8]" />
                      <h3 className="text-[18px] font-semibold text-[#1A2B3C] font-sans">
                        {media.title || media.name}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#00B4D8] w-0 group-hover:w-full transition-all duration-500" />
                  </div>
                </div>
              );
              return media.link ? (
                <Link key={media.id} to={media.link} className="block no-underline">
                  {CardContent}
                </Link>
              ) : (
                <div key={media.id}>{CardContent}</div>
              );
            })
          ) : (
            services.map((service: { title: string; image: string; icon?: string }, idx: number) => {
              const IconComp = service.icon ? ICON_MAP[service.icon] : Wrench;
              return (
                <div
                  key={idx}
                  className="service-card group bg-white border border-[#E2E8F0] overflow-hidden transition-all duration-[400ms] hover:shadow-lg hover:border-[#00B4D8] cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-2">
                      {IconComp && <IconComp size={20} className="text-[#00B4D8]" />}
                      <h3 className="text-[18px] font-semibold text-[#1A2B3C] font-sans">
                        {service.title}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#00B4D8] w-0 group-hover:w-full transition-all duration-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={ctaLink}
            className="inline-block border border-[#00B4D8] text-[#00B4D8] text-[13px] uppercase font-semibold tracking-[0.08em] px-8 py-[14px] rounded-full font-inter transition-all duration-300 hover:bg-[#00B4D8] hover:text-white"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
