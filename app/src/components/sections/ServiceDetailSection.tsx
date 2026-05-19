import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

gsap.registerPlugin(ScrollTrigger);

function ImageSlider({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <img src={getImageUrl(src)} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors" aria-label="Anterior">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors" aria-label="Siguiente">
            <ChevronRight size={20} />
          </button>
          <div className="flex items-center justify-center gap-2 mt-3">
            {images.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === selectedIndex ? 'bg-[#00B4D8] w-5' : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]'}`} aria-label={`Ir a imagen ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const DEFAULT_SERVICES = [
  {
    overline: 'Mecanica Naval',
    title: 'Linea de Ejes y Helices',
    description: 'La linea de ejes es uno de los sistemas mas criticos de cualquier embarcacion. Nuestro equipo cuenta con la experiencia y las herramientas necesarias para el diagnostico, reparacion y mantenimiento completo de este sistema.',
    features: ['Alineacion de ejes y rodamientos', 'Sustitucion de estopas y retenes', 'Reparacion y equilibrado de helices', 'Cambio de ejes y couplings', 'Inspeccion con endoscopio', 'Pruebas de estanqueidad'],
    images: ['/service-prop-shaft.jpg', '/gallery-4.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Propulsion',
    title: 'Motores Intraborda',
    description: 'Especialistas en motores diesel marinos de las principales marcas. Realizamos desde cambios de aceite y filtros hasta reparaciones mayores de motor, incluyendo rectificado de culatas y cambio de segmentos.',
    features: ['Revision y puesta a punto de motores', 'Cambio de aceite, filtros y refrigerante', 'Rectificado de culatas', 'Cambio de segmentos y camisas', 'Reprogramacion de centralitas', 'Sustitucion de motores completos'],
    images: ['/service-inboard-engine.jpg', '/gallery-1.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
  {
    overline: 'Climatizacion',
    title: 'Sistema de Refrigeracion',
    description: 'Los sistemas de refrigeracion marina requieren un mantenimiento especifico debido a la corrosion del agua salada. Ofrecemos servicio completo de intercambiadores de calor, circuitos de refrigeracion y aire acondicionado marina.',
    features: ['Limpieza de intercambiadores de calor', 'Reparacion de circuitos de refrigeracion', 'Instalacion de aire acondicionado marina', 'Sustitucion de bombas de agua salada', 'Tratamiento anticorrosion', 'Recarga de gas refrigerante'],
    images: ['/service-refrigeration.jpg', '/gallery-6.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Confort a Bordo',
    title: 'Aislamiento de Sala de Maquinas',
    description: 'El aislamiento acustico y termico de la sala de maquinas es fundamental para el confort a bordo. Utilizamos materiales de alta calidad resistentes al fuego y a la humedad marina.',
    features: ['Aislamiento acustico de alta densidad', 'Aislamiento termico ignifugo', 'Revestimiento de suelos y paredes', 'Sellado de pasacables y conductos', 'Materiales certificados IMO', 'Reduccion de vibraciones'],
    images: ['/service-insulation.jpg', '/gallery-5.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
  {
    overline: 'Mantenimiento Critico',
    title: 'Limpieza de Tanques de Combustible',
    description: 'La acumulacion de sedimentos y microorganismos en los tanques de combustible es una de las principales causas de averias en motores marinos. Realizamos limpieza profesional con equipos especializados.',
    features: ['Limpieza mecanica y quimica de tanques', 'Eliminacion de bacterias y algas', 'Inspeccion con camara interior', 'Filtrado y tratamiento del combustible', 'Sustitucion de aforadores y juntas', 'Certificado de limpieza'],
    images: ['/service-fuel-tank.jpg', '/gallery-7.jpg'],
    pattern: 'A',
    bgColor: '#FFFFFF',
  },
  {
    overline: 'Pintura y Casco',
    title: 'Obra Muerta',
    description: 'La obra muerta es la parte del casco sumergida en el agua y requiere un mantenimiento periodico para protegerla de la corrosion y el fouling. Realizamos tratamientos completos en dique seco o varada.',
    features: ['Limpieza y preparacion de superficies', 'Aplicacion de primers anticorrosion', 'Pintura antifouling de alta calidad', 'Reparacion de osmosis en fibra de vidrio', 'Pulido y abrillantado de obra viva', 'Sellado de thru-hulls y colleras'],
    images: ['/service-underwater.jpg', '/gallery-2.jpg'],
    pattern: 'B',
    bgColor: '#F5F7FA',
  },
];

export function ServiceDetailSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const services = content.services || DEFAULT_SERVICES;
  const overline = section.title || '';
  const heading = section.subtitle || 'Servicios Especializados';
  const description = content.description || '';

  useGSAP(() => {
    if (!sectionRef.current) return;
    const serviceSections = gsap.utils.toArray<HTMLElement>('.service-section');
    serviceSections.forEach((sec) => {
      gsap.from(sec.querySelectorAll('.service-overline, .service-title'), {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 75%' },
      });
      gsap.from(sec.querySelectorAll('.service-desc'), {
        y: 20, opacity: 0, duration: 0.5, delay: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 75%' },
      });
      gsap.from(sec.querySelectorAll('.service-feature'), {
        x: -15, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 75%' },
      });
      const isPatternA = sec.classList.contains('pattern-a');
      gsap.from(sec.querySelector('.service-image'), {
        clipPath: isPatternA ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
        duration: 0.8, delay: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: sec, start: 'top 75%' },
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef}>
      {(overline || heading || description) && (
        <div className="bg-white py-12 text-center">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
            {overline && <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-inter font-semibold">{overline}</span>}
            {heading && <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-[#1A2B3C]">{heading}</h2>}
            {description && <p className="mt-2 text-[15px] text-[#5A6B7C] max-w-3xl mx-auto">{description}</p>}
          </div>
        </div>
      )}

      {services.map((service: { overline: string; title: string; description: string; features: string[]; images: string[]; pattern: string; bgColor: string }, idx: number) => {
        const isPatternA = service.pattern === 'A';
        return (
          <div key={idx} className={`service-section py-20 md:py-24 ${isPatternA ? 'pattern-a' : 'pattern-b'}`} style={{ backgroundColor: service.bgColor || '#FFFFFF' }}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12">
                <div className={`service-image ${isPatternA ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}>
                  <ImageSlider images={service.images} />
                </div>
                <div className={isPatternA ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}>
                  <span className="service-overline inline-block text-[12px] uppercase font-sans font-semibold tracking-[0.1em] text-[#00B4D8]">{service.overline}</span>
                  <h2 className="service-title text-[28px] font-sans font-semibold text-[#1F2937] mt-2 leading-[1.25]">{service.title}</h2>
                  <p className="service-desc text-[15px] leading-[1.7] text-[#374151] font-sans mt-4">{service.description}</p>
                  <ul className="flex flex-col gap-2.5 mt-5">
                    {service.features.map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="service-feature flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                          <Check size={16} className="text-[#00B4D8]" strokeWidth={2.5} />
                        </span>
                        <span className="text-[15px] text-[#374151] font-sans">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link to="/contacto" className="inline-block text-[13px] uppercase font-sans font-semibold tracking-[0.08em] text-[#00B4D8] border border-[#00B4D8] px-8 py-3.5 hover:bg-[#00B4D8] hover:text-white transition-all duration-300">
                      Solicitar Presupuesto
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
