import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Award, ShieldCheck, Clock, HeartHandshake } from 'lucide-react';
import type { Section } from '@/admin/types';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, React.ElementType> = {
  Award, ShieldCheck, Clock, HeartHandshake,
};

export function ValuesSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const overline = section.title || 'Nuestros Valores';
  const heading = section.subtitle || 'Lo Que Nos Define';
  const values = content.values || [
    { icon: 'Award', title: 'Experiencia', description: 'Mas de 20 anos trabajando en el sector naval nos han permitido adquirir un conocimiento profundo de cada sistema y componente de las embarcaciones.' },
    { icon: 'ShieldCheck', title: 'Garantia', description: 'Todos nuestros trabajos cuentan con garantia. Utilizamos recambios originales y seguimos los procedimientos tecnicos de cada fabricante.' },
    { icon: 'Clock', title: 'Disponibilidad', description: 'Entendemos la importancia de tu tiempo. Ofrecemos flexibilidad horaria y respuesta rapida para que puedas disfrutar de tu embarcacion cuando quieras.' },
    { icon: 'HeartHandshake', title: 'Compromiso', description: 'Tratamos cada embarcacion como si fuera nuestra. El compromiso con la calidad y la satisfaccion del cliente es el pilar de nuestra empresa.' },
  ];

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo('.valores-header', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } });
    gsap.fromTo('.valor-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    gsap.fromTo('.valor-border', { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bg-[#F5F7FA] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="valores-header text-center">
          <span className="block text-[12px] uppercase tracking-[0.12em] font-sans font-semibold text-[#00B4D8]">{overline}</span>
          <h2 className="mt-3 font-sans text-[28px] md:text-[36px] font-semibold text-[#1F2937] leading-[1.25]">{heading}</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value: { icon: string; title: string; description: string }) => {
            const Icon = ICON_MAP[value.icon] || Award;
            return (
              <div key={value.title} className="valor-card relative bg-white p-8 md:p-10 shadow-sm flex flex-col">
                <div className="valor-border absolute left-0 top-0 bottom-0 w-1 bg-[#00B4D8] origin-top" style={{ transform: 'scaleY(0)' }} />
                <div className="pl-2">
                  <Icon size={36} className="text-[#00B4D8]" strokeWidth={1.5} />
                  <h3 className="mt-4 font-sans text-[22px] font-semibold text-[#1F2937]">{value.title}</h3>
                  <p className="mt-2 text-[15px] text-[#6B7280] leading-[1.7]">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
