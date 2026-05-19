import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Section } from '@/admin/types';
import { getImageUrl } from './SectionRenderer';

const DEFAULT_ITEMS = [
  { id: 1, image: '/gallery-1.jpg', category: 'Motores', title: 'Revision de Motor' },
  { id: 2, image: '/gallery-2.jpg', category: 'Pintura', title: 'Pintura de Casco' },
  { id: 3, image: '/gallery-3.jpg', category: 'Electronica', title: 'Instalacion Electronica' },
  { id: 4, image: '/gallery-4.jpg', category: 'Colaboracion', title: 'Pulido de Helice' },
  { id: 5, image: '/gallery-5.jpg', category: 'Motores', title: 'Rehabilitacion de Sala' },
  { id: 6, image: '/gallery-6.jpg', category: 'Electronica', title: 'Instalacion AC' },
  { id: 7, image: '/gallery-7.jpg', category: 'Colaboracion', title: 'Limpieza de Deposito' },
  { id: 8, image: '/gallery-8.jpg', category: 'Pintura', title: 'Restauracion Interior' },
];

const DEFAULT_FILTERS = ['Todos', 'Colaboracion', 'Motores', 'Pintura', 'Electronica'];

export function GallerySection({ section }: { section: Section }) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const items = content.items || DEFAULT_ITEMS;
  const filters = content.filters || DEFAULT_FILTERS;
  const overline = section.title || 'Experiencia';
  const heading = section.subtitle || 'Trabajos';
  const description = content.description || 'A continuacion una recopilacion de algunos de nuestros trabajos';

  const filteredItems =
    activeFilter === 'Todos'
      ? items
      : items.filter((item: { category: string }) => item.category === activeFilter);

  return (
    <section id="trabajos" ref={sectionRef} className="py-20 md:py-24 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-8">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-inter font-semibold">
            {overline}
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-[#1A2B3C]">
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-[#5A6B7C]">{description}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filters.map((filter: string) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={
                'px-5 py-2 text-[13px] font-inter font-medium transition-all duration-300 border rounded-full ' +
                (activeFilter === filter
                  ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                  : 'bg-transparent text-[#5A6B7C] border-[#D1D5DB] hover:border-[#00B4D8] hover:text-[#00B4D8]')
              }
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredItems.map((item: { id: number; image: string; category: string; title: string }) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="group relative aspect-square overflow-hidden cursor-pointer"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-[rgba(10,22,40,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] flex flex-col justify-end p-4">
                  <span className="text-[12px] uppercase tracking-[0.1em] text-[#00B4D8] font-inter font-semibold">
                    {item.category}
                  </span>
                  <span className="text-[14px] text-white font-sans font-medium mt-1">{item.title}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
