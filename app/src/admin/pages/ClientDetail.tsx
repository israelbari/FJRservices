import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import {
  getClient, updateClient,
  createProject, updateProject, deleteProject,
  createComment, updateComment, deleteComment,
  createTimeEntry, updateTimeEntry, deleteTimeEntry,
  assignTimeEntryMedia, removeTimeEntryMedia,
  assignProjectMedia, removeProjectMedia, toggleProjectMediaVisible,
  getMedia,
  getOdooStatus, searchOdooPartners, linkClientOdoo, syncClientOdooProjects,
} from '../services/api.service';
import type { Client as ApiClient, Project, Comment, TimeEntry, ProjectMediaItem, Media } from '../types';
import {
  ChevronLeft, Pencil, Check, RefreshCw,
  Folder, Image, Plus, Trash2, Save, Clock, MessageSquare, Eye, EyeOff,
  Link2, Search, X, Loader2, LayoutList, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { getStorageUrl } from '@/lib/storage';

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}
function getAvatarGradient(name: string): string {
  const gradients = ['from-[#0A1628] to-[#1A2D4A]','from-[#4A90D9] to-[#5CA0E6]','from-[#E8913A] to-[#D47A2A]','from-[#10B981] to-[#34D399]','from-[#8B5CF6] to-[#A78BFA]','from-[#EF4444] to-[#F87171]','from-[#F59E0B] to-[#FBBF24]','from-[#06B6D4] to-[#22D3EE]'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<ApiClient | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Odoo state
  const [odooConfigured, setOdooConfigured] = useState(false);
  const [odooSearch, setOdooSearch] = useState('');
  const [odooPartners, setOdooPartners] = useState<Array<{ id: number; name: string; email?: string; phone?: string }>>([]);
  const [odooLoading, setOdooLoading] = useState(false);

  // Project forms
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');

  // Comment forms
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editingTimeEntry, setEditingTimeEntry] = useState<string | null>(null);
  const [editTimeDesc, setEditTimeDesc] = useState('');
  const [editTimeHours, setEditTimeHours] = useState('');
  const [editTimeDate, setEditTimeDate] = useState('');
  const [editTimeNotes, setEditTimeNotes] = useState('');

  // Time entry forms
  const [newTime, setNewTime] = useState<Record<string, { desc: string; hours: string; date: string; billable: boolean; notes: string }>>({});

  // Media assignment (project)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  // Media assignment (time entry)
  const [timeEntryMediaDialogOpen, setTimeEntryMediaDialogOpen] = useState(false);
  const [activeTimeEntryId, setActiveTimeEntryId] = useState<string | null>(null);
  const [selectedTimeEntryMediaIds, setSelectedTimeEntryMediaIds] = useState<string[]>([]);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string>('');
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const [cData, mData] = await Promise.all([getClient(id!), getMedia()]);
      setClient(cData);
      setProjects(cData.projects || []);
      setAllMedia(mData);
    } catch {
      toast.error('Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateClientField = async (field: string, value: unknown) => {
    if (!client) return;
    await updateClient(client.id, { [field]: value });
    const cData = await getClient(client.id);
    setClient(cData);
    setProjects(cData.projects || []);
    toast.success('Cliente actualizado');
  };

  /* --- Projects --- */
  const addProject = async () => {
    if (!client || !newProjectName.trim()) return;
    try {
      await createProject(client.id, { name: newProjectName.trim() });
      setNewProjectName('');
      await loadData();
      toast.success('Proyecto creado');
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      toast.error(err?.response?.data?.message || 'Error al crear proyecto');
    }
  };

  const saveProject = async (projectId: string) => {
    if (!editProjectName.trim()) return;
    await updateProject(projectId, { name: editProjectName.trim() });
    setEditingProject(null);
    loadData();
    toast.success('Proyecto actualizado');
  };

  const delProject = async (projectId: string) => {
    if (!window.confirm('¿Eliminar este proyecto y todo su contenido?')) return;
    await deleteProject(projectId);
    loadData();
    toast.success('Proyecto eliminado');
  };

  /* --- Comments --- */
  const addComment = async (projectId: string) => {
    const text = newComment[projectId];
    if (!text?.trim()) return;
    await createComment(projectId, { content: text.trim(), visible: false });
    setNewComment((prev) => ({ ...prev, [projectId]: '' }));
    loadData();
    toast.success('Comentario anadido');
  };

  const toggleCommentVisible = async (comment: Comment) => {
    await updateComment(comment.id, { visible: !comment.visible });
    loadData();
  };

  const saveCommentEdit = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    await updateComment(commentId, { content: editCommentText.trim() });
    setEditingComment(null);
    loadData();
    toast.success('Comentario actualizado');
  };

  const delComment = async (commentId: string) => {
    if (!window.confirm('¿Eliminar comentario?')) return;
    await deleteComment(commentId);
    loadData();
    toast.success('Comentario eliminado');
  };

  const saveTimeEntryEdit = async (entryId: string) => {
    const hours = parseFloat(editTimeHours.replace(',', '.'));
    if (!editTimeDesc.trim() || isNaN(hours) || hours <= 0) {
      toast.error('Descripcion y horas validas son requeridas');
      return;
    }
    await updateTimeEntry(entryId, {
      description: editTimeDesc.trim(),
      hours,
      date: editTimeDate || undefined,
      notes: editTimeNotes.trim() || undefined,
    });
    setEditingTimeEntry(null);
    loadData();
    toast.success('Horas actualizadas');
  };

  /* --- Time Entries --- */
  const addTimeEntry = async (projectId: string) => {
    const t = newTime[projectId];
    if (!t?.desc.trim() || !t.hours) return;
    await createTimeEntry(projectId, {
      description: t.desc.trim(),
      hours: parseFloat(t.hours),
      date: t.date || new Date().toISOString().split('T')[0],
      visible: false,
      billable: t.billable !== false,
      notes: t.notes?.trim() || undefined,
    });
    setNewTime((prev) => ({ ...prev, [projectId]: { desc: '', hours: '', date: '', billable: true, notes: '' } }));
    loadData();
    toast.success('Horas anadidas');
  };

  const toggleTimeVisible = async (entry: TimeEntry) => {
    await updateTimeEntry(entry.id, { visible: !entry.visible });
    loadData();
  };

  const toggleTimeBillable = async (entry: TimeEntry) => {
    await updateTimeEntry(entry.id, { billable: !entry.billable });
    loadData();
  };

  const delTimeEntry = async (entryId: string) => {
    if (!window.confirm('¿Eliminar registro de horas?')) return;
    await deleteTimeEntry(entryId);
    loadData();
    toast.success('Horas eliminadas');
  };

  /* --- Media --- */
  const openMediaDialog = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setActiveProjectId(projectId);
    setSelectedMediaIds(project?.medias?.map((m) => m.mediaId) || []);
    setMediaDialogOpen(true);
  };

  const toggleMediaSel = (mediaId: string) => {
    setSelectedMediaIds((prev) => prev.includes(mediaId) ? prev.filter((m) => m !== mediaId) : [...prev, mediaId]);
  };

  const saveMediaAssignment = async () => {
    if (!activeProjectId) return;
    const project = projects.find((p) => p.id === activeProjectId);
    const currentIds = project?.medias?.map((m) => m.mediaId) || [];
    const toAdd = selectedMediaIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !selectedMediaIds.includes(id));
    await Promise.all([
      ...toAdd.map((mediaId) => assignProjectMedia(activeProjectId, mediaId)),
      ...toRemove.map((mediaId) => removeProjectMedia(activeProjectId, mediaId)),
    ]);
    setMediaDialogOpen(false);
    setActiveProjectId(null);
    loadData();
    toast.success('Imagenes actualizadas');
  };

  /* --- Lightbox --- */
  const openLightbox = (src: string, title?: string) => {
    console.log('openLightbox', src, title);
    setLightboxSrc(src);
    setLightboxTitle(title || '');
    setLightboxOpen(true);
  };

  /* --- Time Entry Media --- */
  const openTimeEntryMediaDialog = (timeEntryId: string) => {
    const entry = projects.flatMap((p) => p.timeEntries || []).find((t) => t.id === timeEntryId);
    setActiveTimeEntryId(timeEntryId);
    setSelectedTimeEntryMediaIds(entry?.medias?.map((m) => m.media.id) || []);
    setTimeEntryMediaDialogOpen(true);
  };

  const toggleTimeEntryMediaSel = (mediaId: string) => {
    setSelectedTimeEntryMediaIds((prev) => prev.includes(mediaId) ? prev.filter((m) => m !== mediaId) : [...prev, mediaId]);
  };

  const saveTimeEntryMediaAssignment = async () => {
    if (!activeTimeEntryId) return;
    const entry = projects.flatMap((p) => p.timeEntries || []).find((t) => t.id === activeTimeEntryId);
    const currentIds = entry?.medias?.map((m) => m.media.id) || [];
    const toAdd = selectedTimeEntryMediaIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !selectedTimeEntryMediaIds.includes(id));
    await Promise.all([
      ...toAdd.map((mediaId) => assignTimeEntryMedia(activeTimeEntryId, mediaId)),
      ...toRemove.map((mediaId) => removeTimeEntryMedia(activeTimeEntryId, mediaId)),
    ]);
    setTimeEntryMediaDialogOpen(false);
    setActiveTimeEntryId(null);
    loadData();
    toast.success('Fotos actualizadas');
  };

  const toggleMediaVisible = async (pm: ProjectMediaItem) => {
    await toggleProjectMediaVisible(pm.id, !pm.visible);
    loadData();
  };

  /* --- Odoo --- */
  useEffect(() => {
    getOdooStatus().then((r: any) => setOdooConfigured(r.configured)).catch(() => setOdooConfigured(false));
  }, []);

  const searchOdoo = async () => {
    if (!odooSearch.trim()) return;
    setOdooLoading(true);
    try {
      const results = await searchOdooPartners(odooSearch.trim());
      setOdooPartners(results as any);
    } catch {
      toast.error('Error al buscar en Odoo');
    } finally {
      setOdooLoading(false);
    }
  };

  const linkOdoo = async (partnerId: number) => {
    if (!client) return;
    await linkClientOdoo(client.id, partnerId);
    const cData = await getClient(client.id);
    setClient(cData);
    setProjects(cData.projects || []);
    setOdooPartners([]);
    setOdooSearch('');
    toast.success('Cliente vinculado con Odoo');
  };

  const unlinkOdoo = async () => {
    if (!client) return;
    await linkClientOdoo(client.id, null);
    const cData = await getClient(client.id);
    setClient(cData);
    setProjects(cData.projects || []);
    toast.success('Vinculacion eliminada');
  };

  const syncOdoo = async () => {
    if (!client) return;
    setOdooLoading(true);
    try {
      await syncClientOdooProjects(client.id);
      const cData = await getClient(client.id);
      setClient(cData);
      setProjects(cData.projects || []);
      toast.success('Proyectos sincronizados');
    } catch {
      toast.error('Error al sincronizar');
    } finally {
      setOdooLoading(false);
    }
  };

  if (loading) return null;
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-[#1E293B] font-semibold mb-2">Cliente no encontrado</p>
        <Button onClick={() => navigate('/admin/clientes')} variant="outline" className="mt-4">
          <ChevronLeft className="w-4 h-4 mr-2" /> Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-right" richColors />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#94A3B8]">
        <Link to="/admin/clientes" className="flex items-center gap-1 hover:text-[#4A90D9] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Clientes
        </Link>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-[#1E293B] font-medium">{client.name}</span>
      </div>

      {/* Client header — minimal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(client.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {getInitials(client.name)}
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#1E293B]">{client.name}</h1>
            <p className="text-xs text-[#64748B]">{client.email}{client.phone ? ` · ${client.phone}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={client.status === 'active' ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5] border-0' : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#F1F5F9] border-0'}>
            {client.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
          <Switch checked={client.status === 'active'} onCheckedChange={(checked) => updateClientField('status', checked ? 'active' : 'inactive')} />
        </div>
      </div>

      {/* Odoo Link — solo visible cuando Odoo esta configurado */}
      {odooConfigured && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#374151]">Vinculacion Odoo</span>
            {client.odooPartnerId ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  <Link2 className="w-3 h-3 mr-1" /> ID: {client.odooPartnerId}
                </Badge>
                <Button variant="ghost" size="sm" onClick={unlinkOdoo} disabled={odooLoading} className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-[#94A3B8]">No vinculado</span>
            )}
          </div>
          {!client.odooPartnerId && (
            <div className="flex gap-2 mt-3">
              <Input placeholder="Buscar cliente en Odoo..." value={odooSearch} onChange={(e) => setOdooSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchOdoo()} className="h-9 text-sm flex-1" />
              <Button size="sm" onClick={searchOdoo} disabled={odooLoading || !odooSearch.trim()} className="h-9 bg-[#E8913A] hover:bg-[#D47A2A] text-white">
                {odooLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              </Button>
            </div>
          )}
          {odooPartners.length > 0 && (
            <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#F1F5F9] max-h-48 overflow-y-auto mt-2">
              {odooPartners.map((p: any) => (
                <button key={p.id} onClick={() => linkOdoo(p.id)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F8FAFC] text-left transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">{p.name}</p>
                    {p.email && <p className="text-xs text-[#94A3B8]">{p.email}</p>}
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">ID {p.id}</Badge>
                </button>
              ))}
            </div>
          )}
          {client.odooPartnerId && (
            <Button size="sm" variant="outline" onClick={syncOdoo} disabled={odooLoading} className="w-full mt-3 h-9 border-[#D1D5DB] text-[#374151]">
              {odooLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
              Sincronizar proyectos de Odoo
            </Button>
          )}
        </div>
      )}

      {/* New Project */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Proyectos</h2>
        <div className="flex gap-2 mb-6">
          <Input placeholder="Nombre del nuevo proyecto" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="h-10" />
          <Button onClick={addProject} className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white"><Plus className="w-4 h-4 mr-1.5" /> Crear</Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8"><Folder className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" /><p className="text-sm text-[#94A3B8]">Sin proyectos</p></div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                editingProject={editingProject}
                setEditingProject={setEditingProject}
                editProjectName={editProjectName}
                setEditProjectName={setEditProjectName}
                saveProject={saveProject}
                delProject={delProject}
                newComment={newComment}
                setNewComment={setNewComment}
                addComment={addComment}
                toggleCommentVisible={toggleCommentVisible}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                editCommentText={editCommentText}
                setEditCommentText={setEditCommentText}
                saveCommentEdit={saveCommentEdit}
                delComment={delComment}
                newTime={newTime}
                setNewTime={setNewTime}
                addTimeEntry={addTimeEntry}
                toggleTimeVisible={toggleTimeVisible}
                toggleTimeBillable={toggleTimeBillable}
                delTimeEntry={delTimeEntry}
                editingTimeEntry={editingTimeEntry}
                setEditingTimeEntry={setEditingTimeEntry}
                editTimeDesc={editTimeDesc}
                setEditTimeDesc={setEditTimeDesc}
                editTimeHours={editTimeHours}
                setEditTimeHours={setEditTimeHours}
                editTimeDate={editTimeDate}
                setEditTimeDate={setEditTimeDate}
                editTimeNotes={editTimeNotes}
                setEditTimeNotes={setEditTimeNotes}
                saveTimeEntryEdit={saveTimeEntryEdit}
                openMediaDialog={openMediaDialog}
                openTimeEntryMediaDialog={openTimeEntryMediaDialog}
                removeTimeEntryMedia={removeTimeEntryMedia}
                toggleMediaVisible={toggleMediaVisible}
                getStorageUrl={getStorageUrl}
                openLightbox={openLightbox}
              />
            ))}
          </div>
        )}
      </div>

      {/* Media Assignment Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg font-semibold text-[#1E293B]">Asignar imagenes al proyecto</DialogTitle></DialogHeader>
          <div className="mt-2">
            {allMedia.length === 0 ? (
              <div className="text-center py-6"><Image className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" /><p className="text-sm text-[#94A3B8]">No hay imagenes disponibles</p></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
                {allMedia.map((media) => {
                  const isSelected = selectedMediaIds.includes(media.id);
                  return (
                    <button key={media.id} onClick={() => toggleMediaSel(media.id)} className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${isSelected ? 'border-[#4A90D9] ring-2 ring-[#4A90D9]/20' : 'border-[#E2E8F0] hover:border-[#94A3B8]'}`}>
                      <img src={getStorageUrl(media.thumbnailSrc || media.src)} alt={media.name} className="w-full h-full object-cover" loading="lazy" />
                      {isSelected && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4A90D9] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5"><p className="text-[9px] text-white truncate">{media.name}</p></div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-[#94A3B8] mt-3 text-center">{selectedMediaIds.length} imagen{selectedMediaIds.length !== 1 ? 'es' : ''} seleccionada{selectedMediaIds.length !== 1 ? 's' : ''}</p>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setMediaDialogOpen(false); setActiveProjectId(null); }} className="h-10 border-[#D1D5DB]">Cancelar</Button>
            <Button onClick={saveMediaAssignment} className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold">Guardar asignacion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Entry Media Assignment Dialog */}
      <Dialog open={timeEntryMediaDialogOpen} onOpenChange={setTimeEntryMediaDialogOpen}>
        <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg font-semibold text-[#1E293B]">Adjuntar fotos a la entrada de horas</DialogTitle></DialogHeader>
          <div className="mt-2">
            {allMedia.length === 0 ? (
              <div className="text-center py-6"><Image className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" /><p className="text-sm text-[#94A3B8]">No hay imagenes disponibles</p></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
                {allMedia.map((media) => {
                  const isSelected = selectedTimeEntryMediaIds.includes(media.id);
                  return (
                    <button key={media.id} onClick={() => toggleTimeEntryMediaSel(media.id)} className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${isSelected ? 'border-[#4A90D9] ring-2 ring-[#4A90D9]/20' : 'border-[#E2E8F0] hover:border-[#94A3B8]'}`}>
                      <img src={getStorageUrl(media.src)} alt={media.name} className="w-full h-full object-cover" loading="lazy" />
                      {isSelected && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4A90D9] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5"><p className="text-[9px] text-white truncate">{media.name}</p></div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-[#94A3B8] mt-3 text-center">{selectedTimeEntryMediaIds.length} imagen{selectedTimeEntryMediaIds.length !== 1 ? 'es' : ''} seleccionada{selectedTimeEntryMediaIds.length !== 1 ? 's' : ''}</p>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setTimeEntryMediaDialogOpen(false); setActiveTimeEntryId(null); }} className="h-10 border-[#D1D5DB]">Cancelar</Button>
            <Button onClick={saveTimeEntryMediaAssignment} className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold">Guardar fotos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightboxOpen(false)}
        >
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '90vw', maxHeight: '90vh', padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: -48, right: 0, width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer' }}>
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxSrc} alt={lightboxTitle} style={{ maxWidth: '85vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            {lightboxTitle && <p style={{ marginTop: 16, color: 'white', fontSize: 14, fontWeight: 500, backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: 9999 }}>{lightboxTitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  ProjectCard sub-component                                          */
/* ================================================================== */

function ProjectCard({
  project, editingProject, setEditingProject, editProjectName, setEditProjectName, saveProject, delProject,
  newComment, setNewComment, addComment, toggleCommentVisible, editingComment, setEditingComment, editCommentText, setEditCommentText, saveCommentEdit, delComment,
  newTime, setNewTime, addTimeEntry, toggleTimeVisible, toggleTimeBillable, delTimeEntry,
  editingTimeEntry, setEditingTimeEntry, editTimeDesc, setEditTimeDesc, editTimeHours, setEditTimeHours, editTimeDate, setEditTimeDate, editTimeNotes, setEditTimeNotes, saveTimeEntryEdit,
  openMediaDialog, openTimeEntryMediaDialog, removeTimeEntryMedia, toggleMediaVisible, getStorageUrl, openLightbox,
}: any) {
  const [tab, setTab] = useState<'todo' | 'images' | 'comments' | 'hours'>('todo');

  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Folder className="w-5 h-5 text-[#4A90D9] flex-shrink-0" />
          {editingProject === project.id ? (
            <div className="flex gap-2 flex-1">
              <Input value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} className="h-8 text-sm flex-1" />
              <Button size="sm" onClick={() => saveProject(project.id)} className="h-8 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[11px]"><Save className="w-3 h-3 mr-1" /> Guardar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingProject(null)} className="h-8 text-[11px] text-[#64748B]">Cancelar</Button>
            </div>
          ) : (
            <div>
              <h3 className="text-[15px] font-semibold text-[#1E293B]">{project.name}</h3>
              <Badge className="bg-[#EFF6FF] text-[#4A90D9] hover:bg-[#EFF6FF] border-0 text-[11px] mt-1">
                {(project.medias?.length || 0)} img · {(project.comments?.length || 0)} com · {(project.timeEntries?.length || 0)} h
              </Badge>
            </div>
          )}
        </div>
        {!editingProject && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => { setEditingProject(project.id); setEditProjectName(project.name); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Editar"><Pencil className="w-3.5 h-3.5 text-[#64748B]" /></button>
            <button onClick={() => delProject(project.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5 text-[#EF4444]" /></button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-[#E2E8F0]">
        {(['todo', 'images', 'comments', 'hours'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium rounded-md transition-colors ${tab === t ? 'bg-[#EFF6FF] text-[#4A90D9]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
            {t === 'todo' && <LayoutList className="w-3.5 h-3.5" />}
            {t === 'images' && <Image className="w-3.5 h-3.5" />}
            {t === 'comments' && <MessageSquare className="w-3.5 h-3.5" />}
            {t === 'hours' && <Clock className="w-3.5 h-3.5" />}
            {t === 'todo' ? 'Todo' : t === 'images' ? 'Imagenes' : t === 'comments' ? 'Comentarios' : 'Horas'}
          </button>
        ))}
      </div>

      {/* Todo Tab — images grid on top + comments/hours timeline below */}
      {tab === 'todo' && (
        <div className="space-y-4">
          {/* Quick add buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openMediaDialog(project.id)} className="h-8 text-[12px] border-[#D1D5DB] border-dashed"><Image className="w-3.5 h-3.5 mr-1.5" /> Asignar imagen</Button>
            <Button variant="outline" size="sm" onClick={() => setTab('comments')} className="h-8 text-[12px] border-[#D1D5DB] border-dashed"><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Comentario</Button>
            <Button variant="outline" size="sm" onClick={() => setTab('hours')} className="h-8 text-[12px] border-[#D1D5DB] border-dashed"><Clock className="w-3.5 h-3.5 mr-1.5" /> Horas</Button>
          </div>

          {/* Images Grid */}
          {project.medias && project.medias.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Imagenes</span>
                <span className="text-[10px] text-[#94A3B8]">{project.medias.length}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                {project.medias.map((pm: ProjectMediaItem) => (
                  <div key={pm.id} className={`relative group aspect-square rounded-lg border overflow-hidden ${pm.visible ? 'border-[#E2E8F0]' : 'border-red-300'}`}>
                    <button onClick={() => openLightbox(getStorageUrl(pm.media.src), pm.media.name)} className="w-full h-full p-0 border-0 bg-transparent cursor-zoom-in" type="button">
                      <img src={getStorageUrl(pm.media.thumbnailSrc || pm.media.src)} alt={pm.media.name} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <button onClick={(e) => { e.stopPropagation(); toggleMediaVisible(pm); }} className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto ${pm.visible ? 'bg-emerald-500' : 'bg-red-500'}`} title={pm.visible ? 'Visible' : 'Oculto'}>
                        {pm.visible ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    {/* Visibility corner */}
                    {!pm.visible && (
                      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-red-500 rounded text-[8px] text-white font-bold pointer-events-none">OC</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline — comments + hours merged */}
          {(() => {
            const items = [
              ...(project.comments || []).map((c: Comment) => ({ type: 'comment' as const, data: c, date: c.createdAt, visible: c.visible })),
              ...(project.timeEntries || []).map((t: TimeEntry) => ({ type: 'timeEntry' as const, data: t, date: t.createdAt, visible: t.visible })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (items.length === 0 && (!project.medias || project.medias.length === 0)) {
              return <p className="text-[12px] text-[#94A3B8] py-4 text-center">Sin contenido. Anade imagenes, comentarios o horas.</p>;
            }

            if (items.length === 0) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Actividad</span>
                  <span className="text-[10px] text-[#94A3B8]">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={`${item.type}-${item.data.id}-${idx}`} className={`bg-white border rounded-lg p-3 ${item.visible ? 'border-[#E2E8F0]' : 'border-red-200 bg-red-50/30'}`}>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.type === 'comment' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {item.type === 'comment' && <MessageSquare className="w-3 h-3" />}
                            {item.type === 'timeEntry' && <Clock className="w-3 h-3" />}
                            {item.type === 'comment' ? 'Comentario' : 'Horas'}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.date)}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (item.type === 'comment') toggleCommentVisible(item.data);
                            else if (item.type === 'timeEntry') toggleTimeVisible(item.data);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            item.visible
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-500 hover:bg-red-100'
                          }`}
                          title={item.visible ? 'Visible para el cliente' : 'Oculto para el cliente'}
                        >
                          {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.visible ? 'Visible' : 'Oculto'}
                        </button>
                      </div>

                      {/* Content */}
                      {item.type === 'comment' && (
                        <div>
                          <p className="text-[13px] text-[#374151]">{item.data.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <button onClick={() => { setEditingComment(item.data.id); setEditCommentText(item.data.content); }} className="text-[10px] text-[#4A90D9] hover:underline">Editar</button>
                            <span className="text-[#CBD5E1]">·</span>
                            <button onClick={() => delComment(item.data.id)} className="text-[10px] text-red-500 hover:underline">Eliminar</button>
                          </div>
                        </div>
                      )}
                      {item.type === 'timeEntry' && (
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] text-[#374151] font-medium">{item.data.description}</p>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.data.billable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                              {item.data.billable ? 'Facturable' : 'No fact.'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">{item.data.hours}h · {formatDate(item.data.date)}</p>
                          {item.data.notes && (
                            <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 rounded px-2 py-1"><span className="font-medium">Nota:</span> {item.data.notes}</p>
                          )}
                          {item.data.medias && item.data.medias.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {item.data.medias.map((tm: any) => (
                                <button key={tm.id} onClick={() => openLightbox(getStorageUrl(tm.media.src), tm.media.name)} className="cursor-zoom-in">
                                  <img src={getStorageUrl(tm.media.thumbnailSrc || tm.media.src)} alt={tm.media.name} className="w-12 h-12 rounded object-cover border border-[#E2E8F0] hover:ring-2 hover:ring-[#4A90D9] transition-all" loading="lazy" />
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <button onClick={() => openTimeEntryMediaDialog(item.data.id)} className="text-[10px] text-[#4A90D9] hover:underline">Adjuntar foto</button>
                            <span className="text-[#CBD5E1]">·</span>
                            <button onClick={() => delTimeEntry(item.data.id)} className="text-[10px] text-red-500 hover:underline">Eliminar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Images Tab */}
      {tab === 'images' && (
        <div>
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => openMediaDialog(project.id)} className="h-8 text-[12px] border-[#D1D5DB] border-dashed"><Image className="w-3.5 h-3.5 mr-1.5" /> Asignar imagenes</Button>
          </div>
          {project.medias?.length === 0 ? (
            <p className="text-[12px] text-[#94A3B8] py-4 text-center">No hay imagenes asignadas</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
              {project.medias.map((pm: ProjectMediaItem) => (
                <div key={pm.id} className="relative group aspect-square rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                  <button onClick={() => openLightbox(getStorageUrl(pm.media.src), pm.media.name)} className="w-full h-full p-0 border-0 bg-transparent cursor-zoom-in" type="button">
                    <img src={getStorageUrl(pm.media.thumbnailSrc || pm.media.src)} alt={pm.media.name} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2 pointer-events-none">
                    <span className="text-white text-[10px] font-medium px-2 truncate pointer-events-none">{pm.media.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleMediaVisible(pm); }} className={`w-7 h-7 rounded-full flex items-center justify-center pointer-events-auto ${pm.visible ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} title={pm.visible ? 'Visible' : 'Oculto'}>
                      {pm.visible ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-white" />}
                    </button>
                  </div>
                  {pm.visible && <div className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center pointer-events-none"><Eye className="w-2.5 h-2.5 text-white" /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {tab === 'comments' && (
        <div>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Nuevo comentario..." value={newComment[project.id] || ''} onChange={(e) => setNewComment((prev: any) => ({ ...prev, [project.id]: e.target.value }))} className="h-9 text-sm" />
            <Button size="sm" onClick={() => addComment(project.id)} className="h-9 bg-[#4A90D9] hover:bg-[#357ABD] text-white"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
          {project.comments?.length === 0 ? (
            <p className="text-[12px] text-[#94A3B8] py-4 text-center">Sin comentarios</p>
          ) : (
            <div className="space-y-2">
              {project.comments.map((c: Comment) => (
                <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-lg p-3">
                  {editingComment === c.id ? (
                    <div className="flex gap-2">
                      <Input value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="h-8 text-sm flex-1" />
                      <Button size="sm" onClick={() => saveCommentEdit(c.id)} className="h-8 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[11px]"><Save className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)} className="h-8 text-[11px]">Cancelar</Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] text-[#374151] flex-1">{c.content}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleCommentVisible(c)} className={`w-6 h-6 rounded-full flex items-center justify-center ${c.visible ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`} title={c.visible ? 'Visible' : 'Oculto'}>
                          {c.visible ? <Eye className="w-3 h-3 text-[#10B981]" /> : <EyeOff className="w-3 h-3 text-[#EF4444]" />}
                        </button>
                        <button onClick={() => { setEditingComment(c.id); setEditCommentText(c.content); }} className="w-6 h-6 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center"><Pencil className="w-3 h-3 text-[#64748B]" /></button>
                        <button onClick={() => delComment(c.id)} className="w-6 h-6 rounded-full hover:bg-[#FEF2F2] flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#EF4444]" /></button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-[#94A3B8] mt-1">{formatDate(c.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hours Tab */}
      {tab === 'hours' && (
        <div>
          <div className="flex gap-2 mb-2">
            <Input placeholder="Descripcion" value={newTime[project.id]?.desc || ''} onChange={(e) => setNewTime((prev: any) => ({ ...prev, [project.id]: { ...(prev[project.id] || {}), desc: e.target.value } }))} className="h-9 text-sm flex-1" />
            <Input placeholder="Horas" type="number" step="0.5" value={newTime[project.id]?.hours || ''} onChange={(e) => setNewTime((prev: any) => ({ ...prev, [project.id]: { ...(prev[project.id] || {}), hours: e.target.value } }))} className="h-9 text-sm w-20" />
            <Input type="date" value={newTime[project.id]?.date || ''} onChange={(e) => setNewTime((prev: any) => ({ ...prev, [project.id]: { ...(prev[project.id] || {}), date: e.target.value } }))} className="h-9 text-sm w-32" />
            <button
              onClick={() => setNewTime((prev: any) => ({ ...prev, [project.id]: { ...(prev[project.id] || {}), billable: !(prev[project.id]?.billable !== false) } }))}
              className={`h-9 px-2 rounded-md text-xs font-medium border transition-colors flex items-center gap-1 ${newTime[project.id]?.billable !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
              title="Marcar como facturable"
            >
              {newTime[project.id]?.billable !== false ? 'Facturable' : 'No fact.'}
            </button>
            <Button size="sm" onClick={() => addTimeEntry(project.id)} className="h-9 bg-[#4A90D9] hover:bg-[#357ABD] text-white"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="mb-3">
            <textarea
              placeholder="Notas internas (solo visible para admin)..."
              value={newTime[project.id]?.notes || ''}
              onChange={(e) => setNewTime((prev: any) => ({ ...prev, [project.id]: { ...(prev[project.id] || {}), notes: e.target.value } }))}
              className="w-full h-16 px-3 py-2 text-xs border border-[#E2E8F0] rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-[#4A90D9] text-[#374151] placeholder:text-[#94A3B8]"
            />
          </div>
          {project.timeEntries?.length === 0 ? (
            <p className="text-[12px] text-[#94A3B8] py-4 text-center">Sin registros de horas</p>
          ) : (
            <>
              <div className="space-y-2">
                {project.timeEntries.map((t: TimeEntry) => (
                  <div key={t.id} className="bg-white border border-[#E2E8F0] rounded-lg p-3">
                    {editingTimeEntry === t.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input value={editTimeDesc} onChange={(e) => setEditTimeDesc(e.target.value)} placeholder="Descripcion" className="h-8 text-sm flex-1" />
                          <Input value={editTimeHours} onChange={(e) => setEditTimeHours(e.target.value)} placeholder="Horas" className="h-8 text-sm w-20" />
                          <Input type="date" value={editTimeDate} onChange={(e) => setEditTimeDate(e.target.value)} className="h-8 text-sm w-36" />
                        </div>
                        <textarea
                          value={editTimeNotes}
                          onChange={(e) => setEditTimeNotes(e.target.value)}
                          placeholder="Notas internas..."
                          className="w-full h-12 px-2 py-1.5 text-xs border border-[#E2E8F0] rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveTimeEntryEdit(t.id)} className="h-8 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[11px]"><Save className="w-3 h-3 mr-1" /> Guardar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTimeEntry(null)} className="h-8 text-[11px] text-[#64748B]">Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] text-[#374151]">{t.description}</p>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${t.billable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                {t.billable ? 'Facturable' : 'No fact.'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8]">{t.hours}h · {formatDate(t.date)}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => { setEditingTimeEntry(t.id); setEditTimeDesc(t.description); setEditTimeHours(String(t.hours)); setEditTimeDate(t.date && !isNaN(new Date(t.date).getTime()) ? new Date(t.date).toISOString().split('T')[0] : ''); setEditTimeNotes(t.notes || ''); }} className="w-6 h-6 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center" title="Editar">
                              <Pencil className="w-3 h-3 text-[#64748B]" />
                            </button>
                            <button onClick={() => openTimeEntryMediaDialog(t.id)} className="w-6 h-6 rounded-full hover:bg-[#EFF6FF] flex items-center justify-center" title="Adjuntar foto">
                              <Image className="w-3 h-3 text-[#4A90D9]" />
                            </button>
                            <button onClick={() => toggleTimeBillable(t)} className={`w-6 h-6 rounded-full flex items-center justify-center ${t.billable ? 'bg-emerald-50' : 'bg-gray-100'}`} title={t.billable ? 'Facturable' : 'No facturable'}>
                              <span className={`text-[10px] font-bold ${t.billable ? 'text-emerald-600' : 'text-gray-400'}`}>$</span>
                            </button>
                            <button onClick={() => toggleTimeVisible(t)} className={`w-6 h-6 rounded-full flex items-center justify-center ${t.visible ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`} title={t.visible ? 'Visible' : 'Oculto'}>
                              {t.visible ? <Eye className="w-3 h-3 text-[#10B981]" /> : <EyeOff className="w-3 h-3 text-[#EF4444]" />}
                            </button>
                            <button onClick={() => delTimeEntry(t.id)} className="w-6 h-6 rounded-full hover:bg-[#FEF2F2] flex items-center justify-center"><Trash2 className="w-3 h-3 text-[#EF4444]" /></button>
                          </div>
                        </div>
                        {/* Notes */}
                        {t.notes && (
                          <div className="mt-2 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                            <p className="text-[11px] text-amber-700"><span className="font-medium">Nota interna:</span> {t.notes}</p>
                          </div>
                        )}
                        {/* Photos */}
                        {t.medias && t.medias.length > 0 && (
                          <div className="mt-2 flex gap-1.5 flex-wrap">
                            {t.medias.map((tm) => (
                              <div key={tm.id} className="relative group">
                                <img src={getStorageUrl(tm.media.thumbnailSrc || tm.media.src)} alt={tm.media.name} className="w-14 h-14 rounded-md object-cover border border-[#E2E8F0]" loading="lazy" />
                                <button onClick={() => removeTimeEntryMedia(t.id, tm.media.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Totales */}
              <div className="mt-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#64748B]">Total facturable</span>
                  <span className="font-semibold text-emerald-600">{project.timeEntries.filter((e: TimeEntry) => e.billable).reduce((s: number, e: TimeEntry) => s + e.hours, 0).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#64748B]">Total no facturable</span>
                  <span className="font-semibold text-gray-500">{project.timeEntries.filter((e: TimeEntry) => !e.billable).reduce((s: number, e: TimeEntry) => s + e.hours, 0).toFixed(1)}h</span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-1 flex justify-between text-[13px]">
                  <span className="text-[#1E293B] font-medium">Total horas</span>
                  <span className="font-bold text-[#4A90D9]">{project.timeEntries.reduce((s: number, e: TimeEntry) => s + e.hours, 0).toFixed(1)}h</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
