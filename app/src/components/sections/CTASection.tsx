import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Anchor } from 'lucide-react';
import type { Section } from '@/admin/types';

gsap.registerPlugin(ScrollTrigger);

export function CTASection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const heading = section.subtitle || 'Listo para Navegar con Tranquilidad?';
  const description = content.description || 'Contacta con nosotros y te haremos un presupuesto a medida para tu embarcacion.';
  const ctaText = content.ctaText || 'Contactar Ahora';
  const ctaLink = content.ctaLink || '/contacto';
  const iconName = content.icon || 'Anchor';

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from('.cta-icon', { scale: 0.5, rotation: -10, duration: 0.6, ease: 'back.out(1.7)', scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } });
    gsap.from('.cta-heading', { y: 30, opacity: 0, duration: 0.6, delay: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } });
    gsap.from('.cta-desc', { y: 20, opacity: 0, duration: 0.5, delay: 0.25, scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } });
    gsap.from('.cta-button', { y: 20, opacity: 0, duration: 0.5, delay: 0.4, scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bg-[#001529] py-20 md:py-24">
      <div className="max-w-[700px] mx-auto px-4 text-center">
        <div className="cta-icon flex items-center justify-center">
          {iconName === 'Anchor' && <Anchor size={48} className="text-[#00B4D8]" strokeWidth={1.5} />}
        </div>
        <h2 className="cta-heading text-[28px] font-sans font-semibold text-white mt-6 leading-[1.25]">
          {heading}
        </h2>
        <p className="cta-desc text-[17px] leading-[1.7] text-[rgba(255,255,255,0.75)] font-sans mt-4">
          {description}
        </p>
        <div className="mt-8">
          <Link
            to={ctaLink}
            className="cta-button inline-block text-[13px] uppercase font-sans font-semibold tracking-[0.08em] text-white bg-[#00B4D8] px-8 py-3.5 hover:bg-[#009FBF] hover:-translate-y-px hover:shadow-lg transition-all duration-300"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
