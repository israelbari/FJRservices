import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Page, Section } from '@/admin/types';

interface UsePageResult {
  page: Page | null;
  sections: Section[];
  loading: boolean;
  error: string | null;
}

export function usePage(slug: string): UsePageResult {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/pages/slug/${slug}`)
      .then((res) => {
        const pageData = res.data as Page;
        setPage(pageData);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar la pagina');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const sections = page?.sections
    ? [...page.sections]
        .filter((s) => s.active)
        .sort((a, b) => a.order - b.order)
    : [];

  return { page, sections, loading, error };
}
