import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

gsap.registerPlugin(ScrollTrigger);

export function ContentSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const overline = section.title || '';
  const heading = section.subtitle || '';
  const paragraphs = content.paragraphs || (content.text ? [content.text] : content.description ? [content.description] : []);
  const images = content.images || [];
  const layout = content.layout || 'text-only'; // text-only, text-left, text-right, two-col
  const bgColor = content.bgColor || 'white';

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.content-animate'),
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }, { scope: sectionRef });

  const bgClass = bgColor === 'dark' ? 'bg-[#001529]' : bgColor === 'gray' ? 'bg-[#F5F7FA]' : 'bg-white';
  const textClass = bgColor === 'dark' ? 'text-white' : 'text-[#1A2B3C]';
  const subtextClass = bgColor === 'dark' ? 'text-[rgba(255,255,255,0.7)]' : 'text-[#5A6B7C]';
  const overlineColor = bgColor === 'dark' ? 'text-[#66D6ED]' : 'text-[#00B4D8]';

  return (
    <section ref={sectionRef} className={`py-20 md:py-24 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {(overline || heading) && (
          <div className="text-center mb-12 content-animate">
            {overline && (
              <span className={`text-[12px] uppercase tracking-[0.12em] ${overlineColor} font-inter font-semibold`}>
                {overline}
              </span>
            )}
            {heading && (
              <h2 className={`mt-3 text-[28px] md:text-[32px] font-sans font-semibold ${textClass}`}>
                {heading}
              </h2>
            )}
          </div>
        )}

        {layout === 'text-only' && paragraphs.length > 0 && (
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className={`content-animate text-[15px] leading-[1.8] ${subtextClass}`}>{p}</p>
            ))}
          </div>
        )}

        {(layout === 'text-left' || layout === 'text-right') && (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${layout === 'text-right' ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`content-animate flex flex-col gap-5 ${layout === 'text-right' ? 'lg:order-2' : ''}`}>
              {paragraphs.map((p: string, i: number) => (
                <p key={i} className={`text-[15px] leading-[1.8] ${subtextClass}`}>{p}</p>
              ))}
            </div>
            {images.length > 0 && (
              <div className={`content-animate flex flex-col gap-6 ${layout === 'text-right' ? 'lg:order-1' : ''}`}>
                {images.map((img: string, i: number) => (
                  <div key={i} className="overflow-hidden rounded-lg shadow-md">
                    <img src={getImageUrl(img)} alt="" className="w-full aspect-[3/2] object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {layout === 'two-col' && paragraphs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className={`content-animate text-[15px] leading-[1.8] ${subtextClass}`}>{p}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
