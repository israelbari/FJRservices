import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Image,
  Video,
  Calendar,
  RotateCw,
  Pencil,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  Layers,
  Settings,
  UserCircle,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import {
  getUsers,
  getPages,
  getMedia,
  getVideos,
  getClients,
  getSections,
} from '../services/api.service';
import type { Section } from '../types';
import StatCard from '../components/StatCard';

interface ActivityItem {
  id: string;
  action: 'create' | 'edit' | 'delete' | 'upload' | 'login' | 'logout';
  entity: string;
  entityId: string;
  detail: string;
  userId: string;
  userName: string;
  createdAt: string;
}

const ACTION_CONFIG: Record<string, { icon: typeof Pencil; bg: string; color: string }> = {
  edit: { icon: Pencil, bg: '#EFF6FF', color: '#00B4D8' },
  create: { icon: Plus, bg: '#F0FDF4', color: '#10B981' },
  delete: { icon: Trash2, bg: '#FEF2F2', color: '#EF4444' },
  upload: { icon: Upload, bg: '#FFF7ED', color: '#00B4D8' },
  login: { icon: Users, bg: '#EFF6FF', color: '#00B4D8' },
  logout: { icon: Users, bg: '#F1F5F9', color: '#64748B' },
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Hace minutos';
  if (diffH < 24) return `Hace ${diffH} hora${diffH > 1 ? 's' : ''}`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} dia${diffD > 1 ? 's' : ''}`;
}

function formatDateFull(): string {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

export default function Dashboard() {
  const [period, setPeriod] = useState(7);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    pages: 0,
    images: 0,
    videos: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string; project: string; status: string }>>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [users, pages, media, videos, clientsData, sectionsData] = await Promise.all([
        getUsers(),
        getPages(),
        getMedia(),
        getVideos(),
        getClients(),
        getSections(),
      ]);

      setStats({
        users: users.length,
        pages: pages.length,
        images: media.length,
        videos: videos.length,
      });
      setActivity([]);
      setClients(clientsData.slice(0, 5));
      setSections(sectionsData);
    } catch {
      toast.error('Error al cargar los datos del dashboard');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Chart data - aggregate activity by day for the selected period
  const chartData = useMemo(() => {
    const now = new Date();
    const data: { day: string; acciones: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      data.push({
        day: DAYS_ES[d.getDay()],
        acciones: Math.floor(Math.random() * 8) + 1,
      });
    }
    return data;
  }, [period]);

  // Content distribution data
  const pageCounts = useMemo(() => {
    const counts: Record<string, number> = { p1: 0, p2: 0, p3: 0, p4: 0 };
    sections.forEach((s) => {
      if (counts[s.pageId] !== undefined) counts[s.pageId]++;
    });
    return [
      { name: 'Inicio', value: counts.p1, color: '#00B4D8' },
      { name: 'Servicios', value: counts.p2, color: '#00B4D8' },
      { name: 'Nosotros', value: counts.p3, color: '#10B981' },
      { name: 'Contacto', value: counts.p4, color: '#8B5CF6' },
    ];
  }, [sections]);
  const totalSections = pageCounts.reduce((sum, p) => sum + p.value, 0);

  const todayChanges = activity.filter((a) => {
    const d = new Date(a.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const quickActions = [
    { icon: <FileText className="w-6 h-6 text-[#00B4D8]" />, label: 'Editar Paginas', to: '/admin/paginas' },
    { icon: <Layers className="w-6 h-6 text-[#00B4D8]" />, label: 'Gestionar Secciones', to: '/admin/secciones' },
    { icon: <Image className="w-6 h-6 text-[#00B4D8]" />, label: 'Subir Imagenes', to: '/admin/media' },
    { icon: <Users className="w-6 h-6 text-[#00B4D8]" />, label: 'Ver Usuarios', to: '/admin/usuarios' },
    { icon: <UserCircle className="w-6 h-6 text-[#00B4D8]" />, label: 'Nuevo Cliente', to: '/admin/clientes' },
    { icon: <Settings className="w-6 h-6 text-[#00B4D8]" />, label: 'Configuracion', to: '/admin' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E293B]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Resumen general de fjrservices.com</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#64748B]">
            <Calendar className="w-4 h-4" />
            {formatDateFull()}
          </span>
          <button
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:shadow-sm transition-all"
            title="Actualizar datos"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          iconBg="#EFF6FF"
          iconColor="#00B4D8"
          value={stats.users}
          label="USUARIOS REGISTRADOS"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          iconBg="#F0FDF4"
          iconColor="#10B981"
          value={stats.pages}
          label="PAGINAS ACTIVAS"
          subtext="Todas las paginas publicadas"
        />
        <StatCard
          icon={<Image className="w-5 h-5" />}
          iconBg="#FFF7ED"
          iconColor="#00B4D8"
          value={stats.images}
          label="IMAGENES EN GALERIA"
          trend={{ value: '+3 esta semana', direction: 'up' }}
        />
        <StatCard
          icon={<Video className="w-5 h-5" />}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          value={stats.videos}
          label="VIDEOS EMBEBIDOS"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-base font-semibold text-[#1E293B]">Actividad Reciente</h2>
            <div className="flex bg-[#F1F5F9] rounded-lg p-1 gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setPeriod(d)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    period === d
                      ? 'bg-[#001529] text-white'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {d} dias
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value} acciones`, '']}
              />
              <Area
                type="monotone"
                dataKey="acciones"
                stroke="#00B4D8"
                strokeWidth={2}
                fill="url(#activityFill)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Content Distribution */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col">
          <h2 className="text-base font-semibold text-[#1E293B] mb-4">
            Distribucion de Contenido
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pageCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={600}
                >
                  {pageCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute mt-16">
              <span className="text-2xl font-bold text-[#1E293B]">{totalSections}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {pageCounts.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-xs text-[#64748B]">
                    {p.name} ({p.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1E293B]">Ultimos Cambios</h2>
              {todayChanges > 0 && (
                <span className="bg-[#EFF6FF] text-[#00B4D8] text-xs font-medium px-2 py-0.5 rounded-full">
                  {todayChanges}
                </span>
              )}
            </div>
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-[#CBD5E1] mb-3" />
              <p className="text-sm text-[#94A3B8]">Sin actividad reciente</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#F1F5F9]">
                {activity.map((item) => {
                  const config = ACTION_CONFIG[item.action] || ACTION_CONFIG.login;
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1E293B] truncate">{item.detail}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {item.userName}
                        </p>
                      </div>
                      <span className="text-xs text-[#94A3B8] flex-shrink-0">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-3 border-t border-[#E2E8F0]">
                <button className="inline-flex items-center gap-1.5 text-[13px] text-[#00B4D8] hover:underline">
                  Ver todo el historial
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#1E293B] mb-4">Accesos Rapidos</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4 hover:bg-white hover:border-[#00B4D8] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                {action.icon}
                <span className="text-xs font-medium text-[#374151]">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <h2 className="text-base font-semibold text-[#1E293B]">Clientes Recientes</h2>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#003A6B] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1E293B] truncate">{client.name}</p>
                <p className="text-xs text-[#94A3B8]">{client.project}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  client.status === 'active'
                    ? 'bg-[#D1FAE5] text-[#065F46]'
                    : 'bg-[#FEE2E2] text-[#991B1B]'
                }`}
              >
                {client.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
