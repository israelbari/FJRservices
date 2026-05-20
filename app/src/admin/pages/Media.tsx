import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Search,
  Grid2x2,
  List,
  Plus,
  Upload,
  Video as VideoIcon,
  Eye,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  Image,
  Wrench,
  Grid3x3,
  Award,
  UserCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileArchive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/storage';
import { getMedia, uploadMedia, uploadZipMedia, updateMedia, deleteMedia, getVideos, createVideo, updateVideo, deleteVideo as deleteVideoApi, getClients } from '../services/api.service';
import type { Media, Video, Client } from '../types';

const FOLDERS = [
  { key: 'Todas', icon: Layers },
  { key: 'Hero', icon: Image },
  { key: 'Servicios', icon: Wrench },
  { key: 'Galeria', icon: Grid3x3 },
  { key: 'Marcas', icon: Award },
  { key: 'Clientes', icon: UserCircle },
];

const SECTIONS_LIST = [
  { id: 's1', name: 'Hero Principal' },
  { id: 's2', name: 'Servicios Destacados' },
  { id: 's3', name: 'Galeria de Proyectos' },
  { id: 's4', name: 'Estadisticas' },
  { id: 's5', name: 'Testimonios' },
  { id: 's6', name: 'Equipo' },
  { id: 's7', name: 'Llamada a la Accion' },
  { id: 's8', name: 'Marcas' },
  { id: 's9', name: 'Hero Servicios' },
  { id: 's10', name: 'Lista de Servicios' },
  { id: 's11', name: 'Proceso de Trabajo' },
  { id: 's12', name: 'Precios' },
  { id: 's13', name: 'Preguntas Frecuentes' },
  { id: 's14', name: 'Hero Nosotros' },
  { id: 's15', name: 'Historia' },
  { id: 's16', name: 'Valores' },
  { id: 's17', name: 'Certificaciones' },
  { id: 's18', name: 'Hero Contacto' },
  { id: 's19', name: 'Formulario de Contacto' },
  { id: 's20', name: 'Informacion de Contacto' },
  { id: 's21', name: 'Mapa' },
];

