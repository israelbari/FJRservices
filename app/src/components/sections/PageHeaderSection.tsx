import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

export function PageHeaderSection({ section }: { section: Section }) {
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const overline = section.title || '';
  const heading = section.subtitle || 'Pagina';
  const description = content.description || '';
  const bgImage = getImageUrl(section.imageUrl);
  const breadcrumb = content.breadcrumb || [{ label: 'Inicio', href: '/' }, { label: heading }];

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from('.ph-breadcrumb', { opacity: 0, duration: 0.4 })
      .from('.ph-heading', { clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: 0.7, ease: 'expo.out' }, '-=0.25')
      .from('.ph-desc', { opacity: 0, y: 25, duration: 0.6 }, '-=0.35');
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[45vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden bg-[#001529]">
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,22,40,0.4)] to-[rgba(10,22,40,0.75)]" />
        </div>
      )}

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-24">
        {overline && (
          <span className="ph-overline text-[12px] uppercase tracking-[0.15em] text-[#66D6ED] font-inter font-semibold">
            {overline}
          </span>
        )}
        <nav className="ph-breadcrumb text-[13px] text-[rgba(255,255,255,0.5)] font-sans mt-2">
          {breadcrumb.map((crumb: { label: string; href?: string }, i: number) => (
            <span key={i}>
              {i > 0 && <span className="mx-2">&gt;</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="ph-heading mt-4 text-[36px] md:text-[42px] lg:text-[48px] font-sans font-bold text-white leading-[1.2] tracking-[-0.01em]">
          {heading}
        </h1>

        {description && (
          <p className="ph-desc mt-4 text-[17px] leading-[1.7] text-[rgba(255,255,255,0.75)] font-sans max-w-[700px] mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
