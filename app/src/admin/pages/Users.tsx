import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  PenLine,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser as deleteUserApi } from '../services/api.service';
import type { User as UserType } from '../types';


const ROLE_CONFIG = {
  admin: { label: 'Admin', bg: '#FFF7ED', text: '#E8913A', border: '#FED7AA', icon: Shield },
  editor: { label: 'Editor', bg: '#EFF6FF', text: '#4A90D9', border: '#BFDBFE', icon: PenLine },
  cliente: { label: 'Cliente', bg: '#F0FDF4', text: '#10B981', border: '#A7F3D0', icon: User },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'cliente', label: 'Cliente' },
];

const USERS_PER_PAGE = 7;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarBg(role: string): string {
  if (role === 'admin') return '#0A1628';
  if (role === 'editor') return '#4A90D9';
  if (role === 'cliente') return '#10B981';
  return '#CBD5E1';
}

function formatLastLogin(dateStr: string): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Hace unos minutos';
  if (diffHours < 24) return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana(s)`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserType | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'cliente' as 'admin' | 'editor' | 'cliente',
    status: true,
    password: '',
    telegramId: '',
    telegramName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getUsers().then(setUsers).catch(() => toast.error('Error al cargar usuarios'));
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }
    return filtered;
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      admin: users.filter((u) => u.role === 'admin').length,
      editor: users.filter((u) => u.role === 'editor').length,
      cliente: users.filter((u) => u.role === 'cliente').length,
    };
  }, [users]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'El nombre es requerido';
    if (!form.email.trim()) errors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalido';
    if (!editUser && !form.password.trim()) errors.password = 'La contrasena es requerida para nuevos usuarios';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'cliente', status: true, password: '', telegramId: '', telegramName: '' });
    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (user: UserType) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status === 'active',
      password: '',
      telegramId: user.telegramId || '',
      telegramName: user.telegramName || '',
    });
    setFormErrors({});
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        status: form.status ? 'active' : 'inactive',
        telegramId: form.telegramId.trim() || undefined,
        telegramName: form.telegramName.trim() || undefined,
      });
      const all = await getUsers();
      setUsers(all);
      toast.success('Usuario creado correctamente');
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Error al crear usuario');
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    if (!validateForm()) return;
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        status: form.status ? 'active' : 'inactive',
        telegramId: form.telegramId.trim() || undefined,
        telegramName: form.telegramName.trim() || undefined,
      };
      if (form.password.trim()) payload.password = form.password;
      await updateUser(editUser.id, payload);
      const all = await getUsers();
      setUsers(all);
      toast.success('Usuario actualizado');
      setEditUser(null);
      resetForm();
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await deleteUserApi(deleteUser.id);
      const all = await getUsers();
      setUsers(all);
      toast.success('Usuario eliminado');
      setDeleteUser(null);
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const toggleStatus = async (user: UserType) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser(user.id, { status: newStatus });
      const all = await getUsers();
      setUsers(all);
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`);
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight tracking-[-0.01em]">Usuarios</h1>
          <p className="text-sm text-[#64748B] mt-1">Gestion de usuarios y permisos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[260px] h-10 text-sm border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9] rounded-lg"
            />
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#E8913A] hover:bg-[#D47A2A] text-white font-semibold text-[13px] uppercase tracking-[0.04em] h-10 px-4 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col">
          <span className="text-[24px] font-bold text-[#E8913A]">{stats.admin}</span>
          <span className="text-[11px] uppercase tracking-[0.05em] text-[#94A3B8] mt-1 font-medium">Admin</span>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col">
          <span className="text-[24px] font-bold text-[#4A90D9]">{stats.editor}</span>
          <span className="text-[11px] uppercase tracking-[0.05em] text-[#94A3B8] mt-1 font-medium">Editores</span>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col">
          <span className="text-[24px] font-bold text-[#10B981]">{stats.cliente}</span>
          <span className="text-[11px] uppercase tracking-[0.05em] text-[#94A3B8] mt-1 font-medium">Clientes</span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#64748B] font-medium">Rol:</span>
          <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRoleFilter(opt.value)}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  roleFilter === opt.value
                    ? 'bg-[#0A1628] text-white'
                    : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#64748B] font-medium">Estado:</span>
          <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-[#0A1628] text-white'
                    : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <User className="w-12 h-12 text-[#CBD5E1] mb-4" />
            <p className="text-base text-[#94A3B8]">No hay usuarios registrados</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3">
                    Usuario
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[120px]">
                    Rol
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[100px]">
                    Estado
                  </th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[140px]">
                    Ultimo acceso
                  </th>
                  <th className="text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-[#64748B] px-4 py-3 w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const roleCfg = ROLE_CONFIG[user.role];
                  const RoleIcon = roleCfg.icon;
                  return (
                    <tr key={user.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors h-14">
                      {/* User cell */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0"
                            style={{ backgroundColor: getAvatarBg(user.role) }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1E293B] truncate">{user.name}</p>
                            <p className="text-[13px] text-[#94A3B8] truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium border"
                          style={{
                            backgroundColor: roleCfg.bg,
                            color: roleCfg.text,
                            borderColor: roleCfg.border,
                          }}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {roleCfg.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-2">
                        <button
                          onClick={() => toggleStatus(user)}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.status === 'active' ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'
                            }`}
                          />
                          <span className={user.status === 'active' ? 'text-[#10B981]' : 'text-[#94A3B8]'}>
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>
                      {/* Last login */}
                      <td className="px-4 py-2 text-[13px] text-[#64748B]">{formatLastLogin(user.lastLogin)}</td>
                      {/* Actions */}
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewUser(user)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4 text-[#64748B]" />
                          </button>
                          <button
                            onClick={() => openEdit(user)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-[#64748B]" />
                          </button>
                          <button
                            onClick={() => setDeleteUser(user)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
              <span className="text-[13px] text-[#94A3B8]">
                Mostrando {(currentPage - 1) * USERS_PER_PAGE + 1} de {filteredUsers.length} resultados
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#64748B]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#0A1628] text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================= DIALOGS ======================= */}

      {/* Create/Edit User Dialog */}
      <Dialog
        open={createOpen || !!editUser}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">
              {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Nombre completo <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  placeholder="Nombre y apellidos"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`h-10 text-sm rounded-lg ${
                    formErrors.name
                      ? 'border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9]'
                  }`}
                />
                {formErrors.name && <p className="text-[11px] text-[#EF4444] mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Correo electronico <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`h-10 text-sm rounded-lg ${
                    formErrors.email
                      ? 'border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9]'
                  }`}
                />
                {formErrors.email && <p className="text-[11px] text-[#EF4444] mt-1">{formErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Rol <span className="text-[#EF4444]">*</span>
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as 'admin' | 'editor' | 'cliente' }))}
                >
                  <SelectTrigger className="h-10 border-[#D1D5DB] focus:ring-[#4A90D9] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E8F0] rounded-lg shadow-lg">
                    <SelectItem value="admin" className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#E8913A]" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="editor" className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                        Editor
                      </div>
                    </SelectItem>
                    <SelectItem value="cliente" className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        Cliente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">
                  Contrasena {editUser ? '' : <span className="text-[#EF4444]">*</span>}
                </Label>
                <Input
                  type="text"
                  placeholder={editUser ? 'Dejar en blanco para mantener' : 'Contrasena'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`h-10 text-sm rounded-lg ${
                    formErrors.password
                      ? 'border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9]'
                  }`}
                />
                {formErrors.password && (
                  <p className="text-[11px] text-[#EF4444] mt-1">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3">
              <div>
                <Label className="text-[13px] font-medium text-[#374151] block">Estado</Label>
                <p className="text-[12px] text-[#94A3B8]">{form.status ? 'Activo' : 'Inactivo'}</p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, status: checked }))}
                className="data-[state=checked]:bg-[#4A90D9]"
              />
            </div>

            <div className="border-t border-[#E2E8F0] pt-4">
              <Label className="text-[13px] font-medium text-[#374151] mb-2 block">Telegram</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[12px] text-[#64748B] mb-1 block">ID de Telegram</Label>
                  <Input
                    placeholder="12345678"
                    value={form.telegramId}
                    onChange={(e) => setForm((f) => ({ ...f, telegramId: e.target.value }))}
                    className="h-9 text-sm rounded-lg border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9]"
                  />
                </div>
                <div>
                  <Label className="text-[12px] text-[#64748B] mb-1 block">Nombre en Telegram</Label>
                  <Input
                    placeholder="@usuario"
                    value={form.telegramName}
                    onChange={(e) => setForm((f) => ({ ...f, telegramName: e.target.value }))}
                    className="h-9 text-sm rounded-lg border-[#D1D5DB] focus:ring-[#4A90D9] focus:border-[#4A90D9]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setEditUser(null);
                resetForm();
              }}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={editUser ? handleUpdate : handleCreate}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              {editUser ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-[440px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
                  style={{ backgroundColor: getAvatarBg(viewUser.role) }}
                >
                  {getInitials(viewUser.name)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1E293B]">{viewUser.name}</p>
                  <p className="text-sm text-[#94A3B8]">{viewUser.email}</p>
                </div>
              </div>
              <div className="space-y-3 bg-[#F8FAFC] rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#64748B]">Rol</span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium border"
                    style={{
                      backgroundColor: ROLE_CONFIG[viewUser.role].bg,
                      color: ROLE_CONFIG[viewUser.role].text,
                      borderColor: ROLE_CONFIG[viewUser.role].border,
                    }}
                  >
                    {ROLE_CONFIG[viewUser.role].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#64748B]">Estado</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        viewUser.status === 'active' ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'
                      }`}
                    />
                    <span className="text-[13px] font-medium text-[#1E293B]">
                      {viewUser.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#64748B]">Ultimo acceso</span>
                  <span className="text-[13px] font-medium text-[#1E293B]">
                    {formatLastLogin(viewUser.lastLogin)}
                  </span>
                </div>
                {viewUser.telegramId && (
                  <div className="flex justify-between">
                    <span className="text-[13px] text-[#64748B]">Telegram</span>
                    <span className="text-[13px] font-medium text-[#1E293B]">
                      {viewUser.telegramName || viewUser.telegramId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              onClick={() => setViewUser(null)}
              className="bg-[#E8913A] hover:bg-[#D47A2A] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl border border-[#E2E8F0] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E293B]">Eliminar usuario</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] pt-2">
            Estas seguro de que deseas eliminar a <strong className="text-[#1E293B]">{deleteUser?.name}</strong>? Esta
            accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteUser(null)}
              className="border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-10 px-4 rounded-lg text-[13px] font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
