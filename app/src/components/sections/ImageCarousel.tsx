import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Media } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

interface ImageCarouselProps {
  images: Media[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  aspectRatio?: string;
}

export function ImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  aspectRatio = 'aspect-video',
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, goNext, images.length]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${aspectRatio} ${className}`}>
        <img
          src={getImageUrl(images[0].src)}
          alt={images[0].name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div className={`relative ${aspectRatio}`}>
        {images.map((img, idx) => (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={getImageUrl(img.src)}
              alt={img.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === current
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
