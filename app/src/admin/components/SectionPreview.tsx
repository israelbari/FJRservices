import type { Section, Media } from '../types';
import { getStorageUrl } from '@/lib/storage';
import { Wrench } from 'lucide-react';

interface SectionPreviewProps {
  section: Section;
  medias?: Media[];
}

export function SectionPreview({ section, medias = [] }: SectionPreviewProps) {
  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return {}; }
  })();

  if (section.type === 'services-grid') {
    const hasMedias = medias.length > 0;
    const services = content.services || [];
    const overline = section.title || 'Servicios';
    const heading = section.subtitle || 'Servicios Ofrecidos';
    const description = content.description || 'Conocimiento en la manipulacion de los siguientes elementos';
    const ctaText = content.ctaText || 'Ver Todos los Servicios';
    const ctaLink = content.ctaLink || '/servicios';

    return (
      <section className="py-10 md:py-12 bg-white rounded-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-semibold">
              {overline}
            </span>
            <h2 className="mt-2 text-[22px] md:text-[26px] font-semibold text-[#1A2B3C]">
              {heading}
            </h2>
            <p className="mt-1 text-[13px] text-[#5A6B7C]">{description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hasMedias ? (
              medias.map((media) => {
                const CardContent = (
                  <div className="group bg-white border border-[#E2E8F0] overflow-hidden transition-all hover:shadow-lg hover:border-[#00B4D8]">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={getStorageUrl(media.src)}
                        alt={media.title || media.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                      />
                    </div>
                    <div className="relative p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench size={16} className="text-[#00B4D8]" />
                        <h3 className="text-[15px] font-semibold text-[#1A2B3C]">
                          {media.title || media.name}
                        </h3>
                      </div>
                      {media.link && (
                        <p className="text-[11px] text-[#00B4D8] mt-1 truncate">{media.link}</p>
                      )}
                      <div className="absolute bottom-0 left-0 h-[3px] bg-[#00B4D8] w-0 group-hover:w-full transition-all" />
                    </div>
                  </div>
                );
                return media.link ? (
                  <a key={media.id} href={media.link} className="block no-underline" target="_blank" rel="noopener noreferrer">
                    {CardContent}
                  </a>
                ) : (
                  <div key={media.id}>{CardContent}</div>
                );
              })
            ) : services.length > 0 ? (
              services.map((service: { title: string; image: string }, idx: number) => (
                <div key={idx} className="group bg-white border border-[#E2E8F0] overflow-hidden transition-all hover:shadow-lg hover:border-[#00B4D8]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                    />
                  </div>
                  <div className="relative p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={16} className="text-[#00B4D8]" />
                      <h3 className="text-[15px] font-semibold text-[#1A2B3C]">{service.title}</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#00B4D8] w-0 group-hover:w-full transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#94A3B8] col-span-full text-center py-8">
                No hay servicios configurados. Agrega imagenes o define servicios en el contenido JSON.
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <a
              href={ctaLink}
              className="inline-block border border-[#00B4D8] text-[#00B4D8] text-[12px] uppercase font-semibold tracking-[0.08em] px-6 py-2 rounded-full transition-all hover:bg-[#00B4D8] hover:text-white"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === 'gallery') {
    const hasMedias = medias.length > 0;
    const contentItems = content.items || [];
    const items = hasMedias
      ? medias.map((media) => ({
          id: media.id,
          image: media.src,
          title: media.title || media.name,
        }))
      : contentItems;
    const overline = section.title || 'Experiencia';
    const heading = section.subtitle || 'Trabajos';
    const description = content.description || 'A continuacion una recopilacion de algunos de nuestros trabajos';

    return (
      <section className="py-10 md:py-12 bg-[#F5F7FA] rounded-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-semibold">
              {overline}
            </span>
            <h2 className="mt-2 text-[22px] md:text-[26px] font-semibold text-[#1A2B3C]">
              {heading}
            </h2>
            <p className="mt-1 text-[13px] text-[#5A6B7C]">{description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.length > 0 ? (
              items.map((item: { id: string | number; image: string; title: string }) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden">
                  <img
                    src={hasMedias ? getStorageUrl(item.image) : item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-[rgba(10,22,40,0.6)] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-[12px] text-white font-medium">{item.title}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#94A3B8] col-span-full text-center py-8">
                No hay imagenes configuradas. Agrega imagenes o define items en el contenido JSON.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === 'brands') {
    const DEFAULT_BRANDS = [
      { name: 'Caterpillar', color: '#FFCC00' },
      { name: 'Volvo Penta', color: '#003B7E' },
      { name: 'Yanmar', color: '#E60012' },
      { name: 'Cummins', color: '#E31937' },
      { name: 'Kohler', color: '#001E4F' },
      { name: 'Fischer Panda', color: '#000000' },
    ];
    const hasMedias = medias.length > 0;
    const brands = content.brands || DEFAULT_BRANDS;
    const overline = section.title || 'Confianza';
    const heading = section.subtitle || 'Marcas';
    const description = content.description || 'Tenemos experiencia en las siguientes marcas';

    return (
      <section className="py-10 md:py-12 bg-white rounded-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#00B4D8] font-semibold">
              {overline}
            </span>
            <h2 className="mt-2 text-[22px] md:text-[26px] font-semibold text-[#1A2B3C]">
              {heading}
            </h2>
            <p className="mt-1 text-[13px] text-[#5A6B7C]">{description}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {hasMedias ? (
              medias.map((media) => (
                <div key={media.id} className="flex items-center justify-center min-w-[100px] min-h-[40px] opacity-60 hover:opacity-100 transition-all">
                  <img
                    src={getStorageUrl(media.src)}
                    alt={media.title || media.name}
                    className="h-8 w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))
            ) : (
              brands.map((brand: { name: string; color: string }) => (
                <div key={brand.name} className="flex items-center justify-center min-w-[100px] min-h-[40px] opacity-60 hover:opacity-100 transition-all">
                  <span className="text-[#5A6B7C] font-semibold text-sm" style={{ color: brand.color }}>
                    {brand.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === 'clubs') {
    const clubs = content.clubs || [];
    const mapUrl = content.mapUrl || '';
    const overline = section.title || 'Ubicacion';
    const heading = section.subtitle || 'Clubes Nauticos y Puertos';
    const description = content.description || '';

    return (
      <section className="py-8 md:py-10 bg-[#001529] rounded-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#66D6ED] font-semibold">{overline}</span>
            <h2 className="mt-2 text-[20px] md:text-[24px] font-semibold text-white">{heading}</h2>
            {description && <p className="mt-1 text-[12px] text-[rgba(255,255,255,0.7)]">{description}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mapUrl ? (
              <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] min-h-[200px]">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '200px', filter: 'brightness(0.7) hue-rotate(200deg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa preview"
                />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] min-h-[200px] flex items-center justify-center bg-[#0A1628]">
                <p className="text-[12px] text-[rgba(255,255,255,0.4)]">Mapa no configurado</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {clubs.length > 0 ? (
                clubs.map((club: { id: string; name: string; location: string; mapLink?: string }) => (
                  <a
                    key={club.id}
                    href={club.mapLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 border-b border-[rgba(255,255,255,0.1)] transition-all hover:bg-[rgba(255,255,255,0.05)] group rounded-md"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00B4D8] flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                      {club.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-white">{club.name}</h4>
                      <span className="text-[11px] text-[rgba(255,255,255,0.6)]">{club.location}</span>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-[12px] text-[rgba(255,255,255,0.4)] text-center py-4">No hay clubes configurados</p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === 'hero') {
    const heading = section.subtitle || 'Servicios Nauticos Profesionales';
    const overline = section.title || 'FJR SERVICES';
    const ctaText = content.ctaText || 'Descubre Nuestros Servicios';
    const ctaLink = content.ctaLink || '/servicios';
    const hasMedia = medias.length > 0;

    return (
      <section className="relative py-16 md:py-20 bg-[#1A2B3C] rounded-lg overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {hasMedia ? (
            <img src={getStorageUrl(medias[0].src)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#1A2B3C] to-[#0A1628]" />
          )}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#00B4D8] font-semibold">
            {overline}
          </span>
          <h1 className="mt-3 text-[28px] md:text-[36px] font-bold text-white">
            {heading}
          </h1>
          <div className="mt-6">
            <a href={ctaLink} className="inline-block bg-[#00B4D8] text-white text-[12px] uppercase font-semibold tracking-[0.08em] px-6 py-2.5 rounded-full transition-all hover:bg-[#0095B6]">
              {ctaText}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Generic preview for other section types
  return (
    <div className="py-8 px-4 text-center">
      <p className="text-sm text-[#94A3B8] mb-4">
        Vista previa generica para seccion tipo <span className="font-semibold text-[#1E293B]">{section.type}</span>
      </p>
      <div className="border border-[#E2E8F0] rounded-lg p-6 bg-[#F8FAFC]">
        <h3 className="text-lg font-semibold text-[#1A2B3C]">{section.title || 'Sin titulo'}</h3>
        {section.subtitle && <p className="text-sm text-[#5A6B7C] mt-1">{section.subtitle}</p>}
        {medias.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {medias.map((m) => (
              <div key={m.id} className="w-16 h-16 rounded overflow-hidden border border-[#E2E8F0]">
                <img
                  src={getStorageUrl(m.src)}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
