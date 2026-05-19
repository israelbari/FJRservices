import { usePage } from '@/hooks/usePage';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import type { Section } from '@/admin/types';

const FB = (id: string, type: string): Section => ({
  id, type, pageId: '', title: '', subtitle: '', content: '{}',
  active: true, order: 0, createdAt: '', updatedAt: '',
});

const FALLBACK_SECTIONS: Section[] = [
  FB('hero-fb', 'hero'),
  FB('services-fb', 'services-grid'),
  FB('gallery-fb', 'gallery'),
  FB('brands-fb', 'brands'),
  FB('clubs-fb', 'clubs'),
  FB('weather-fb', 'weather-apps'),
  FB('maintenance-fb', 'maintenance'),
  FB('contact-fb', 'contact'),
];

export default function Home() {
  const { sections, loading } = usePage('inicio');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001529]">
        <div className="text-white text-sm animate-pulse">Cargando...</div>
      </div>
    );
  }

  const displaySections = sections.length > 0 ? sections : FALLBACK_SECTIONS;

  return (
    <div>
      {displaySections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
