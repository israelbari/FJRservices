import type { Section } from '@/admin/types';
import { HeroSection } from './HeroSection';
import { ServicesGridSection } from './ServicesGridSection';
import { GallerySection } from './GallerySection';
import { BrandsSection } from './BrandsSection';
import { ClubsSection } from './ClubsSection';
import { WeatherAppsSection } from './WeatherAppsSection';
import { MaintenanceSection } from './MaintenanceSection';
import { ContactSection } from './ContactSection';
import { PageHeaderSection } from './PageHeaderSection';
import { ContentSection } from './ContentSection';
import { StatsSection } from './StatsSection';
import { CTASection } from './CTASection';
import { InfoCardsSection } from './InfoCardsSection';
import { ValuesSection } from './ValuesSection';
import { ServiceCategoriesSection } from './ServiceCategoriesSection';
import { ServiceDetailSection } from './ServiceDetailSection';

import { getStorageUrl } from '@/lib/storage';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Pencil } from 'lucide-react';

export function getImageUrl(src?: string | null): string {
  return getStorageUrl(src);
}

function AdminEditButton({ sectionId }: { sectionId: string }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;

  return (
    <a
      href={`/admin/secciones?edit=${sectionId}`}
      className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-[#E8913A] hover:bg-[#D47A2A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg opacity-80 hover:opacity-100 transition-opacity"
      style={{ position: 'absolute' }}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `/admin/secciones?edit=${sectionId}`;
      }}
    >
      <Pencil className="w-3 h-3" />
      Editar seccion
    </a>
  );
}

export function SectionRenderer({ section }: { section: Section }) {
  if (!section.active) return null;

  const rendered = (() => {
    switch (section.type) {
      case 'hero':
        return <HeroSection section={section} />;
      case 'services-grid':
        return <ServicesGridSection section={section} />;
      case 'gallery':
        return <GallerySection section={section} />;
      case 'brands':
        return <BrandsSection section={section} />;
      case 'clubs':
        return <ClubsSection section={section} />;
      case 'weather-apps':
        return <WeatherAppsSection section={section} />;
      case 'maintenance':
        return <MaintenanceSection section={section} />;
      case 'contact':
        return <ContactSection section={section} />;
      case 'page-header':
        return <PageHeaderSection section={section} />;
      case 'content':
        return <ContentSection section={section} />;
      case 'stats':
        return <StatsSection section={section} />;
      case 'cta':
        return <CTASection section={section} />;
      case 'info-cards':
        return <InfoCardsSection section={section} />;
      case 'values':
        return <ValuesSection section={section} />;
      case 'service-categories':
        return <ServiceCategoriesSection section={section} />;
      case 'service-detail':
        return <ServiceDetailSection section={section} />;
      default:
        return (
          <div className="py-12 bg-gray-100 text-center">
            <p className="text-gray-500">Tipo de seccion no soportado: {section.type}</p>
          </div>
        );
    }
  })();

  return (
    <div className="relative">
      <AdminEditButton sectionId={section.id} />
      {rendered}
    </div>
  );
}
