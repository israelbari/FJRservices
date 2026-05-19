import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { toast, Toaster } from 'sonner';
import { getClient, updateClient } from '../services/api.service';
import type { Client as ApiClient, Media } from '../types';
import {
  ChevronLeft,
  Pencil,
  QrCode,
  Mail,
  Copy,
  Check,
  Download,
  RefreshCw,
  Folder,
  Image,
  Plus,
  Trash2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface Project {
  id: string;
  name: string;
  description: string;
  mediaIds: string[];
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  token: string;
  projects: Project[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function clientFromApi(apiClient: ApiClient): Client {
  const mediaIds = apiClient.medias?.map((m) => m.media.id) || [];
  return {
    id: apiClient.id,
    name: apiClient.name,
    email: apiClient.email,
    phone: apiClient.phone || '',
    status: apiClient.status,
    token: apiClient.token,
    createdAt: apiClient.createdAt,
    projects: apiClient.project
      ? [
          {
            id: 'proj-1',
            name: apiClient.project,
            description: '',
            mediaIds,
            createdAt: apiClient.createdAt,
          },
        ]
      : [],
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-[#0A1628] to-[#1A2D4A]',
    'from-[#4A90D9] to-[#5CA0E6]',
    'from-[#E8913A] to-[#D47A2A]',
    'from-[#10B981] to-[#34D399]',
    'from-[#8B5CF6] to-[#A78BFA]',
    'from-[#EF4444] to-[#F87171]',
    'from-[#F59E0B] to-[#FBBF24]',
    'from-[#06B6D4] to-[#22D3EE]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

import { getStorageUrl } from '@/lib/storage';

function getMediaUrl(src: string): string {
  return getStorageUrl(src);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [copied, setCopied] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  // Media assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [, setAssignProjectId] = useState<string | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  /* -- load -- */
  useEffect(() => {
    (async () => {
      try {
        const data = await getClient(id!);
        setClient(clientFromApi(data));
        const media = data.medias?.map((m: any) => m.media as Media) || [];
        setAllMedia(media);
      } catch {
        toast.error('Error al cargar cliente');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* -- helpers -- */
  const updateClientField = useCallback(
    async (field: string, value: any) => {
      if (!client) return;
      try {
        await updateClient(client.id, { [field]: value });
        const data = await getClient(client.id);
        setClient(clientFromApi(data));
        const media = data.medias?.map((m: any) => m.media as Media) || [];
        setAllMedia(media);
        toast.success('Cliente actualizado');
      } catch {
        toast.error('Error al actualizar cliente');
      }
    },
    [client]
  );

  const getPortalUrl = (token: string) => {
    return `${window.location.origin}/#/cliente/${token}`;
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getPortalUrl(token));
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const downloadQr = () => {
    if (!client) return;
    const canvas = document.getElementById('qr-detail-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${client.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR descargado como PNG');
  };

  const sendEmail = () => {
    toast.success('Email enviado correctamente');
  };

  const regenerateToken = () => {
    if (!client) return;
    toast.info('No implementado');
  };

  /* -- project management -- */
  const addProject = () => {
    if (!client) return;
    updateClientField('project', 'Nuevo proyecto');
    toast.success('Proyecto anadido');
  };

  const updateProject = (_projectId: string, name: string, _description: string) => {
    if (!client) return;
    updateClientField('project', name);
    setIsEditingProject(null);
    toast.success('Proyecto actualizado');
  };

  const deleteProject = (_projectId: string) => {
    if (!client) return;
    if (!window.confirm('¿Eliminar este proyecto? Las imagenes asignadas quedaran sin clasificar.'))
      return;
    updateClientField('project', null);
    toast.success('Proyecto eliminado');
  };

  /* -- media assignment -- */
  const openAssignDialog = (projectId: string) => {
    if (!client) return;
    const project = client.projects.find((p) => p.id === projectId);
    if (project) {
      setAssignProjectId(projectId);
      setSelectedMediaIds([...project.mediaIds]);
      setAssignDialogOpen(true);
    }
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((m) => m !== mediaId) : [...prev, mediaId]
    );
  };

  const saveMediaAssignment = () => {
    setAssignDialogOpen(false);
    setAssignProjectId(null);
    toast.info('Asignacion de media no implementada');
  };

  const getAssignedMedia = (mediaIds: string[]) => {
    return allMedia.filter((m) => mediaIds.includes(m.id));
  };

  /* -- loading -- */
  if (loading) return null;

  /* -- not found -- */
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-[#1E293B] font-semibold mb-2">Cliente no encontrado</p>
        <Button
          onClick={() => navigate('/admin/clientes')}
          variant="outline"
          className="mt-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver a clientes
        </Button>
      </div>
    );
  }

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-right" richColors />

      {/* ---------- Breadcrumb ---------- */}
      <div className="flex items-center gap-2 text-[13px] text-[#94A3B8]">
        <Link
          to="/admin/clientes"
          className="flex items-center gap-1 hover:text-[#4A90D9] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Clientes
        </Link>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-[#1E293B] font-medium">{client.name}</span>
      </div>

      {/* ---------- Two Column Layout ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Client Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(
                client.name
              )} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}
            >
              {getInitials(client.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-bold text-[#1E293B]">{client.name}</h1>
              <p className="text-sm text-[#4A90D9] mt-0.5">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-[#64748B] mt-0.5">{client.phone}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <Badge
                  className={
                    client.status === 'active'
                      ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5] border-0'
                      : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#F1F5F9] border-0'
                  }
                >
                  {client.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
                <span className="text-xs text-[#94A3B8]">
                  Registrado el {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F1F5F9] mt-5 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#374151]">Portal activo</span>
                <Switch
                  checked={client.status === 'active'}
                  onCheckedChange={(checked) =>
                    updateClientField('status', checked ? 'active' : 'inactive')
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate(`/admin/clientes`);
                    // small delay to let the list render then trigger edit dialog via state
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent('open-edit-client', { detail: client.id })
                      );
                    }, 100);
                  }}
                  className="h-9 border-[#D1D5DB] text-[#374151]"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById('qr-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-9 bg-[#E8913A] hover:bg-[#D47A2A] text-white"
                >
                  <QrCode className="w-3.5 h-3.5 mr-1.5" />
                  Ver QR
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Code Card */}
        <div id="qr-section" className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#1E293B] mb-4 text-center">
            Codigo QR de Acceso
          </h2>

          <div className="flex flex-col items-center gap-4">
            {/* QR */}
            <div className="p-3 border border-[#E2E8F0] rounded-lg bg-white">
              <QRCodeCanvas
                id="qr-detail-canvas"
                value={getPortalUrl(client.token)}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#0A1628"
                level="M"
              />
            </div>

            {/* Info */}
            <div className="text-center">
              <p className="text-sm font-medium text-[#1E293B]">{client.name}</p>
              <p className="text-[11px] text-[#94A3B8] font-mono mt-1">
                {client.token.slice(0, 8)}...{client.token.slice(-8)}
              </p>
            </div>

            {/* URL + Copy */}
            <div className="w-full flex items-center gap-2">
              <Input
                readOnly
                value={getPortalUrl(client.token)}
                className="flex-1 h-9 text-xs bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(client.token)}
                className="h-9 px-3 border-[#D1D5DB]"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#64748B]" />
                )}
              </Button>
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-2 gap-2">
              <Button
                onClick={sendEmail}
                className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar por email
              </Button>
              <Button
                onClick={downloadQr}
                variant="outline"
                className="h-10 border-[#D1D5DB] text-[#374151]"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
            </div>

            <Button
              onClick={regenerateToken}
              variant="ghost"
              className="h-9 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar token
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- Projects Section ---------- */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Proyectos de {client.name.split(' ')[0]}
          </h2>
          <Button
            onClick={addProject}
            className="h-9 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[12px]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Proyecto
          </Button>
        </div>

        {client.projects.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#94A3B8]">Sin proyectos asignados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {client.projects.map((project) => {
              const assignedMedia = getAssignedMedia(project.mediaIds);
              const isEditing = isEditingProject === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Folder className="w-5 h-5 text-[#4A90D9] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editProjectName}
                              onChange={(e) => setEditProjectName(e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Nombre del proyecto"
                            />
                            <Input
                              value={editProjectDesc}
                              onChange={(e) => setEditProjectDesc(e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Descripcion"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateProject(project.id, editProjectName, editProjectDesc)
                                }
                                className="h-7 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[11px]"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingProject(null)}
                                className="h-7 text-[11px] text-[#64748B]"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-[15px] font-semibold text-[#1E293B]">
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge className="bg-[#EFF6FF] text-[#4A90D9] hover:bg-[#EFF6FF] border-0 text-[11px]">
                          {assignedMedia.length} imagen{assignedMedia.length !== 1 ? 'es' : ''}
                        </Badge>
                        <button
                          onClick={() => {
                            setIsEditingProject(project.id);
                            setEditProjectName(project.name);
                            setEditProjectDesc(project.description);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                          title="Editar proyecto"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#64748B]" />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] transition-colors"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Media Grid */}
                  {assignedMedia.length > 0 && !isEditing && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {assignedMedia.map((media) => (
                        <div
                          key={media.id}
                          className="aspect-square rounded-lg border border-[#E2E8F0] bg-white overflow-hidden group relative"
                        >
                          <img
                            src={getMediaUrl(media.src)}
                            alt={media.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-white text-[10px] font-medium px-2 truncate">
                              {media.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignDialog(project.id)}
                        className="h-8 text-[12px] border-[#D1D5DB] border-dashed"
                      >
                        <Image className="w-3.5 h-3.5 mr-1.5" />
                        Asignar imagenes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `${window.location.origin}/#/cliente/${client.token}`,
                            '_blank'
                          )
                        }
                        className="h-8 text-[12px] border-[#D1D5DB]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Ver portal
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ Media Assignment Dialog ============ */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              Asignar imagenes al proyecto
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {allMedia.length === 0 ? (
              <div className="text-center py-6">
                <Image className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">No hay imagenes disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
                {allMedia.map((media) => {
                  const isSelected = selectedMediaIds.includes(media.id);
                  return (
                    <button
                      key={media.id}
                      onClick={() => toggleMediaSelection(media.id)}
                      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected
                          ? 'border-[#4A90D9] ring-2 ring-[#4A90D9]/20'
                          : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                      }`}
                    >
                      <img
                        src={getMediaUrl(media.src)}
                        alt={media.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4A90D9] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-[9px] text-white truncate">{media.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-[#94A3B8] mt-3 text-center">
              {selectedMediaIds.length} imagen{selectedMediaIds.length !== 1 ? 'es' : ''} seleccionada
              {selectedMediaIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setAssignProjectId(null);
              }}
              className="h-10 border-[#D1D5DB]"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveMediaAssignment}
              className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold"
            >
              Guardar asignacion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
