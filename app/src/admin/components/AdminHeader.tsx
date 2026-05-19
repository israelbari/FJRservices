import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, ChevronDown, User, Settings, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Build breadcrumbs from path
  const pathSegments = location.pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean);

  const breadcrumbMap: Record<string, string> = {
    '': 'Dashboard',
    paginas: 'Paginas',
    secciones: 'Secciones',
    media: 'Media',
    usuarios: 'Usuarios',
    clientes: 'Clientes',
  };

  const formatDate = () => {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 ml-10 lg:ml-0">
        <Link
          to="/admin"
          className="text-[#94A3B8] hover:text-[#1E293B] transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        {pathSegments.length === 0 ? (
          <>
            <span className="text-[#94A3B8] text-[13px]">/</span>
            <span className="text-[13px] font-medium text-[#1E293B]">Dashboard</span>
          </>
        ) : (
          pathSegments.map((segment, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-[13px]">/</span>
              <span
                className={`text-[13px] ${
                  index === pathSegments.length - 1
                    ? 'font-medium text-[#1E293B]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {breadcrumbMap[segment] || segment}
              </span>
            </span>
          ))
        )}
      </div>

      {/* Center: Date */}
      <div className="hidden md:flex items-center gap-2 text-[13px] text-[#64748B]">
        <span>{formatDate()}</span>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Ver Sitio */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors border border-[#E2E8F0] hover:border-[#D1D5DB]"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Ver Sitio</span>
        </a>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00B4D8] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#003A6B] flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:inline text-sm text-[#1E293B] font-medium">
              {user?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-[#64748B] hidden sm:block" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-20 py-1">
                <div className="px-4 py-2 border-b border-[#E2E8F0]">
                  <p className="text-sm font-medium text-[#1E293B]">{user?.name}</p>
                  <p className="text-xs text-[#94A3B8] capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  <User className="w-4 h-4 text-[#64748B]" />
                  Perfil
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#64748B]" />
                  Configuracion
                </button>
                <div className="border-t border-[#E2E8F0] my-1" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