type ViewMode = 'grid' | 'list';
type TabMode = 'imagenes' | 'videos';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('imagenes');
  const [selectedFolder, setSelectedFolder] = useState('Todas');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [images, setImages] = useState<Media[]>([]);
  const [videos, setVideos] = useState<Array<Video>>([]);
  const [previewImage, setPreviewImage] = useState<Media | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [editImage, setEditImage] = useState<Media | null>(null);
  const [deleteImage, setDeleteImage] = useState<Media | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [playVideo, setPlayVideo] = useState<Video | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadZipOpen, setUploadZipOpen] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFolder, setZipFolder] = useState('Galeria');
  const [zipClientId, setZipClientId] = useState('none');
  const [zipUploading, setZipUploading] = useState(false);
  const [addVideoOpen, setAddVideoOpen] = useState(false);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchActionOpen, setBatchActionOpen] = useState<'move' | 'delete' | null>(null);
  const [batchFolder, setBatchFolder] = useState('Galeria');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFolder, setUploadFolder] = useState('Galeria');
  const [uploadName, setUploadName] = useState('');
  const [uploadClientId, setUploadClientId] = useState('none');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Video form state
  const [videoForm, setVideoForm] = useState({ title: '', url: '', sectionId: '', playbackRate: '1' });
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', folder: '', sectionId: '', clientId: '' });

  useEffect(() => {
    Promise.all([getMedia(), getVideos(), getClients()])
      .then(([m, v, c]) => {
        if (m) setImages(m);
        if (v) setVideos(v);
        if (c) setClients(c);
      })
      .catch(() => toast.error('Error al cargar datos'));
  }, []);

  const getClientName = useCallback(
    (clientId: string | undefined) => {
      if (!clientId) return null;
      const client = clients.find((c) => c.id === clientId);
      return client ? client.name : null;
    },
    [clients]
  );

  const filteredImages = useMemo(() => {
    let filtered = images;
    if (selectedFolder !== 'Todas') {
      filtered = filtered.filter((img) => img.folder === selectedFolder);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((img) => img.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [images, selectedFolder, search]);

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, search]);

  const getFolderCount = useCallback(
    (folder: string) => {
      if (folder === 'Todas') return images.length;
      return images.filter((img) => img.folder === folder).length;
    },
    [images]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingFiles(Array.from(files));
  };

  // Batch selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map((img) => img.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchMove = async () => {
    console.log('handleBatchMove called', { selectedIds: Array.from(selectedIds), batchFolder });
    if (selectedIds.size === 0) return;
    try {
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => updateMedia(id, { folder: batchFolder }))
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      console.log('Batch move results:', { succeeded, failed, results });
      const all = await api.get('/media', { params: { _t: Date.now() } }).then(r => r.data);
      setImages(all);
      if (failed > 0) {
        toast.error(`${failed} de ${selectedIds.size} imagenes no se pudieron mover`);
      } else {
        toast.success(`${succeeded} imagen(es) movida(s) a ${batchFolder}`);
      }
      setBatchActionOpen(null);
      clearSelection();
    } catch (err: unknown) {
      console.error('Batch move error:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al mover: ${msg}`);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteMedia(id)));
      const all = await api.get('/media', { params: { _t: Date.now() } }).then(r => r.data);
      setImages(all);
      toast.success(`${selectedIds.size} imagen(es) eliminada(s)`);
      setBatchActionOpen(null);
      clearSelection();
    } catch {
      toast.error('Error al eliminar imagenes');
    }
  };

  const processUpload = async () => {
    if (pendingFiles.length === 0) return;
    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', uploadFolder);
        if (uploadClientId !== 'none') formData.append('clientId', uploadClientId);
        await uploadMedia(formData);
      }
      const all = await api.get('/media', { params: { _t: Date.now() } }).then(r => r.data);
      setImages(all);
      toast.success(`${pendingFiles.length} imagen(es) subida(s) correctamente`);
      setUploadOpen(false);
      setPendingFiles([]);
      setUploadName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Error al subir imagenes');
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImage) return;
    try {
      await deleteMedia(deleteImage.id);
      const all = await getMedia();
      setImages(all);
      toast.success('Imagen eliminada');
      setDeleteImage(null);
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteVideo) return;
    try {
      await deleteVideoApi(deleteVideo.id);
      const all = await getVideos();
      setVideos(all);
      toast.success('Video eliminado');
      setDeleteVideo(null);
    } catch {
      toast.error('Error al eliminar video');
    }
  };

  const handleSaveEdit = async () => {
    console.log('=== handleSaveEdit called', { editImage, editForm });
    if (!editImage) {
      toast.error('No hay imagen seleccionada');
      return;
    }
    try {
      const payload = {
        name: editForm.name.trim(),
        folder: editForm.folder,
        clientId: editForm.clientId || null,
      };
      console.log('Sending payload:', payload);
      const result = await updateMedia(editImage.id, payload);
      console.log('Update result:', result);
      const all = await getMedia();
      setImages(all);
      toast.success('Imagen actualizada correctamente');
      setEditImage(null);
      console.log('Edit dialog should be closed now');
    } catch (err: unknown) {
      console.error('Save edit error:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al actualizar: ${msg}`);
    }
  };

  const processZipUpload = async () => {
    if (!zipFile) {
      toast.error('Selecciona un archivo ZIP');
      return;
    }
    setZipUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', zipFile);
      formData.append('folder', zipFolder);
      if (zipClientId !== 'none') formData.append('clientId', zipClientId);
      const result = await uploadZipMedia(formData);
      const [allImages, allVideos] = await Promise.all([getMedia(), getVideos()]);
      setImages(allImages);
      setVideos(allVideos);
      const parts: string[] = [];
      if (result.images > 0) parts.push(`${result.images} imagen(es)`);
      if (result.videos > 0) parts.push(`${result.videos} video(s)`);
      if (result.skipped > 0) parts.push(`${result.skipped} omitidos`);
      if (result.errors > 0) parts.push(`${result.errors} errores`);
      toast.success(`ZIP procesado: ${parts.join(', ')}`);
      setUploadZipOpen(false);
      setZipFile(null);
    } catch (err: unknown) {
      console.error('ZIP upload error:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al procesar ZIP: ${msg}`);
    } finally {
      setZipUploading(false);
    }
  };

  const openEdit = (img: Media) => {
    setEditImage(img);
    setEditForm({ name: img.name, folder: img.folder, sectionId: img.sectionId || '', clientId: img.clientId || '' });
  };

  const openPreview = (img: Media, index: number) => {
    setPreviewImage(img);
    setPreviewIndex(index);
  };

  const navigatePreview = (dir: number) => {
    const newIdx = previewIndex + dir;
    if (newIdx >= 0 && newIdx < filteredImages.length) {
      setPreviewIndex(newIdx);
      setPreviewImage(filteredImages[newIdx]);
    }
  };

  const handleAddVideo = async () => {
    if (!videoForm.title.trim()) {
      toast.error('Titulo es requerido');
      return;
    }
    if (videoMode === 'url' && !videoForm.url.trim()) {
      toast.error('URL es requerida');
      return;
    }
    if (videoMode === 'upload' && !videoFile) {
      toast.error('Debes seleccionar un archivo de video');
      return;
    }

    try {
      if (videoMode === 'upload' && videoFile) {
        const formData = new FormData();
        formData.append('title', videoForm.title.trim());
        formData.append('file', videoFile);
        if (videoForm.sectionId) formData.append('sectionId', videoForm.sectionId);
        formData.append('playbackRate', videoForm.playbackRate);
        await createVideo(formData);
      } else {
        let url = videoForm.url.trim();
        if (url.includes('watch?v=')) {
          url = url.replace('watch?v=', 'embed/');
        }
        await createVideo({ title: videoForm.title.trim(), url, sectionId: videoForm.sectionId || null });
      }
      const all = await getVideos();
      setVideos(all);
      toast.success('Video anadido correctamente');
      setAddVideoOpen(false);
      setVideoForm({ title: '', url: '', sectionId: '', playbackRate: '1' });
      setVideoFile(null);
      setVideoMode('url');
    } catch {
      toast.error('Error al anadir video');
    }
  };

  const handleUpdateVideo = async () => {
    if (!editVideo) return;
    if (!videoForm.title.trim()) {
      toast.error('Titulo es requerido');
      return;
    }
    try {
      if (videoMode === 'upload' && videoFile) {
        // Nuevo archivo subido
        const formData = new FormData();
        formData.append('title', videoForm.title.trim());
        formData.append('file', videoFile);
        if (videoForm.sectionId) formData.append('sectionId', videoForm.sectionId);
        formData.append('playbackRate', videoForm.playbackRate);
        await updateVideo(editVideo.id, formData);
      } else if (videoMode === 'url') {
        let url = videoForm.url.trim();
        if (url.includes('watch?v=')) {
          url = url.replace('watch?v=', 'embed/');
        }
        await updateVideo(editVideo.id, {
          title: videoForm.title.trim(),
          url,
          sectionId: videoForm.sectionId || null,
          playbackRate: parseFloat(videoForm.playbackRate),
        });
      } else {
        // Modo upload sin nuevo archivo: solo actualizar metadata
        await updateVideo(editVideo.id, {
          title: videoForm.title.trim(),
          sectionId: videoForm.sectionId || null,
          playbackRate: parseFloat(videoForm.playbackRate),
        });
      }
      const all = await getVideos();
      setVideos(all);
      toast.success('Video actualizado correctamente');
      setEditVideo(null);
      setAddVideoOpen(false);
      setVideoForm({ title: '', url: '', sectionId: '', playbackRate: '1' });
      setVideoFile(null);
      setVideoMode('url');
    } catch {
      toast.error('Error al actualizar video');
    }
  };

  const openEditVideo = (v: Video) => {
    setEditVideo(v);
    setVideoMode(v.src ? 'upload' : 'url');
    setVideoForm({ title: v.title, url: v.url, sectionId: v.sectionId || '', playbackRate: String(v.playbackRate ?? 1) });
  };

  const getMediaUrl = (src: string) => getStorageUrl(src);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Keyboard navigation for preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!previewImage) return;
      if (e.key === 'Escape') setPreviewImage(null);
      if (e.key === 'ArrowLeft') navigatePreview(-1);
      if (e.key === 'ArrowRight') navigatePreview(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewImage, previewIndex, filteredImages]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight tracking-[-0.01em]">
            {activeTab === 'imagenes' ? 'Galeria de Media' : 'Galeria de Media'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {activeTab === 'imagenes' ? 'Imagenes y videos del sitio web' : 'Imagenes y videos del sitio web'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold text-[13px] uppercase tracking-[0.04em] h-10 px-4 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Subir Imagen
          </Button>
          <Button
            onClick={() => setUploadZipOpen(true)}
            variant="outline"
            className="border-[#10B981] text-[#10B981] hover:bg-[#F0FDF4] font-semibold text-[13px] uppercase tracking-[0.04em] h-10 px-4 rounded-lg"
          >
            <FileArchive className="w-4 h-4 mr-2" />
            Subir ZIP
          </Button>
          <Button
            onClick={() => setAddVideoOpen(true)}
            variant="outline"
            className="border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF] font-semibold text-[13px] uppercase tracking-[0.04em] h-10 px-4 rounded-lg"
          >
            <VideoIcon className="w-4 h-4 mr-2" />
            Anadir Video
          </Button>
        </div>
      </div>

      {/* Toolbar Row */}
      <div className="bg-white border border-[#E2E8F0] rounded-[10px] px-5 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('imagenes')}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'imagenes'
                ? 'bg-[#001529] text-white'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <Image className="w-4 h-4" />
            Imagenes
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'bg-[#001529] text-white'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            Videos
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar archivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[240px] h-9 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
            />
          </div>

          {/* Select All */}
          {activeTab === 'imagenes' && filteredImages.length > 0 && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F8FAFC] transition-colors">
              <Checkbox
                checked={selectedIds.size === filteredImages.length && filteredImages.length > 0}
                onCheckedChange={selectAll}
              />
              <span className="text-[13px] text-[#374151]">
                {selectedIds.size === filteredImages.length ? 'Deseleccionar' : 'Seleccionar todos'}
              </span>
            </label>
          )}

          {/* View Toggle */}
          {activeTab === 'imagenes' && (
            <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden">
              <button
                onClick={() => { setViewMode('grid'); clearSelection(); }}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#001529] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Grid2x2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewMode('list'); clearSelection(); }}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-[#001529] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Folder Filter Row (for images) */}
      {activeTab === 'imagenes' && (
        <div className="flex flex-wrap gap-2">
          {FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const count = getFolderCount(folder.key);
            return (
              <button
                key={folder.key}
                onClick={() => { setSelectedFolder(folder.key); clearSelection(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  selectedFolder === folder.key
                    ? 'bg-[#001529] text-white'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {folder.key}
                <span
                  className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                    selectedFolder === folder.key ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Batch actions bar */}
      {activeTab === 'imagenes' && selectedIds.size > 0 && (
        <div className="bg-[#001529] text-white rounded-[10px] px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold">
              {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={clearSelection}
              className="text-[12px] text-white/70 hover:text-white underline"
            >
              Deseleccionar
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { setBatchFolder('Galeria'); setBatchActionOpen('move'); }}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-9 px-3 rounded-lg text-[13px] font-semibold"
            >
              Mover carpeta
            </Button>
            <Button
              onClick={() => setBatchActionOpen('delete')}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-9 px-3 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* IMAGES CONTENT */}
      {activeTab === 'imagenes' && (
        <>
          {filteredImages.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-[#CBD5E1] mb-4" />
              <p className="text-base text-[#94A3B8]">No hay imagenes en esta carpeta</p>
              <Button
                onClick={() => setUploadOpen(true)}
                variant="outline"
                className="mt-4 border-[#D1D5DB] text-[#374151]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir imagen
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`group bg-white border rounded-[10px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedIds.has(img.id) ? 'border-[#E8913A] ring-1 ring-[#E8913A]' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedIds.has(img.id)}
                        onCheckedChange={() => toggleSelect(img.id)}
                        className="bg-white border-white data-[state=checked]:bg-[#E8913A] data-[state=checked]:border-[#E8913A]"
                      />
                    </div>
                    <img
                      src={getMediaUrl(img.src)}
                      alt={img.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-yacht.jpg';
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[rgba(10,22,40,0.6)] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openPreview(img, idx)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#EFF6FF] transition-colors"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4 text-[#1E293B]" />
                      </button>
                      <button
                        onClick={() => openEdit(img)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#EFF6FF] transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 text-[#1E293B]" />
                      </button>
                      <button
                        onClick={() => setDeleteImage(img)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#EF4444] hover:text-white group/trash transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-[#1E293B] group-hover/trash:text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] text-[#1E293B] truncate font-medium">{img.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-[#94A3B8]">{img.dimensions}</span>
                      <span className="text-[11px] bg-[#EFF6FF] text-[#4A90D9] px-2 py-0.5 rounded-full font-medium">
                        {img.folder}
                      </span>
                    </div>
                    {img.clientId && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <UserCircle className="w-3 h-3 text-[#00B4D8]" />
                        <span className="text-[11px] text-[#00B4D8] font-medium truncate">
                          {getClientName(img.clientId)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredImages.length && filteredImages.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[80px]">
                      Miniatura
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                      Nombre
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                      Carpeta
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                      Cliente
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                      Dimensiones
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                      Fecha
                    </th>
                    <th className="text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[120px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImages.map((img, idx) => (
                    <tr
                      key={img.id}
                      className={`border-b hover:bg-[#F8FAFC] transition-colors h-14 ${
                        selectedIds.has(img.id) ? 'bg-[#FFF7ED] border-[#E8913A]/30' : 'border-[#F1F5F9]'
                      }`}
                    >
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedIds.has(img.id)}
                          onCheckedChange={() => toggleSelect(img.id)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E2E8F0]">
                          <img
                            src={getMediaUrl(img.src)}
                            alt={img.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/hero-yacht.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <p className="text-sm font-medium text-[#1E293B] truncate max-w-[200px]">{img.name}</p>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[12px] bg-[#EFF6FF] text-[#4A90D9] px-2 py-0.5 rounded-full font-medium">
                          {img.folder}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {img.clientId ? (
                          <span className="flex items-center gap-1 text-[12px] text-[#00B4D8] font-medium">
                            <UserCircle className="w-3.5 h-3.5" />
                            {getClientName(img.clientId)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#94A3B8]">--</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-[#64748B]">{img.dimensions}</td>
                      <td className="px-4 py-2 text-sm text-[#64748B]">{formatDate(img.createdAt)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPreview(img, idx)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4 text-[#64748B]" />
                          </button>
                          <button
                            onClick={() => openEdit(img)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-[#64748B]" />
                          </button>
                          <button
                            onClick={() => setDeleteImage(img)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* VIDEOS CONTENT */}
      {activeTab === 'videos' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          {filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <VideoIcon className="w-16 h-16 text-[#CBD5E1] mb-4" />
              <p className="text-base text-[#94A3B8]">No hay videos embebidos</p>
              <Button
                onClick={() => setAddVideoOpen(true)}
                variant="outline"
                className="mt-4 border-[#D1D5DB] text-[#374151]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Anadir video
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[60px]">
                    Play
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                    Titulo
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                    URL
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                    Seccion asignada
                  </th>
                  <th className="text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((v) => (
                  <tr key={v.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors h-14">
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setPlayVideo(v)}
                        className="w-10 h-10 rounded-full bg-[#001529] flex items-center justify-center hover:bg-[#003A6B] transition-colors"
                      >
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-[#1E293B]">{v.title}</td>
                    <td className="px-4 py-2 text-sm text-[#64748B] truncate max-w-[300px]">
                      {v.src ? (
                        <span className="text-[#10B981] font-medium">Archivo subido</span>
                      ) : (
                        v.url
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[12px] bg-[#EFF6FF] text-[#4A90D9] px-2 py-0.5 rounded-full font-medium">
                        {SECTIONS_LIST.find((s) => s.id === v.sectionId)?.name || v.sectionId || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPlayVideo(v)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                          title="Previsualizar"
                        >
                          <Eye className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          onClick={() => openEditVideo(v)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <button
                          onClick={() => setDeleteVideo(v)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================= DIALOGS ======================= */}

      {/* Upload Image Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Subir Imagen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Archivo</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#EFF6FF] file:text-[#4A90D9] file:text-xs file:font-medium"
              />
              {pendingFiles.length > 0 && (
                <p className="text-[12px] text-[#64748B] mt-1">
                  {pendingFiles.length} archivo(s) seleccionado(s)
                </p>
              )}
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Nombre (opcional)</Label>
              <Input
                placeholder="Nombre personalizado..."
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Carpeta</Label>
              <Select value={uploadFolder} onValueChange={setUploadFolder}>
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                  {FOLDERS.filter((f) => f.key !== 'Todas').map((f) => (
                    <SelectItem key={f.key} value={f.key} className="text-sm">
                      {f.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Asignar a Cliente (opcional)</Label>
              <Select value={uploadClientId} onValueChange={setUploadClientId}>
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                  <SelectItem value="none" className="text-sm">-- Sin asignar --</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-sm">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setUploadOpen(false);
                setPendingFiles([]);
                setUploadName('');
                setUploadClientId('none');
              }}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={processUpload}
              disabled={pendingFiles.length === 0}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload ZIP Dialog */}
      <Dialog open={uploadZipOpen} onOpenChange={setUploadZipOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Subir ZIP de Imagenes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-[12px] text-[#64748B]">
              Selecciona un archivo .zip que contenga imagenes y/o videos. Se extraeran todos los archivos
              (imagenes: jpg, png, gif, webp, svg, bmp, ico / videos: mp4, mov, avi, mkv, webm, flv, wmv)
              ignorando las carpetas internas. Las imagenes van a la galeria de media y los videos a la galeria de videos.
            </p>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Archivo ZIP *</Label>
              <Input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#EFF6FF] file:text-[#4A90D9] file:text-xs file:font-medium"
              />
              {zipFile && (
                <p className="text-[12px] text-[#64748B] mt-1">
                  {zipFile.name} ({Math.round(zipFile.size / 1024)} KB)
                </p>
              )}
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Carpeta destino</Label>
              <Select value={zipFolder} onValueChange={setZipFolder}>
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                  {FOLDERS.filter((f) => f.key !== 'Todas').map((f) => (
                    <SelectItem key={f.key} value={f.key} className="text-sm">
                      {f.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Asignar a Cliente (opcional)</Label>
              <Select value={zipClientId} onValueChange={setZipClientId}>
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                  <SelectItem value="none" className="text-sm">-- Sin asignar --</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-sm">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setUploadZipOpen(false);
                setZipFile(null);
                setZipClientId('none');
              }}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={processZipUpload}
              disabled={!zipFile || zipUploading}
              className="bg-[#10B981] hover:bg-[#059669] text-white h-10 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-50"
            >
              {zipUploading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4 mr-2" />
                  Extraer y subir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Navigation arrows */}
          {previewIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePreview(-1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          {previewIndex < filteredImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePreview(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Image */}
          <img
            src={getMediaUrl(previewImage.src)}
            alt={previewImage.name}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/hero-yacht.jpg';
            }}
          />

          {/* Info bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-[13px] flex items-center gap-4">
            <span className="font-medium">{previewImage.name}</span>
            <span className="text-white/60">{previewImage.dimensions}</span>
            <span className="text-white/60">{previewImage.size}</span>
          </div>
        </div>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={!!editImage} onOpenChange={(open) => !open && setEditImage(null)}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Editar Imagen</DialogTitle>
          </DialogHeader>
          {editImage && (
            <div className="space-y-4 pt-2">
              {/* Preview thumbnail */}
              <div className="flex justify-center">
                <div className="w-[120px] h-[120px] rounded-lg overflow-hidden border border-[#E2E8F0]">
                  <img
                    src={getMediaUrl(editImage.src)}
                    alt={editImage.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-yacht.jpg';
                    }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Nombre</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Carpeta</Label>
                <Select value={editForm.folder} onValueChange={(v) => setEditForm((f) => ({ ...f, folder: v }))}>
                  <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                    {FOLDERS.filter((f) => f.key !== 'Todas').map((f) => (
                      <SelectItem key={f.key} value={f.key} className="text-sm">
                        {f.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Asignar a seccion</Label>
                <Select
                  value={editForm.sectionId || 'none'}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, sectionId: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg max-h-[200px]">
                    <SelectItem value="none" className="text-sm">Sin asignar</SelectItem>
                    {SECTIONS_LIST.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-sm">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Asignar a Cliente</Label>
                <Select
                  value={editForm.clientId || 'none'}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, clientId: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg max-h-[200px]">
                    <SelectItem value="none" className="text-sm">Sin asignar</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-sm">
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setEditImage(null);
                if (editImage) setDeleteImage(editImage);
              }}
              className="text-[#EF4444] hover:bg-[#FEE2E2] hover:text-[#EF4444] h-10 px-3 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditImage(null)}
                className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation */}
      <Dialog open={!!deleteImage} onOpenChange={(open) => !open && setDeleteImage(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Eliminar imagen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] pt-2">
            Estas seguro de que deseas eliminar <strong className="text-[#1E293B]">{deleteImage?.name}</strong>?
            Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteImage(null)}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteImage}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Video Dialog */}
      <Dialog
        open={addVideoOpen || !!editVideo}
        onOpenChange={(open) => {
          if (!open) {
            setAddVideoOpen(false);
            setEditVideo(null);
            setVideoForm({ title: '', url: '', sectionId: '', playbackRate: '1' });
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {editVideo ? 'Editar Video' : 'Anadir Video'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Titulo *</Label>
              <Input
                placeholder="Ej. Video promocional"
                value={videoForm.title}
                onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
                className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
              />
            </div>
            {/* Video mode toggle */}
            {!editVideo && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={videoMode === 'url' ? 'default' : 'outline'}
                  onClick={() => setVideoMode('url')}
                  className={videoMode === 'url' ? 'bg-[#4A90D9] text-white' : 'border-[#D1D5DB] text-[#374151]'}
                >
                  URL de YouTube
                </Button>
                <Button
                  type="button"
                  variant={videoMode === 'upload' ? 'default' : 'outline'}
                  onClick={() => setVideoMode('upload')}
                  className={videoMode === 'upload' ? 'bg-[#4A90D9] text-white' : 'border-[#D1D5DB] text-[#374151]'}
                >
                  Subir archivo
                </Button>
              </div>
            )}

            {videoMode === 'url' ? (
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">URL del video *</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoForm.url}
                  onChange={(e) => setVideoForm((f) => ({ ...f, url: e.target.value }))}
                  className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
                />
                {videoForm.url.includes('youtube') || videoForm.url.includes('youtu.be') ? (
                  <span className="text-[11px] bg-[#FEE2E2] text-[#EF4444] px-2 py-0.5 rounded-full mt-1 inline-block">
                    Se convertira a formato embed
                  </span>
                ) : null}
              </div>
            ) : (
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  {editVideo ? 'Cambiar archivo (opcional)' : 'Archivo de video *'}
                </Label>
                {editVideo && editVideo.src && !videoFile && (
                  <div className="mb-2 px-3 py-2 bg-[#F0FDF4] border border-[#10B981]/20 rounded-lg">
                    <span className="text-[12px] text-[#10B981] font-medium">Archivo actual guardado</span>
                    <span className="text-[11px] text-[#64748B] block">{editVideo.src.split('/').pop()}</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
                />
                {videoFile && (
                  <span className="text-[11px] text-[#10B981] mt-1 inline-block">
                    {videoFile.name} ({Math.round(videoFile.size / 1024 / 1024 * 10) / 10} MB)
                  </span>
                )}
              </div>
            )}

            {/* Playback rate */}
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Velocidad de reproduccion</Label>
              <Select
                value={videoForm.playbackRate}
                onValueChange={(v) => setVideoForm((f) => ({ ...f, playbackRate: v }))}
              >
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                  <SelectItem value="0.25" className="text-sm">0.25x (Muy lento)</SelectItem>
                  <SelectItem value="0.5" className="text-sm">0.5x (Lento)</SelectItem>
                  <SelectItem value="0.75" className="text-sm">0.75x (Algo lento)</SelectItem>
                  <SelectItem value="1" className="text-sm">1x (Normal)</SelectItem>
                  <SelectItem value="1.25" className="text-sm">1.25x (Rapido)</SelectItem>
                  <SelectItem value="1.5" className="text-sm">1.5x (Mas rapido)</SelectItem>
                  <SelectItem value="2" className="text-sm">2x (Muy rapido)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Seccion asignada</Label>
              <Select
                value={videoForm.sectionId || 'none'}
                onValueChange={(v) => setVideoForm((f) => ({ ...f, sectionId: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg max-h-[200px]">
                  <SelectItem value="none" className="text-sm">Sin asignar</SelectItem>
                  {SECTIONS_LIST.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-sm">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAddVideoOpen(false);
                setEditVideo(null);
                setVideoForm({ title: '', url: '', sectionId: '', playbackRate: '1' });
                setVideoFile(null);
                setVideoMode('url');
              }}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={editVideo ? handleUpdateVideo : handleAddVideo}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              {editVideo ? 'Guardar cambios' : 'Anadir video'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Play Video Dialog */}
      <Dialog open={!!playVideo} onOpenChange={(open) => !open && setPlayVideo(null)}>
        <DialogContent className="sm:max-w-[720px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-2">
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">{playVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {playVideo && (
              <div className="aspect-video rounded-lg overflow-hidden bg-[#001529]">
                {playVideo.src ? (
                  <video
                    src={getStorageUrl(playVideo.src)}
                    title={playVideo.title}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                ) : (
                  <iframe
                    src={playVideo.url}
                    title={playVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Video Confirmation */}
      <Dialog open={!!deleteVideo} onOpenChange={(open) => !open && setDeleteVideo(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Eliminar video</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] pt-2">
            Estas seguro de que deseas eliminar <strong className="text-[#1E293B]">{deleteVideo?.title}</strong>?
            Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteVideo(null)}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteVideo}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Batch Move Dialog */}
      <Dialog open={batchActionOpen === 'move'} onOpenChange={(open) => !open && setBatchActionOpen(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Mover imagenes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] pt-2">
            Se moveran <strong className="text-[#1E293B]">{selectedIds.size}</strong> imagen(es) a la carpeta seleccionada.
          </p>
          <div className="pt-2">
            <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Carpeta destino</Label>
            <Select value={batchFolder} onValueChange={setBatchFolder}>
              <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                {FOLDERS.filter((f) => f.key !== 'Todas').map((f) => (
                  <SelectItem key={f.key} value={f.key} className="text-sm">
                    {f.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => setBatchActionOpen(null)}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBatchMove}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Mover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Dialog */}
      <Dialog open={batchActionOpen === 'delete'} onOpenChange={(open) => !open && setBatchActionOpen(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Eliminar imagenes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] pt-2">
            Estas seguro de que deseas eliminar <strong className="text-[#1E293B]">{selectedIds.size}</strong> imagen(es)?
            Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => setBatchActionOpen(null)}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBatchDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" richColors />
    </div>
  );
}
