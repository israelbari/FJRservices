import { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Wrench,
  Users,
  Mail,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Flame,
  Grid3X3,
  Image,
  Award,
  MapPin,
  Cloud,
  PanelTop,
  BarChart3,
  FileText,
  Layers,
  GripVertical,
  CheckSquare,
  Square,
  ArrowUpDown,
  HeartHandshake,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Page, Section, Media } from '../types';
import { getPages, getSections, createSection, updateSection, deleteSection, getMedia, updateMedia } from '../services/api.service';

const PAGE_TABS = [
  { id: 'p1', label: 'Inicio', icon: Home, color: '#4A90D9', bg: '#EFF6FF' },
  { id: 'p2', label: 'Servicios', icon: Wrench, color: '#E8913A', bg: '#FFF7ED' },
  { id: 'p3', label: 'Nosotros', icon: Users, color: '#10B981', bg: '#F0FDF4' },
  { id: 'p4', label: 'Contacto', icon: Mail, color: '#EF4444', bg: '#FEF2F2' },
];

const SECTION_TYPE_CONFIG: Record<string, { label: string; icon: typeof Flame; color: string; bg: string }> = {
  hero: { label: 'Hero (Banner principal)', icon: Flame, color: '#EF4444', bg: '#FEF2F2' },
  'services-grid': { label: 'Grid de servicios', icon: Grid3X3, color: '#4A90D9', bg: '#EFF6FF' },
  content: { label: 'Contenido (Texto + imagen)', icon: FileText, color: '#4A90D9', bg: '#EFF6FF' },
  gallery: { label: 'Galeria de imagenes', icon: Image, color: '#10B981', bg: '#F0FDF4' },
  brands: { label: 'Marcas / Logos', icon: Award, color: '#E8913A', bg: '#FFF7ED' },
  clubs: { label: 'Clubes / Mapa', icon: MapPin, color: '#4A90D9', bg: '#EFF6FF' },
  'weather-apps': { label: 'Apps recomendadas', icon: Cloud, color: '#10B981', bg: '#F0FDF4' },
  maintenance: { label: 'Mantenimiento (Carrusel)', icon: Wrench, color: '#EF4444', bg: '#FEF2F2' },
  contact: { label: 'Contacto + Formulario', icon: Mail, color: '#EF4444', bg: '#FEF2F2' },
  'page-header': { label: 'Header de pagina', icon: PanelTop, color: '#64748B', bg: '#F1F5F9' },
  stats: { label: 'Estadisticas', icon: BarChart3, color: '#E8913A', bg: '#FFF7ED' },
  cta: { label: 'Llamada a la accion', icon: Flame, color: '#EF4444', bg: '#FEF2F2' },
  'info-cards': { label: 'Tarjetas de info', icon: Grid3X3, color: '#4A90D9', bg: '#EFF6FF' },
  values: { label: 'Valores empresa', icon: HeartHandshake, color: '#10B981', bg: '#F0FDF4' },
};

