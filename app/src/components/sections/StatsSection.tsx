import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Section } from '@/admin/types';

gsap.registerPlugin(ScrollTrigger);

function useCountUp(end: number, suffix: string, inView: boolean) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => setValue(Math.round(obj.val)),
    });
  }, [inView, end]);

  return `${value}${suffix}`;
}

function StatItem({ number, suffix, label, inView }: { number: number; suffix: string; label: string; inView: boolean }) {
  const count = useCountUp(number, suffix, inView);

  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-sans text-[48px] font-bold text-[#00B4D8] leading-tight">{count}</span>
      <div
        className="w-10 h-[2px] bg-[#00B4D8] mt-3 origin-center"
        style={{
          transform: inView ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1) 1.2s',
        }}
      />
      <span
        className="text-[14px] uppercase tracking-[0.05em] font-sans font-medium mt-3 text-[rgba(255,255,255,0.7)]"
        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.3s ease 1.5s' }}
      >
        {label}
      </span>
    </div>
  );
}

export function StatsSection({ section }: { section: Section }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const stats = content.stats || [
    { number: 20, suffix: '+', label: 'Anos de Experiencia' },
    { number: 500, suffix: '+', label: 'Embarcaciones Atendidas' },
    { number: 6, suffix: '', label: 'Marcas Especializadas' },
    { number: 4, suffix: '', label: 'Clubes Nauticos' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      onEnter: () => setInView(true),
    });
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#001529] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 lg:gap-24">
          {stats.map((stat: { number: number; suffix: string; label: string }) => (
            <StatItem key={stat.label} {...stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
