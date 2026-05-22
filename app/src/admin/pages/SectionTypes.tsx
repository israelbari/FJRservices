import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
import type { SectionType } from '../types';
import { getSectionTypes, createSectionType, updateSectionType, deleteSectionType } from '../services/api.service';

const AVAILABLE_ICONS = [
  'Flame', 'Grid3X3', 'FileText', 'Image', 'Award', 'MapPin', 'Cloud',
  'Wrench', 'Mail', 'PanelTop', 'BarChart3', 'HeartHandshake', 'Layers',
  'Home', 'Users', 'Phone', 'Star', 'Anchor', 'Ship', 'Settings',
];

const FIELD_TYPES = [
  { value: 'text', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'number', label: 'Numero' },
  { value: 'select', label: 'Seleccion' },
  { value: 'boolean', label: 'Si/No' },
  { value: 'array-text', label: 'Lista de textos' },
  { value: 'array-object', label: 'Lista de objetos' },
];

export default function SectionTypes() {
  const [types, setTypes] = useState<SectionType[]>([]);
  const [search, setSearch] = useState('');
  const [reorderMode, setReorderMode] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<SectionType | null>(null);

  // Form state
  const [formType, setFormType] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Layers');
  const [formColor, setFormColor] = useState('#64748B');
  const [formBgColor, setFormBgColor] = useState('#F1F5F9');
  const [formActive, setFormActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);
  const [schemaFields, setSchemaFields] = useState<Array<{
    name: string;
    label: string;
    type: string;
    options: string;
    required: boolean;
    defaultValue: string;
    subFields: Array<{ name: string; label: string; type: string }>;
  }>>([]);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const data = await getSectionTypes();
      setTypes(data);
    } catch {
      toast.error('Error al cargar los tipos de seccion');
    }
  };

  const filteredTypes = types
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.label.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setFormType('');
    setFormLabel('');
    setFormDescription('');
    setFormIcon('Layers');
    setFormColor('#64748B');
    setFormBgColor('#F1F5F9');
    setFormActive(true);
    setFormOrder(0);
    setSchemaFields([]);
    setSelectedType(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEdit = (t: SectionType) => {
    setSelectedType(t);
    setFormType(t.type);
    setFormLabel(t.label);
    setFormDescription(t.description || '');
    setFormIcon(t.icon);
    setFormColor(t.color);
    setFormBgColor(t.bgColor);
    setFormActive(t.active);
    setFormOrder(t.order);
    try {
      const parsed = JSON.parse(t.configSchema || '[]');
      const fields = (Array.isArray(parsed) ? parsed : []).map((f: Record<string, unknown>) => ({
        name: String(f.name || ''),
        label: String(f.label || ''),
        type: String(f.type || 'text'),
        options: Array.isArray(f.options) ? f.options.join(',') : '',
        required: !!f.required,
        defaultValue: f.default !== undefined ? JSON.stringify(f.default) : '',
        subFields: Array.isArray(f.fields)
          ? f.fields.map((sf: Record<string, unknown>) => ({
              name: String(sf.name || ''),
              label: String(sf.label || ''),
              type: String(sf.type || 'text'),
            }))
          : [],
      }));
      setSchemaFields(fields);
    } catch {
      setSchemaFields([]);
    }
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const confirmDelete = (t: SectionType) => {
    setTypeToDelete(t);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    try {
      await deleteSectionType(typeToDelete.type);
      await loadTypes();
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
      toast.success('Tipo de seccion eliminado');
    } catch {
      toast.error('Error al eliminar el tipo de seccion');
    }
  };

  const buildConfigSchema = () => {
    return schemaFields
      .filter((f) => f.name.trim() && f.label.trim())
      .map((f) => {
        const field: Record<string, unknown> = {
          name: f.name.trim(),
          label: f.label.trim(),
          type: f.type,
          required: f.required,
        };
        if (f.options && ['select'].includes(f.type)) {
          field.options = f.options.split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (f.defaultValue) {
          try {
            field.default = JSON.parse(f.defaultValue);
          } catch {
            field.default = f.defaultValue;
          }
        }
        if (f.type === 'array-object' && f.subFields.length > 0) {
          field.fields = f.subFields
            .filter((sf) => sf.name.trim() && sf.label.trim())
            .map((sf) => ({ name: sf.name.trim(), label: sf.label.trim(), type: sf.type }));
        }
        return field;
      });
  };

  const handleSave = async () => {
    if (!formType.trim() || !formLabel.trim()) {
      toast.error('El slug y el nombre son obligatorios');
      return;
    }

    const payload = {
      type: formType.trim().toLowerCase().replace(/\s+/g, '-'),
      label: formLabel.trim(),
      description: formDescription.trim(),
      icon: formIcon,
      color: formColor,
      bgColor: formBgColor,
      configSchema: JSON.stringify(buildConfigSchema()),
      active: formActive,
      order: formOrder,
    };

    try {
      if (dialogMode === 'edit' && selectedType) {
        await updateSectionType(selectedType.type, payload);
      } else {
        await createSectionType(payload);
      }
      await loadTypes();
      setDialogOpen(false);
      resetForm();
      toast.success(dialogMode === 'create' ? 'Tipo creado' : 'Tipo actualizado');
    } catch {
      toast.error('Error al guardar el tipo de seccion');
    }
  };

  const addSchemaField = () => {
    setSchemaFields([
      ...schemaFields,
      { name: '', label: '', type: 'text', options: '', required: false, defaultValue: '', subFields: [] },
    ]);
  };

  const updateSchemaField = (idx: number, updates: Partial<typeof schemaFields[0]>) => {
    const next = [...schemaFields];
    next[idx] = { ...next[idx], ...updates };
    setSchemaFields(next);
  };

  const removeSchemaField = (idx: number) => {
    setSchemaFields(schemaFields.filter((_, i) => i !== idx));
  };

  const addSubField = (idx: number) => {
    const next = [...schemaFields];
    next[idx].subFields = [...next[idx].subFields, { name: '', label: '', type: 'text' }];
    setSchemaFields(next);
  };

  const updateSubField = (fieldIdx: number, subIdx: number, updates: Partial<{ name: string; label: string; type: string }>) => {
    const next = [...schemaFields];
    next[fieldIdx].subFields[subIdx] = { ...next[fieldIdx].subFields[subIdx], ...updates };
    setSchemaFields(next);
  };

  const removeSubField = (fieldIdx: number, subIdx: number) => {
    const next = [...schemaFields];
    next[fieldIdx].subFields = next[fieldIdx].subFields.filter((_, i) => i !== subIdx);
    setSchemaFields(next);
  };

  const moveType = async (t: SectionType, direction: 'up' | 'down') => {
    const sorted = [...types].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.id === t.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const swapWith = direction === 'up' ? sorted[idx - 1] : sorted[idx + 1];
    try {
      await Promise.all([
        updateSectionType(t.type, { order: swapWith.order }),
        updateSectionType(swapWith.type, { order: t.order }),
      ]);
      await loadTypes();
    } catch {
      toast.error('Error al reordenar');
    }
  };

  return (
    <div className="bg-[#F1F5F9] min-h-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight tracking-tight">
            Tipos de Seccion
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configura los tipos de seccion disponibles y sus campos
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg h-9 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            placeholder="Buscar tipos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#D1D5DB] rounded-lg h-10 focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
          />
        </div>
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

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC] border-b border-[#E2E8F0] h-12">
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[60px]">Orden</TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">Nombre</TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[140px]">Slug</TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[100px]">Estado</TableHead>
              <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[130px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#94A3B8]">
                  <div className="flex flex-col items-center">
                    <Layers className="w-10 h-10 text-[#CBD5E1] mb-3" />
                    <p className="text-sm">No hay tipos de seccion</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((t) => (
                <TableRow key={t.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors h-14">
                  <TableCell>
                    <span className="text-sm font-medium text-[#64748B] w-8 text-center inline-block">{t.order}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {reorderMode && <GripVertical className="w-4 h-4 text-[#CBD5E1] cursor-grab" />}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: t.bgColor }}
                      >
                        <span className="text-xs font-bold" style={{ color: t.color }}>{t.icon[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1E293B]">{t.label}</p>
                        {t.description && (
                          <p className="text-[11px] text-[#94A3B8] truncate max-w-[280px]">{t.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-mono">{t.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={t.active}
                      onCheckedChange={async () => {
                        try {
                          await updateSectionType(t.type, { active: !t.active });
                          await loadTypes();
                        } catch {
                          toast.error('Error al actualizar');
                        }
                      }}
                      className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {reorderMode ? (
                        <>
                          <button onClick={() => moveType(t, 'up')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B]">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveType(t, 'down')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B]">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openEdit(t)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B] hover:text-[#1E293B]">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete(t)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors text-[#64748B] hover:text-[#EF4444]">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl shadow-2xl max-w-[680px] p-0 gap-0 border-[#E2E8F0] max-h-[90vh]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#E2E8F0]">
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {dialogMode === 'create' ? 'Nuevo Tipo de Seccion' : 'Editar Tipo de Seccion'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Slug <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  placeholder="ej: hero"
                  disabled={dialogMode === 'edit'}
                  className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                />
                <p className="text-[11px] text-[#94A3B8] mt-1">Identificador unico (sin espacios)</p>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Nombre <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Ej: Hero Banner"
                  className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Descripcion</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe para que sirve este tipo de seccion..."
                rows={2}
                className="border-[#D1D5DB] rounded-lg focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Icono</Label>
                <Select value={formIcon} onValueChange={setFormIcon}>
                  <SelectTrigger className="border-[#D1D5DB] rounded-lg h-[42px] focus:ring-[#4A90D9] focus:ring-[3px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-[#E2E8F0]">
                    {AVAILABLE_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-12 h-[42px] p-1 border-[#D1D5DB] rounded-lg"
                  />
                  <Input
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="flex-1 border-[#D1D5DB] rounded-lg h-[42px] text-[13px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formBgColor}
                    onChange={(e) => setFormBgColor(e.target.value)}
                    className="w-12 h-[42px] p-1 border-[#D1D5DB] rounded-lg"
                  />
                  <Input
                    value={formBgColor}
                    onChange={(e) => setFormBgColor(e.target.value)}
                    className="flex-1 border-[#D1D5DB] rounded-lg h-[42px] text-[13px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Orden</Label>
                <Input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formActive}
                onCheckedChange={setFormActive}
                className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
              />
              <Label className="text-[13px] font-medium text-[#374151]">Activo</Label>
            </div>

            {/* Config Schema Editor */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1E293B]">Campos del contenido (configSchema)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSchemaField}
                  className="h-8 px-3 text-[12px] border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar campo
                </Button>
              </div>

              {schemaFields.length === 0 && (
                <p className="text-[12px] text-[#94A3B8] py-2">No hay campos definidos. El editor usara un textarea JSON generico.</p>
              )}

              <div className="space-y-3">
                {schemaFields.map((field, idx) => (
                  <div key={idx} className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#64748B] uppercase">Campo {idx + 1}</span>
                      <button onClick={() => removeSchemaField(idx)} className="text-[#EF4444] hover:bg-[#FEE2E2] w-6 h-6 rounded flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={field.name}
                        onChange={(e) => updateSchemaField(idx, { name: e.target.value })}
                        placeholder="Nombre interno (ej: ctaText)"
                        className="border-[#D1D5DB] rounded-lg h-9 text-[13px]"
                      />
                      <Input
                        value={field.label}
                        onChange={(e) => updateSchemaField(idx, { label: e.target.value })}
                        placeholder="Etiqueta visible"
                        className="border-[#D1D5DB] rounded-lg h-9 text-[13px]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        value={field.type}
                        onValueChange={(v) => updateSchemaField(idx, { type: v })}
                      >
                        <SelectTrigger className="border-[#D1D5DB] rounded-lg h-9 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {FIELD_TYPES.map((ft) => (
                            <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={field.defaultValue}
                        onChange={(e) => updateSchemaField(idx, { defaultValue: e.target.value })}
                        placeholder="Valor por defecto"
                        className="border-[#D1D5DB] rounded-lg h-9 text-[13px]"
                      />
                      <div className="flex items-center gap-2 h-9 px-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(v) => updateSchemaField(idx, { required: v })}
                          className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
                        />
                        <span className="text-[12px] text-[#374151]">Obligatorio</span>
                      </div>
                    </div>
                    {field.type === 'select' && (
                      <Input
                        value={field.options}
                        onChange={(e) => updateSchemaField(idx, { options: e.target.value })}
                        placeholder="Opciones separadas por coma"
                        className="border-[#D1D5DB] rounded-lg h-9 text-[13px]"
                      />
                    )}
                    {field.type === 'array-object' && (
                      <div className="space-y-2 pl-3 border-l-2 border-[#E2E8F0]">
                        <span className="text-[11px] font-medium text-[#64748B]">Sub-campos del objeto:</span>
                        {field.subFields.map((sf, sidx) => (
                          <div key={sidx} className="flex gap-2">
                            <Input
                              value={sf.name}
                              onChange={(e) => updateSubField(idx, sidx, { name: e.target.value })}
                              placeholder="Nombre"
                              className="border-[#D1D5DB] rounded-lg h-8 text-[12px]"
                            />
                            <Input
                              value={sf.label}
                              onChange={(e) => updateSubField(idx, sidx, { label: e.target.value })}
                              placeholder="Etiqueta"
                              className="border-[#D1D5DB] rounded-lg h-8 text-[12px]"
                            />
                            <Select
                              value={sf.type}
                              onValueChange={(v) => updateSubField(idx, sidx, { type: v })}
                            >
                              <SelectTrigger className="border-[#D1D5DB] rounded-lg h-8 text-[12px] w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                {FIELD_TYPES.filter((f) => !['array-object'].includes(f.value)).map((ft) => (
                                  <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button onClick={() => removeSubField(idx, sidx)} className="text-[#EF4444] hover:bg-[#FEE2E2] w-8 h-8 rounded flex items-center justify-center">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSubField(idx)}
                          className="h-7 px-2 text-[11px] text-[#4A90D9] hover:bg-[#EFF6FF]"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar sub-campo
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg h-9 px-4 border-[#D1D5DB]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#E8913A] hover:bg-[#D47A2A] text-white rounded-lg h-9 px-4">
              {dialogMode === 'create' ? 'Crear Tipo' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-[#E2E8F0]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">Eliminar tipo de seccion</AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B]">
              Estas seguro de eliminar <strong>{typeToDelete?.label}</strong>? Esta accion no se puede deshacer.
              {types.filter((t) => t.type === typeToDelete?.type).length > 0 && (
                <span className="block mt-1 text-[#EF4444]">Nota: Las secciones existentes de este tipo dejaran de renderizarse correctamente.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg h-9 px-4 border-[#D1D5DB]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg h-9 px-4">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
