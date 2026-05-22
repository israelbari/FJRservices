import { MapPin, ExternalLink } from 'lucide-react';
import type { Section } from '@/admin/types';

const DEFAULT_CLUBS = [
  { id: '1', name: 'Club Nautico de Cartagena', location: 'Cartagena, Murcia', mapLink: 'https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Cartagena,+Cartagena,+Espa%C3%B1a' },
  { id: '2', name: 'Club Nautico Dos Mares', location: 'La Manga del Mar Menor', mapLink: 'https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Dos+Mares,+La+Manga+del+Mar+Menor,+Espa%C3%B1a' },
  { id: '3', name: 'Club Nautico Los Alcazares', location: 'Los Alcazares', mapLink: 'https://www.google.com/maps/search/?api=1&query=Club+N%C3%A1utico+Los+Alc%C3%A1zares,+Los+Alc%C3%A1zares,+Espa%C3%B1a' },
  { id: '4', name: 'Puerto Deportivo San Pedro del Pinatar', location: 'San Pedro del Pinatar', mapLink: 'https://www.google.com/maps/search/?api=1&query=Puerto+Deportivo+San+Pedro+del+Pinatar,+San+Pedro+del+Pinatar,+Espa%C3%B1a' },
];

export function ClubsSection({ section }: { section: Section }) {
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return { text: section.content, description: section.content }; }
  })();

  const clubs = content.clubs || DEFAULT_CLUBS;
  const mapUrl = content.mapUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d201512!2d-1.2108!3d37.6257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6341c55c83fa51%3A0xe6a0cbd46944e3d4!2sCartagena%2C%20Murcia%2C%20Spain!5e0!3m2!1sen!2ses!4v1700000000000!5m2!1sen!2ses';
  const overline = section.title || 'Ubicacion';
  const heading = section.subtitle || 'Clubes Nauticos y Puertos';
  const description = content.description || 'Trabajamos en los principales clubes nauticos de la Region de Murcia';

  return (
    <section id="clubes" className="py-20 md:py-24 bg-[#001529]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#66D6ED] font-inter font-semibold">
            {overline}
          </span>
          <h2 className="mt-3 text-[28px] md:text-[32px] font-sans font-semibold text-white">
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.7)]">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] min-h-[350px]">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px', filter: 'brightness(0.7) hue-rotate(200deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Clubes Nauticos"
            />
          </div>

          <div className="flex flex-col gap-4">
            {clubs.map((club: { id: string; name: string; location: string; mapLink?: string }) => (
              <a
                key={club.id}
                href={club.mapLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 border-b border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] group rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-[#00B4D8] flex items-center justify-center text-white font-bold text-[14px] shrink-0 transition-transform group-hover:scale-110">
                  {club.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[18px] font-semibold text-white font-sans">{club.name}</h4>
                    {club.mapLink && (
                      <ExternalLink size={14} className="text-[#66D6ED] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={14} className="text-[rgba(255,255,255,0.6)]" />
                    <span className="text-[14px] text-[rgba(255,255,255,0.6)]">{club.location}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
