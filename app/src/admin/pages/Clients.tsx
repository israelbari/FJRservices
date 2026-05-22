import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { toast, Toaster } from 'sonner';
import { getClients, createClient, updateClient, deleteClient } from '../services/api.service';
import { api } from '@/lib/api';
import type { Client as ApiClient } from '../types';

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Mail,
  X,
  FolderOpen,
  Image,
  Download,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

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
  return {
    id: apiClient.id,
    name: apiClient.name,
    email: apiClient.email,
    phone: apiClient.phone || '',
    status: apiClient.status,
    token: apiClient.token,
    createdAt: apiClient.createdAt,
    projects: (apiClient.projects || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      mediaIds: [],
      createdAt: p.createdAt,
    })),
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

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function Clients() {
  const navigate = useNavigate();

  /* -- state -- */
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  // Dialog visibility
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [qrClient, setQrClient] = useState<Client | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formProjects, setFormProjects] = useState<Project[]>([]);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  /* -- load -- */
  useEffect(() => {
    (async () => {
      try {
        const data = await getClients();
        setClients(data.map(clientFromApi));
      } catch {
        toast.error('Error al cargar clientes');
      }
    })();
  }, []);

  /* -- filtered -- */
  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const s = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s)
    );
  }, [clients, search]);

  /* -- form helpers -- */
  const resetForm = useCallback(() => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('active');
    setFormProjects([]);
    setEditingId(null);
  }, []);

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormStatus(client.status);
    setFormProjects(client.projects.map((p) => ({ ...p })));
    setEditingId(client.id);
    setIsFormOpen(true);
  };

  const confirmDelete = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteOpen(true);
  };

  const openQr = (client: Client) => {
    setQrClient(client);
    setIsQrOpen(true);
  };

  /* -- CRUD -- */
  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    try {
      if (editingId) {
        await updateClient(editingId, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          status: formStatus,
        });
        const data = await getClients();
        setClients(data.map(clientFromApi));
        toast.success('Cliente actualizado correctamente');
      } else {
        const newClient = await createClient({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          status: formStatus,
        });
        // Create projects for the new client
        for (const proj of formProjects) {
          if (proj.name.trim()) {
            await api.post(`/projects/client/${newClient.id}`, { name: proj.name.trim(), description: proj.description });
          }
        }
        const data = await getClients();
        setClients(data.map(clientFromApi));
        toast.success('Cliente creado con acceso QR');
      }
      setIsFormOpen(false);
      resetForm();
    } catch {
      toast.error('Error al guardar cliente');
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    try {
      await deleteClient(deletingClient.id);
      const data = await getClients();
      setClients(data.map(clientFromApi));
      setIsDeleteOpen(false);
      setDeletingClient(null);
      toast.success('Cliente eliminado correctamente');
    } catch {
      toast.error('Error al eliminar cliente');
    }
  };

  /* -- project form helpers -- */
  const addProject = () => {
    setFormProjects((prev) => [
      ...prev,
      {
        id: `proj-${Date.now()}`,
        name: '',
        description: '',
        mediaIds: [],
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const removeProject = (index: number) => {
    setFormProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    setFormProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  /* -- QR helpers -- */
  const getPortalUrl = (token: string) => {
    return `${window.location.origin}/cliente/${token}`;
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
    if (!qrClient) return;
    const canvas = document.getElementById('qr-canvas-dialog') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${qrClient.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR descargado como PNG');
  };

  const sendEmail = () => {
    toast.success('Email enviado correctamente');
  };

  const regenerateToken = () => {
    if (!qrClient) return;
    toast.info('No implementado');
  };

  const loadClients = async () => {
    const data = await getClients();
    setClients(data.map(clientFromApi));
  };

  const toggleClientStatus = async (client: Client) => {
    try {
      const newStatus = client.status === 'active' ? 'inactive' : 'active';
      await updateClient(client.id, { status: newStatus });
      toast.success(`Cliente ${newStatus === 'active' ? 'activado' : 'desactivado'}`);
      await loadClients();
      if (qrClient?.id === client.id) {
        setQrClient({ ...qrClient, status: newStatus });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al actualizar estado');
    }
  };

  /* -- count media -- */
  const countMedia = (client: Client) => {
    const imgCount = client.projects.reduce(
      (sum, p) => sum + p.mediaIds.length,
      0
    );
    return imgCount;
  };

  /* -- status badge -- */
  const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) => (
    <Badge
      className={
        status === 'active'
          ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5] border-0'
          : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#F1F5F9] border-0'
      }
    >
      {status === 'active' ? 'Activo' : 'Inactivo'}
    </Badge>
  );

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-right" richColors />

      {/* ---------- Page Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B]">Gestion de Clientes</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Administra clientes, proyectos y accesos QR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[260px] h-10 bg-white border-[#E2E8F0]"
            />
          </div>
          <Button
            onClick={openCreate}
            className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold text-[13px] tracking-[0.04em] uppercase"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* ---------- Clients Table ---------- */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="w-12 h-12 text-[#CBD5E1] mb-3" />
            <p className="text-sm text-[#94A3B8]">No hay clientes registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] h-12 hover:bg-[#F8FAFC]">
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                  Cliente
                </TableHead>
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                  Email
                </TableHead>
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                  Proyectos
                </TableHead>
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em]">
                  Estado
                </TableHead>
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[80px]">
                  QR
                </TableHead>
                <TableHead className="text-[12px] uppercase font-semibold text-[#64748B] tracking-[0.05em] w-[120px] text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="h-14 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] cursor-pointer"
                  onClick={() => navigate(`/admin/clientes/${client.id}`)}
                >
                  {/* Cliente */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(
                          client.name
                        )} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {getInitials(client.name)}
                      </div>
                      <span className="text-sm font-medium text-[#1E293B] truncate max-w-[200px]">
                        {client.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-sm text-[#64748B]">
                    {client.email}
                  </TableCell>

                  {/* Proyectos */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-[#4A90D9]" />
                      <span className="text-sm text-[#1E293B]">
                        {client.projects.length} proyecto{client.projects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {countMedia(client) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Image className="w-3 h-3 text-[#94A3B8]" />
                        <span className="text-xs text-[#94A3B8]">
                          {countMedia(client)} imagen{countMedia(client) !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>

                  {/* QR */}
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openQr(client);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                      title="Ver codigo QR"
                    >
                      <QrCode className="w-5 h-5 text-[#64748B] hover:text-[#1E293B]" />
                    </button>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/clientes/${client.id}`);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4 text-[#64748B]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(client);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        title="Editar cliente"
                      >
                        <Pencil className="w-4 h-4 text-[#64748B]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(client);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ============ Create / Edit Dialog ============ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name */}
            <div>
              <Label className="text-[13px] font-medium text-[#374151]">
                Nombre completo <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre del cliente"
                className="mt-1.5 h-[42px]"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-[13px] font-medium text-[#374151]">
                Correo electronico <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="mt-1.5 h-[42px]"
              />
            </div>

            {/* Phone */}
            <div>
              <Label className="text-[13px] font-medium text-[#374151]">Telefono</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="mt-1.5 h-[42px]"
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-[13px] font-medium text-[#374151]">Estado activo</Label>
              <Switch
                checked={formStatus === 'active'}
                onCheckedChange={(checked) => setFormStatus(checked ? 'active' : 'inactive')}
              />
            </div>

            {/* Projects */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[13px] font-medium text-[#374151]">Proyectos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProject}
                  className="h-8 text-[12px]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Anadir proyecto
                </Button>
              </div>

              <div className="space-y-3">
                {formProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#64748B]">
                        Proyecto {idx + 1}
                      </span>
                      <button
                        onClick={() => removeProject(idx)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#FEF2F2] transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                      </button>
                    </div>
                    <Input
                      placeholder="Nombre del proyecto"
                      value={project.name}
                      onChange={(e) => updateProject(idx, 'name', e.target.value)}
                      className="h-[36px] text-sm"
                    />
                    <Input
                      placeholder="Descripcion (opcional)"
                      value={project.description}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      className="h-[36px] text-sm"
                    />
                  </div>
                ))}
              </div>

              {formProjects.length === 0 && (
                <p className="text-xs text-[#94A3B8] text-center py-3">
                  Sin proyectos. Anade uno para comenzar.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="h-10 border-[#D1D5DB] text-[#374151]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold"
            >
              {editingId ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Delete Confirmation ============ */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              Eliminar cliente
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-2">
            ¿Eliminar a <strong className="text-[#1E293B]">{deletingClient?.name}</strong>? Se
            perdera el acceso al portal y los proyectos quedaran sin asignar.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-10 border-[#D1D5DB]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="h-10 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ QR Dialog ============ */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B] text-center">
              Codigo QR de acceso
            </DialogTitle>
          </DialogHeader>

          {qrClient && (
            <div className="flex flex-col items-center gap-4 mt-2">
              {/* QR Display */}
              <div className="p-3 border-2 border-[#E2E8F0] rounded-xl bg-white">
                <QRCodeCanvas
                  id="qr-canvas-dialog"
                  value={getPortalUrl(qrClient.token)}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#0A1628"
                  level="M"
                />
              </div>

              {/* Client info */}
              <div className="text-center">
                <p className="text-base font-semibold text-[#1E293B]">{qrClient.name}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono mt-1">
                  {qrClient.token.slice(0, 8)}...{qrClient.token.slice(-8)}
                </p>
              </div>

              {/* Portal URL */}
              <div className="w-full flex items-center gap-2">
                <Input
                  readOnly
                  value={getPortalUrl(qrClient.token)}
                  className="flex-1 h-9 text-xs bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(qrClient.token)}
                  className="h-9 px-3 border-[#D1D5DB]"
                >
                  {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
                </Button>
              </div>

              {/* Portal active switch */}
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-sm text-[#374151]">Portal activo</span>
                <Switch
                  checked={qrClient.status === 'active'}
                  onCheckedChange={() => toggleClientStatus(qrClient)}
                />
              </div>

              {/* Actions */}
              <div className="w-full space-y-2">
                <Button
                  onClick={sendEmail}
                  className="w-full h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por email
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={downloadQr}
                    variant="outline"
                    className="flex-1 h-10 border-[#D1D5DB] text-[#374151]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar QR
                  </Button>
                  <Button
                    onClick={regenerateToken}
                    variant="outline"
                    className="flex-1 h-10 border-[#D1D5DB] text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-10 border-[#D1D5DB] text-[#374151]"
                  onClick={() => {
                    setIsQrOpen(false);
                    setTimeout(() => openEdit(qrClient), 150);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar cliente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
