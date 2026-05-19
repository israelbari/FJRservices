import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

const DEFAULT_SLIDES = 3;

export function MaintenanceSection({ section }: { section: Section }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const slides = content.slides || Array.from({ length: DEFAULT_SLIDES }, () => ({
    beforeImage: '/maintenance-before.jpg',
    afterImage: '/maintenance-after.jpg',
  }));
  const overline = section.title || 'Mantenimiento';
  const heading = section.subtitle || 'La Importancia del Mantenimiento Preventivo';
  const description = content.description ||
    'Las embarcaciones de recreo estan expuestas a factores ambientales como el agua salada, el viento, el sol, la lluvia, el frio y el calor. Un mantenimiento preventivo regular no solo prolonga la vida util de tu embarcacion, sino que evita costosas averias inesperadas y garantiza tu seguridad en el mar.';

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section id="mantenimiento" ref={sectionRef} className="py-20 md:py-24 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-8">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-inter font-semibold">
            {overline}
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-[#1A2B3C] max-w-[700px] mx-auto">
            {heading}
          </h2>
          <p className="mt-4 text-[15px] text-[#1A2B3C] leading-[1.7] max-w-[800px] mx-auto">
            {description}
          </p>
        </div>

        <div className="relative mt-12">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide: { beforeImage: string; afterImage: string }, idx: number) => (
                <div key={idx} className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={getImageUrl(slide.beforeImage)}
                      alt="Antes del mantenimiento"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-[#00B4D8] text-white text-[12px] uppercase font-semibold tracking-[0.08em] px-3 py-1 font-inter">
                      ANTES
                    </span>
                  </div>
                  <div className="relative aspect-[4/3]">
                    <img
                      src={getImageUrl(slide.afterImage)}
                      alt="Despues del mantenimiento"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-[#00B4D8] text-white text-[12px] uppercase font-semibold tracking-[0.08em] px-3 py-1 font-inter">
                      DESPUES
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-[#1A2B3C] hover:bg-[#EEF1F5] transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-[#1A2B3C] hover:bg-[#EEF1F5] transition-colors z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_: unknown, dot: number) => (
              <button
                key={dot}
                onClick={() => setCurrentSlide(dot)}
                className={
                  'w-2 h-2 rounded-full transition-all duration-300 ' +
                  (currentSlide === dot ? 'bg-[#00B4D8]' : 'bg-[#D1D5DB]')
                }
                aria-label={`Ir al slide ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
