import { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';
import { ImageCarousel } from './ImageCarousel';

export function HeroSection({ section }: { section: Section }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlineRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const overline = section.title || 'FJR SERVICES';
  const heading = section.subtitle || 'Reparacion y Mantenimiento de Embarcaciones';
  const description = content.description || 'Especialistas en mecanica, pintura y electronica naval. Resultados garantizados para que solo te preocupes de navegar.';
  const ctaText = content.ctaText || 'Ver Servicios';
  const ctaTarget = content.ctaTarget || 'servicios';
  const bgImage = getImageUrl(section.imageUrl || '/hero-yacht.jpg');
  const video = section.videos && section.videos.length > 0 ? section.videos[0] : null;
  const videoSrc = video?.src ? `http://localhost:9000/${video.src}` : null;
  const playbackRate = video?.playbackRate ?? 1;
  const hasMedias = section.medias && section.medias.length > 0;

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlineRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 })
      .fromTo(headingRef.current, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'expo.out' }, '-=0.2')
      .fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
  }, { scope: heroRef });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, videoSrc]);

  const scrollToTarget = () => {
    const el = document.getElementById(ctaTarget);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative w-full min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : hasMedias ? (
          <>
            <ImageCarousel
              images={section.medias!}
              autoPlay
              interval={6000}
              showDots={false}
              showArrows={false}
              aspectRatio=""
              className="w-full h-full"
            />
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(90deg, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.3) 100%)',
              }}
            />
          </>
        ) : (
          <img
            src={bgImage}
            alt="Luxury yacht"
            className="w-full h-full object-cover animate-ken-burns"
          />
        )}
        {!hasMedias && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.3) 100%)',
            }}
          />
        )}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-[72px]">
        <div className="max-w-[640px] py-20 md:py-32">
          <div ref={overlineRef} className="opacity-0">
            <span className="text-[12px] uppercase tracking-[0.15em] text-[#66D6ED] font-inter font-semibold">
              {overline}
            </span>
          </div>

          <h1
            ref={headingRef}
            className="mt-4 text-[40px] md:text-[48px] lg:text-[64px] font-sans font-bold text-white leading-[1.1] tracking-[-0.02em]"
            style={{ textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}
          >
            {heading}
          </h1>

          <p
            ref={descRef}
            className="mt-6 text-[17px] leading-[1.7] text-[rgba(255,255,255,0.8)] max-w-[520px] opacity-0"
          >
            {description}
          </p>

          <div ref={ctaRef} className="mt-8 opacity-0">
            <button
              onClick={scrollToTarget}
              className="bg-[#00B4D8] text-white text-[13px] uppercase font-semibold tracking-[0.08em] px-8 py-[14px] rounded-full font-inter transition-all duration-300 hover:bg-[#009FBF] hover:-translate-y-px hover:shadow-lg"
            >
              {ctaText}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTarget}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] transition-colors animate-bounce-chevron"
        aria-label="Desplazar hacia abajo"
      >
        <ChevronDown size={24} />
      </button>
    </section>
  );
}
