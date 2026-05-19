import { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Wrench,
  Users,
  Mail,
  Search,
  ExternalLink,
  Pencil,
  Eye,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Page, Section } from '../types';
import { getPages, getSections, createPage, updatePage, deletePage } from '../services/api.service';

const PAGE_ICONS: Record<string, { icon: typeof Home; color: string; bg: string }> = {
  inicio: { icon: Home, color: '#4A90D9', bg: '#EFF6FF' },
  servicios: { icon: Wrench, color: '#E8913A', bg: '#FFF7ED' },
  nosotros: { icon: Users, color: '#10B981', bg: '#F0FDF4' },
  contacto: { icon: Mail, color: '#EF4444', bg: '#FEF2F2' },
};

const SLUG_TO_ROUTE: Record<string, string> = {
  inicio: '/',
  servicios: '/servicios',
  nosotros: '/nosotros',
  contacto: '/contacto',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Page>('order');
  const [sortAsc, setSortAsc] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRoute, setFormRoute] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pagesData, sectionsData] = await Promise.all([getPages(), getSections()]);
        setPages(pagesData);
        setSections(sectionsData);
      } catch {
        toast.error('Error al cargar los datos');
      }
    };
    load();
  }, []);

  const filteredPages = useMemo(() => {
    let result = [...pages];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va;
      }
      return 0;
    });
    return result;
  }, [pages, search, sortField, sortAsc]);

  const getSectionCount = (pageId: string) => {
    const pageSections = sections.filter((s) => s.pageId === pageId);
    const activeCount = pageSections.filter((s) => s.active).length;
    return { total: pageSections.length, active: activeCount };
  };

  const resetForm = () => {
    setFormName('');
    setFormRoute('');
    setFormMetaTitle('');
    setFormMetaDesc('');
    setFormActive(true);
    setSelectedPage(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEdit = (page: Page) => {
    setSelectedPage(page);
    setFormName(page.title);
    setFormRoute(SLUG_TO_ROUTE[page.slug] || `/${page.slug}`);
    setFormMetaTitle(page.title);
    setFormMetaDesc(page.description);
    setFormActive(page.active);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openView = (page: Page) => {
    setSelectedPage(page);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const confirmDelete = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.id);
      const refreshed = await getPages();
      setPages(refreshed);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch {
      toast.error('Error al eliminar la pagina');
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !formRoute.trim()) return;

    const slug = formRoute.replace(/^\//, '').replace(/\//g, '-') || 'page';

    try {
      if (dialogMode === 'edit' && selectedPage) {
        await updatePage(selectedPage.id, {
          title: formName.trim(),
          slug,
          description: formMetaDesc.trim(),
          active: formActive,
          order: selectedPage.order,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await createPage({
          title: formName.trim(),
          slug,
          description: formMetaDesc.trim(),
          active: formActive,
          order: pages.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      const refreshed = await getPages();
      setPages(refreshed);
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Error al guardar la pagina');
    }
  };

  const toggleStatus = async (page: Page) => {
    try {
      await updatePage(page.id, {
        active: !page.active,
        updatedAt: new Date().toISOString(),
      });
      const refreshed = await getPages();
      setPages(refreshed);
    } catch {
      toast.error('Error al actualizar el estado de la pagina');
    }
  };

  const handleSort = (field: keyof Page) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ field }: { field: keyof Page }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-[#CBD5E1] ml-1" />;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 text-[#4A90D9] ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#4A90D9] ml-1" />
    );
  };

  return (
    <div className="bg-[#F1F5F9] min-h-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight tracking-tight">
            Gestion de Paginas
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Gestiona el contenido de las paginas publicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#D1D5DB] text-[#374151] hover:border-[#4A90D9] hover:text-[#4A90D9] rounded-lg h-9"
            onClick={() => window.open('/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Sitio
          </Button>
          <Button
            onClick={openCreate}
            className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg h-9 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Pagina
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            placeholder="Buscar paginas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#D1D5DB] rounded-lg h-10 focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC] border-b border-[#E2E8F0] h-12">
              <TableHead
                className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] cursor-pointer select-none"
                onClick={() => handleSort('title')}
              >
                <span className="flex items-center">
                  Pagina
                  <SortIcon field="title" />
                </span>
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[110px]">
                Estado
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[120px]">
                Secciones
              </TableHead>
              <TableHead
                className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[150px] cursor-pointer select-none"
                onClick={() => handleSort('updatedAt')}
              >
                <span className="flex items-center">
                  Ultima edicion
                  <SortIcon field="updatedAt" />
                </span>
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[130px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#94A3B8]">
                  <div className="flex flex-col items-center">
                    <Search className="w-10 h-10 text-[#CBD5E1] mb-3" />
                    <p className="text-sm">No hay registros</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPages.map((page) => {
                const iconData = PAGE_ICONS[page.slug] || { icon: Home, color: '#4A90D9', bg: '#EFF6FF' };
                const IconComp = iconData.icon;
                const counts = getSectionCount(page.id);
                const route = SLUG_TO_ROUTE[page.slug] || `/${page.slug}`;

                return (
                  <TableRow
                    key={page.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors h-14"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: iconData.bg }}
                        >
                          <IconComp className="w-[18px] h-[18px]" style={{ color: iconData.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B]">{page.title}</p>
                          <p className="text-[12px] text-[#94A3B8] font-mono">{route}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={page.active}
                          onCheckedChange={() => toggleStatus(page)}
                          className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                        />
                        <span className={`text-xs font-medium ${page.active ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
                          {page.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-[#64748B]">
                        <span className="font-medium">{counts.active}</span>
                        {' / '}
                        {counts.total}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-[#94A3B8]">{formatDate(page.updatedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: '#E6F9FD' }}
                          onClick={() => openEdit(page)}
                          title="Editar"
                        >
                          <Pencil className="w-[18px] h-[18px]" style={{ color: '#00B4D8' }} />
                        </div>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: '#E2E8F0' }}
                          onClick={() => openView(page)}
                          title="Ver"
                        >
                          <Eye className="w-[18px] h-[18px]" style={{ color: '#001529' }} />
                        </div>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: '#FEE2E2' }}
                          onClick={() => confirmDelete(page)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-[18px] h-[18px]" style={{ color: '#EF4444' }} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit/View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl shadow-2xl max-w-[520px] p-0 gap-0 border-[#E2E8F0]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#E2E8F0]">
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {dialogMode === 'create'
                ? 'Nueva Pagina'
                : dialogMode === 'edit'
                  ? `Editar Pagina: ${selectedPage?.title}`
                  : `Detalles de Pagina: ${selectedPage?.title}`}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5">
            {dialogMode === 'view' && selectedPage ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-5">
                  {(() => {
                    const iconData = PAGE_ICONS[selectedPage.slug] || { icon: Home, color: '#4A90D9', bg: '#EFF6FF' };
                    const IconComp = iconData.icon;
                    return (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: iconData.bg }}
                      >
                        <IconComp className="w-6 h-6" style={{ color: iconData.color }} />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-base font-semibold text-[#1E293B]">{selectedPage.title}</p>
                    <p className="text-xs text-[#94A3B8] font-mono">
                      {SLUG_TO_ROUTE[selectedPage.slug] || `/${selectedPage.slug}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-1">
                      Estado
                    </p>
                    <Badge
                      className={
                        selectedPage.active
                          ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]'
                          : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#F1F5F9]'
                      }
                    >
                      {selectedPage.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-1">
                      Secciones
                    </p>
                    <p className="text-sm font-medium text-[#1E293B]">
                      {getSectionCount(selectedPage.id).active} / {getSectionCount(selectedPage.id).total} activas
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-1">
                      Creada
                    </p>
                    <p className="text-sm text-[#1E293B]">{formatDate(selectedPage.createdAt)}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-1">
                      Ultima edicion
                    </p>
                    <p className="text-sm text-[#1E293B]">{formatDate(selectedPage.updatedAt)}</p>
                  </div>
                </div>

                {selectedPage.description && (
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-1">
                      Descripcion
                    </p>
                    <p className="text-sm text-[#1E293B]">{selectedPage.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                    Nombre <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    placeholder="Ej: Servicios"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                    Ruta <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    placeholder="Ej: /servicios"
                    value={formRoute}
                    onChange={(e) => setFormRoute(e.target.value)}
                    className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-1">Ruta publica del sitio web</p>
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                    Meta titulo
                  </Label>
                  <Input
                    placeholder="Titulo para SEO"
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Aparece en la pestana del navegador
                  </p>
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                    Meta descripcion
                  </Label>
                  <Textarea
                    placeholder="Descripcion para SEO y redes sociales"
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    rows={3}
                    className="border-[#D1D5DB] rounded-lg focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-[13px] font-medium text-[#374151] block">
                      Estado
                    </Label>
                    <p className="text-[11px] text-[#94A3B8]">
                      {formActive ? 'La pagina es visible en el sitio' : 'La pagina esta oculta'}
                    </p>
                  </div>
                  <Switch
                    checked={formActive}
                    onCheckedChange={setFormActive}
                    className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0] gap-2">
            {dialogMode === 'view' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-[#D1D5DB] text-[#374151] rounded-lg"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedPage) openEdit(selectedPage);
                  }}
                  className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="border-[#D1D5DB] text-[#374151] rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formName.trim() || !formRoute.trim()}
                  className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg disabled:opacity-50"
                >
                  {dialogMode === 'create' ? 'Crear Pagina' : 'Guardar Cambios'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-[#E2E8F0] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-[#1E293B]">
              Eliminar Pagina
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#64748B]">
              Esta seguro de que desea eliminar la pagina &quot;
              <span className="font-medium text-[#1E293B]">{pageToDelete?.title}</span>&quot;? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-[#D1D5DB] text-[#374151] rounded-lg hover:bg-[#F8FAFC]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
