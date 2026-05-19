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

export function getImageUrl(src?: string | null): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return src;
  return `http://localhost:9000/${src}`;
}

export function SectionRenderer({ section }: { section: Section }) {
  if (!section.active) return null;

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
}
