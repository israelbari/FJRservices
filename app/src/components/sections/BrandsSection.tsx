import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_BRANDS = [
  { name: 'Caterpillar', color: '#FFCC00' },
  { name: 'Volvo Penta', color: '#003B7E' },
  { name: 'Yanmar', color: '#E60012' },
  { name: 'Cummins', color: '#E31937' },
  { name: 'Kohler', color: '#001E4F' },
  { name: 'Fischer Panda', color: '#000000' },
];

function BrandLogo({ name, color }: { name: string; color: string }) {
  switch (name) {
    case 'Caterpillar':
      return (
        <svg viewBox="0 0 140 36" className="h-8 w-auto">
          <rect x="2" y="2" width="34" height="32" rx="2" fill={color} />
          <text x="10" y="24" fill="#000" fontSize="16" fontWeight="bold" fontFamily="Arial">CAT</text>
          <text x="44" y="24" fill="#666" fontSize="16" fontWeight="bold" fontFamily="Arial" letterSpacing="-0.5">CATERPILLAR</text>
        </svg>
      );
    case 'Volvo Penta':
      return (
        <svg viewBox="0 0 140 36" className="h-8 w-auto">
          <circle cx="16" cy="18" r="14" fill={color} />
          <text x="5" y="23" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Arial">VOLVO</text>
          <text x="36" y="23" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">PENTA</text>
        </svg>
      );
    case 'Yanmar':
      return (
        <svg viewBox="0 0 120 36" className="h-8 w-auto">
          <text x="0" y="24" fill={color} fontSize="18" fontWeight="bold" fontFamily="Arial" letterSpacing="2">YANMAR</text>
        </svg>
      );
    case 'Cummins':
      return (
        <svg viewBox="0 0 160 36" className="h-8 w-auto">
          <circle cx="16" cy="18" r="14" stroke={color} strokeWidth="3" fill="none" />
          <text x="6" y="24" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">C</text>
          <text x="36" y="24" fill={color} fontSize="16" fontWeight="bold" fontFamily="Arial">CUMMINS</text>
        </svg>
      );
    case 'Kohler':
      return (
        <svg viewBox="0 0 120 36" className="h-8 w-auto">
          <text x="0" y="24" fill={color} fontSize="18" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1">KOHLER</text>
        </svg>
      );
    case 'Fischer Panda':
      return (
        <svg viewBox="0 0 160 36" className="h-8 w-auto">
          <circle cx="14" cy="18" r="10" fill={color} />
          <text x="10" y="22" fill="#fff" fontSize="12">FP</text>
          <text x="30" y="24" fill="#333" fontSize="14" fontWeight="bold" fontFamily="Arial">FISCHER PANDA</text>
        </svg>
      );
    default:
      return <span className="text-[#5A6B7C] font-semibold text-sm">{name}</span>;
  }
}

export function BrandsSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const hasMedias = section.medias && section.medias.length > 0;
  const brands = content.brands || DEFAULT_BRANDS;
  const overline = section.title || 'Confianza';
  const heading = section.subtitle || 'Marcas';
  const description = content.description || 'Tenemos experiencia en las siguientes marcas';

  useGSAP(() => {
    if (!sectionRef.current) return;
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
    );
  }, { scope: sectionRef });

  return (
    <section id="marcas" ref={sectionRef} className="py-20 bg-white">
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

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {hasMedias ? (
            section.medias!.map((media) => (
              <div
                key={media.id}
                className="brand-item group flex items-center justify-center min-w-[120px] min-h-[50px] cursor-pointer opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105"
                title={media.title || media.name}
              >
                <img
                  src={getImageUrl(media.src)}
                  alt={media.title || media.name}
                  className="h-10 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            ))
          ) : (
            brands.map((brand: { name: string; color: string }) => (
              <div
                key={brand.name}
                className="brand-item group flex items-center justify-center min-w-[120px] min-h-[50px] cursor-pointer opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105"
                title={brand.name}
              >
                <BrandLogo name={brand.name} color={brand.color} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