export default function Sections() {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [reorderMode, setReorderMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate'>('activate');

  // Media picker state
  const [sectionMedias, setSectionMedias] = useState<Media[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formPageId, setFormPageId] = useState('p1');
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [formType, setFormType] = useState('content');
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

  const allUniqueTypes = useMemo(() => {
    const types = new Set<string>();
    sections.forEach((s) => types.add(s.type));
    return Array.from(types).sort();
  }, [sections]);

  const filteredSections = useMemo(() => {
    let result = [...sections];
    if (selectedPageId !== 'all') {
      result = result.filter((s) => s.pageId === selectedPageId);
    }
    if (typeFilter !== 'all') {
      result = result.filter((s) => s.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
    }
    // Sort by page then order
    result.sort((a, b) => {
      if (a.pageId !== b.pageId) {
        const pageOrderA = PAGE_TABS.findIndex((p) => p.id === a.pageId);
        const pageOrderB = PAGE_TABS.findIndex((p) => p.id === b.pageId);
        return pageOrderA - pageOrderB;
      }
      return a.order - b.order;
    });
    return result;
  }, [sections, selectedPageId, typeFilter, search]);

  const getPageName = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    return page?.title || pageId;
  };

  const resetForm = () => {
    setFormPageId('p1');
    setFormName('');
    setFormTitle('');
    setFormSubtitle('');
    setFormContent('');
    setFormOrder(1);
    setFormType('content');
    setFormActive(true);
    setSelectedSection(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEdit = async (section: Section) => {
    setSelectedSection(section);
    setFormPageId(section.pageId);
    setFormName(section.title);
    setFormTitle(section.title);
    setFormSubtitle(section.subtitle);
    setFormContent(section.content);
    setFormOrder(section.order);
    setFormType(section.type);
    setFormActive(section.active);
    // Load assigned medias
    try {
      const all = await getMedia();
      const assigned = all.filter((m: Media) => m.sectionId === section.id).sort((a: Media, b: Media) => (a.order || 0) - (b.order || 0));
      setSectionMedias(assigned);
    } catch {
      setSectionMedias([]);
    }
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const confirmDelete = (section: Section) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!sectionToDelete) return;
    try {
      await deleteSection(sectionToDelete.id);
      const refreshed = await getSections();
      setSections(refreshed);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
    } catch {
      toast.error('Error al eliminar la seccion');
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    try {
      if (dialogMode === 'edit' && selectedSection) {
        await updateSection(selectedSection.id, {
          pageId: formPageId,
          title: formTitle.trim() || formName.trim(),
          subtitle: formSubtitle.trim(),
          content: formContent.trim(),
          order: formOrder,
          active: formActive,
          type: formType,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await createSection({
          pageId: formPageId,
          title: formTitle.trim() || formName.trim(),
          subtitle: formSubtitle.trim(),
          content: formContent.trim(),
          type: formType,
          order: formOrder,
          active: formActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      const refreshed = await getSections();
      setSections(refreshed);
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Error al guardar la seccion');
    }
  };

  const toggleSectionStatus = async (section: Section) => {
    try {
      await updateSection(section.id, {
        active: !section.active,
        updatedAt: new Date().toISOString(),
      });
      const refreshed = await getSections();
      setSections(refreshed);
    } catch {
      toast.error('Error al actualizar el estado de la seccion');
    }
  };

  const moveSection = async (section: Section, direction: 'up' | 'down') => {
    const pageSections = sections
      .filter((s) => s.pageId === section.pageId)
      .sort((a, b) => a.order - b.order);
    const idx = pageSections.findIndex((s) => s.id === section.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === pageSections.length - 1) return;

    const swapWith = direction === 'up' ? pageSections[idx - 1] : pageSections[idx + 1];
    try {
      await Promise.all([
        updateSection(section.id, { order: swapWith.order, updatedAt: new Date().toISOString() }),
        updateSection(swapWith.id, { order: section.order, updatedAt: new Date().toISOString() }),
      ]);
      const refreshed = await getSections();
      setSections(refreshed);
    } catch {
      toast.error('Error al reordenar las secciones');
    }
  };

  const toggleRowSelection = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredSections.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredSections.map((s) => s.id)));
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  // Media picker functions
  const openMediaPicker = async () => {
    try {
      const all = await getMedia();
      setAllMedia(all);
      setPickerSelectedIds(new Set());
      setMediaPickerOpen(true);
    } catch {
      toast.error('Error al cargar media');
    }
  };

  const togglePickerMedia = (id: string) => {
    setPickerSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const assignSelectedMedias = async () => {
    if (!selectedSection || pickerSelectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(pickerSelectedIds).map((id, idx) =>
          updateMedia(id, { sectionId: selectedSection.id, order: sectionMedias.length + idx })
        )
      );
      const all = await getMedia();
      const assigned = all.filter((m: Media) => m.sectionId === selectedSection.id).sort((a: Media, b: Media) => (a.order || 0) - (b.order || 0));
      setSectionMedias(assigned);
      setMediaPickerOpen(false);
      toast.success(`${pickerSelectedIds.size} imagen(es) asignada(s)`);
    } catch {
      toast.error('Error al asignar imagenes');
    }
  };

  const removeMediaFromSection = async (mediaId: string) => {
    try {
      await updateMedia(mediaId, { sectionId: null, order: 0 });
      setSectionMedias((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success('Imagen quitada de la seccion');
    } catch {
      toast.error('Error al quitar imagen');
    }
  };

  const moveMediaOrder = async (mediaId: string, direction: 'up' | 'down') => {
    const idx = sectionMedias.findIndex((m) => m.id === mediaId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sectionMedias.length - 1) return;

    const newMedias = [...sectionMedias];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newMedias[idx], newMedias[swapIdx]] = [newMedias[swapIdx], newMedias[idx]];

    // Update order values
    try {
      await Promise.all(
        newMedias.map((m, i) => updateMedia(m.id, { order: i }))
      );
      setSectionMedias(newMedias);
    } catch {
      toast.error('Error al reordenar');
    }
  };

  const confirmBulkAction = async () => {
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          updateSection(id, { active: bulkAction === 'activate', updatedAt: new Date().toISOString() })
        )
      );
      const refreshed = await getSections();
      setSections(refreshed);
      setSelectedRows(new Set());
      setBulkActionDialogOpen(false);
    } catch {
      toast.error('Error al actualizar las secciones');
    }
  };

  const getTypeConfig = (type: string) => {
    return SECTION_TYPE_CONFIG[type] || { label: type, icon: Layers, color: '#64748B', bg: '#F1F5F9' };
  };

  return (
    <div className="bg-[#F1F5F9] min-h-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight tracking-tight">
            Gestion de Secciones
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Administra las secciones de todas las paginas
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg h-9 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Seccion
        </Button>
      </div>

      {/* Top Bar: Page filter + Search + Type filter */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        {/* Page filter */}
        <Select value={selectedPageId} onValueChange={setSelectedPageId}>
          <SelectTrigger className="w-full lg:w-[200px] border-[#D1D5DB] rounded-lg h-10 focus:ring-[#4A90D9] focus:ring-[3px]">
            <SelectValue placeholder="Todas las paginas" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-[#E2E8F0]">
            <SelectItem value="all">Todas las paginas</SelectItem>
            {PAGE_TABS.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                <span className="flex items-center gap-2">
                  <tab.icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                  {tab.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full lg:w-[180px] border-[#D1D5DB] rounded-lg h-10 focus:ring-[#4A90D9] focus:ring-[3px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-[#E2E8F0]">
            <SelectItem value="all">Todos los tipos</SelectItem>
            {allUniqueTypes.map((t) => {
              const cfg = getTypeConfig(t);
              return (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    {cfg.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            placeholder="Buscar secciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#D1D5DB] rounded-lg h-10 focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
          />
        </div>

        {/* Reorder toggle */}
        <Button
          variant={reorderMode ? 'default' : 'outline'}
          onClick={() => setReorderMode(!reorderMode)}
          className={
            reorderMode
              ? 'bg-[#EFF6FF] border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF] rounded-lg h-10'
              : 'border-[#D1D5DB] text-[#374151] rounded-lg h-10'
          }
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {reorderMode ? 'Listo' : 'Reordenar'}
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5">
          <span className="text-sm text-[#64748B]">
            <span className="font-semibold text-[#1E293B]">{selectedRows.size}</span> seleccionadas
          </span>
          <div className="h-4 w-px bg-[#E2E8F0]" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('activate')}
            className="text-[#10B981] hover:text-[#10B981] hover:bg-[#D1FAE5] h-7 text-xs"
          >
            Activar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction('deactivate')}
            className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEE2E2] h-7 text-xs"
          >
            Desactivar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRows(new Set())}
            className="text-[#94A3B8] hover:text-[#1E293B] h-7 text-xs ml-auto"
          >
            Limpiar
          </Button>
        </div>
      )}

      {/* Sections Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC] border-b border-[#E2E8F0] h-12">
              <TableHead className="w-[40px] text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                <button onClick={toggleAllSelection} className="flex items-center justify-center">
                  {selectedRows.size === filteredSections.length && filteredSections.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#4A90D9]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#CBD5E1]" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[60px]">
                Orden
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                Nombre
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[120px]">
                Pagina
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[110px]">
                Tipo
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[100px]">
                Estado
              </TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[130px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[#94A3B8]">
                  <div className="flex flex-col items-center">
                    <Layers className="w-10 h-10 text-[#CBD5E1] mb-3" />
                    <p className="text-sm">No hay secciones</p>
                    <p className="text-xs mt-1">Ajusta los filtros o crea una nueva seccion</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSections.map((section) => {
                const typeCfg = getTypeConfig(section.type);
                const TypeIcon = typeCfg.icon;
                const isSelected = selectedRows.has(section.id);

                return (
                  <TableRow
                    key={section.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors h-14"
                  >
                    <TableCell>
                      <button
                        onClick={() => toggleRowSelection(section.id)}
                        className="flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#4A90D9]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#CBD5E1]" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-[#64748B] w-8 text-center inline-block">
                        {section.order}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {reorderMode && (
                          <GripVertical className="w-4 h-4 text-[#CBD5E1] cursor-grab" />
                        )}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: typeCfg.bg }}
                        >
                          <TypeIcon className="w-4 h-4" style={{ color: typeCfg.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B]">{section.title}</p>
                          {section.subtitle && (
                            <p className="text-[11px] text-[#94A3B8] truncate max-w-[280px]">
                              {section.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-[#64748B]">{getPageName(section.pageId)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-[11px] font-medium border-0"
                        style={{
                          backgroundColor: typeCfg.bg,
                          color: typeCfg.color,
                        }}
                      >
                        {typeCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.active}
                          onCheckedChange={() => toggleSectionStatus(section)}
                          className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {reorderMode ? (
                          <>
                            <button
                              onClick={() => moveSection(section, 'up')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#1E293B]"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveSection(section, 'down')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#1E293B]"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(section)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#1E293B]"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(section)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors text-[#64748B] hover:text-[#EF4444]"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl shadow-2xl max-w-[560px] p-0 gap-0 border-[#E2E8F0]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#E2E8F0]">
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {dialogMode === 'create' ? 'Anadir Nueva Seccion' : 'Editar Seccion'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Pagina <span className="text-[#EF4444]">*</span>
              </Label>
              <Select value={formPageId} onValueChange={setFormPageId}>
                <SelectTrigger className="w-full border-[#D1D5DB] rounded-lg h-[42px] focus:ring-[#4A90D9] focus:ring-[3px]">
                  <SelectValue placeholder="Selecciona una pagina" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-[#E2E8F0]">
                  {PAGE_TABS.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      <span className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4" style={{ color: tab.color }} />
                        {tab.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Nombre de seccion <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                placeholder="Ej: Hero Principal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Etiqueta superior <span className="text-[#94A3B8] font-normal">(overline)</span>
              </Label>
              <Input
                placeholder="Titulo que se muestra en el sitio"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Titulo principal <span className="text-[#94A3B8] font-normal">(heading grande)</span>
              </Label>
              <Input
                placeholder="Subtitulo o sobrelinea"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Tipo de seccion
              </Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="w-full border-[#D1D5DB] rounded-lg h-[42px] focus:ring-[#4A90D9] focus:ring-[3px]">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-[#E2E8F0]">
                  <SelectItem value="hero">Hero (Banner principal)</SelectItem>
                  <SelectItem value="services-grid">Grid de servicios</SelectItem>
                  <SelectItem value="content">Contenido (Texto + imagen)</SelectItem>
                  <SelectItem value="gallery">Galeria de imagenes</SelectItem>
                  <SelectItem value="brands">Marcas / Logos</SelectItem>
                  <SelectItem value="clubs">Clubes / Mapa</SelectItem>
                  <SelectItem value="weather-apps">Apps recomendadas</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento (Carrusel)</SelectItem>
                  <SelectItem value="contact">Contacto + Formulario</SelectItem>
                  <SelectItem value="page-header">Header de pagina</SelectItem>
                  <SelectItem value="stats">Estadisticas</SelectItem>
                  <SelectItem value="cta">Llamada a la accion</SelectItem>
                  <SelectItem value="info-cards">Tarjetas de info</SelectItem>
                  <SelectItem value="values">Valores empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                Contenido
              </Label>
              <Textarea
                placeholder="Contenido de la seccion..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                className="border-[#D1D5DB] rounded-lg focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Orden
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                />
                <p className="text-[11px] text-[#94A3B8] mt-1">Posicion en la pagina</p>
              </div>
              <div className="flex items-end">
                <div className="flex items-center justify-between w-full pb-2">
                  <div>
                    <Label className="text-[13px] font-medium text-[#374151] block">
                      Estado
                    </Label>
                    <p className="text-[11px] text-[#94A3B8]">
                      {formActive ? 'Visible en el sitio' : 'Oculta'}
                    </p>
                  </div>
                  <Switch
                    checked={formActive}
                    onCheckedChange={setFormActive}
                    className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                  />
                </div>
              </div>
            </div>

            {/* Media assignment (only in edit mode) */}
            {dialogMode === 'edit' && selectedSection && (
              <div className="border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[13px] font-medium text-[#374151]">Imagenes asignadas</Label>
                  <Button
                    onClick={openMediaPicker}
                    variant="outline"
                    className="h-8 px-3 text-[12px] border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF]"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Anadir
                  </Button>
                </div>
                {sectionMedias.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8]">No hay imagenes asignadas a esta seccion</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {sectionMedias.map((media, idx) => (
                      <div key={media.id} className="relative group w-[80px]">
                        <div className="w-[80px] h-[80px] rounded-lg overflow-hidden border border-[#E2E8F0]">
                          <img
                            src={media.src.startsWith('http') ? media.src : `http://localhost:9000/${media.src}`}
                            alt={media.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveMediaOrder(media.id, 'up')}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded-full bg-[#001529] text-white flex items-center justify-center disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveMediaOrder(media.id, 'down')}
                            disabled={idx === sectionMedias.length - 1}
                            className="w-6 h-6 rounded-full bg-[#001529] text-white flex items-center justify-center disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeMediaFromSection(media.id)}
                            className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#64748B] truncate mt-1">{media.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0] gap-2">
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
              disabled={!formName.trim()}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg disabled:opacity-50"
            >
              {dialogMode === 'create' ? 'Crear Seccion' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-[#E2E8F0] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-[#1E293B]">
              Eliminar Seccion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#64748B]">
              Esta seguro de que desea eliminar la seccion &quot;
              <span className="font-medium text-[#1E293B]">{sectionToDelete?.title}</span>
              &quot;? Esta accion no se puede deshacer.
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

      {/* Bulk Action Confirmation */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent className="rounded-xl border-[#E2E8F0] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-[#1E293B]">
              {bulkAction === 'activate' ? 'Activar Secciones' : 'Desactivar Secciones'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#64748B]">
              Esta seguro de que desea{' '}
              {bulkAction === 'activate' ? 'activar' : 'desactivar'} {' '}
              <span className="font-medium text-[#1E293B]">{selectedRows.size}</span> secciones
              seleccionadas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-[#D1D5DB] text-[#374151] rounded-lg hover:bg-[#F8FAFC]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkAction === 'activate'
                  ? 'bg-[#10B981] hover:bg-[#059669] text-white rounded-lg'
                  : 'bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg'
              }
            >
              {bulkAction === 'activate' ? 'Activar' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Picker Dialog */}
      <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
        <DialogContent className="rounded-xl shadow-2xl max-w-[640px] p-0 gap-0 border-[#E2E8F0]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#E2E8F0]">
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Seleccionar imagenes</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
            {allMedia.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-8">No hay imagenes disponibles</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {allMedia.map((media) => {
                  const isSelected = pickerSelectedIds.has(media.id);
                  return (
                    <button
                      key={media.id}
                      onClick={() => togglePickerMedia(media.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected ? 'border-[#E8913A] ring-1 ring-[#E8913A]' : 'border-[#E2E8F0] hover:border-[#4A90D9]'
                      }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={media.src.startsWith('http') ? media.src : `http://localhost:9000/${media.src}`}
                          alt={media.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/hero-yacht.jpg'; }}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E8913A] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                      <p className="text-[10px] text-[#64748B] truncate px-1.5 py-1 bg-white">{media.name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0] gap-2">
            <Button
              variant="outline"
              onClick={() => setMediaPickerOpen(false)}
              className="border-[#D1D5DB] text-[#374151] rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={assignSelectedMedias}
              disabled={pickerSelectedIds.size === 0}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg disabled:opacity-50"
            >
              Asignar {pickerSelectedIds.size > 0 && `(${pickerSelectedIds.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
