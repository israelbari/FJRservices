import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image,
  Users,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
  group: string;
}

const navItems: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', group: 'CONTENIDO' },
  { to: '/admin/paginas', icon: <FileText className="w-5 h-5" />, label: 'Paginas', group: 'CONTENIDO' },
  { to: '/admin/secciones', icon: <Layers className="w-5 h-5" />, label: 'Secciones', group: 'CONTENIDO' },
  { to: '/admin/media', icon: <Image className="w-5 h-5" />, label: 'Media', group: 'CONTENIDO' },
  { to: '/admin/usuarios', icon: <Users className="w-5 h-5" />, label: 'Usuarios', group: 'GESTION' },
  { to: '/admin/clientes', icon: <UserCircle className="w-5 h-5" />, label: 'Clientes', group: 'GESTION' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
  };

  const contentGroups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // Filter: editors don't see Users, only admins see Clientes
  const visibleGroups = Object.entries(contentGroups).reduce<Record<string, NavItem[]>>(
    (acc, [group, items]) => {
      const filtered = items.filter((item) => {
        if (item.to === '/admin/usuarios') return isAdmin();
        if (item.to === '/admin/clientes') return isAdmin();
        return true;
      });
      if (filtered.length > 0) acc[group] = filtered;
      return acc;
    },
    {}
  );

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  const renderSidebar = () => (
    <div
      className={`${sidebarWidth} h-screen bg-[#001529] flex flex-col transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex-shrink-0`}
    >
      {/* Logo */}
      <div
        className="h-[72px] flex items-center px-5 border-b border-[#002952] cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/FJRServices.png" alt="FJR Services" className="h-8 w-auto flex-shrink-0" />
          {!collapsed && (
            <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap">
              FJR ADMIN
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(true);
            }}
            className="ml-auto text-[#64748B] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(false);
            }}
            className="ml-auto text-[#64748B] hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {Object.entries(visibleGroups).map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <div className="mx-4 my-2 h-px bg-[#002952]" />}
            {!collapsed && (
              <div className="px-5 pt-4 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                  {group}
                </span>
              </div>
            )}
            {items.map((item) => {
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive: navActive }) =>
                    `flex items-center h-11 mx-2 px-3 rounded-lg transition-colors duration-150 relative ${
                      navActive || isActive
                        ? 'bg-[#003A6B] text-white'
                        : 'text-[#94A3B8] hover:bg-[#001D3D] hover:text-white'
                    }`
                  }
                >
                  {(isActive || undefined) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#00B4D8] rounded-r-full" />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Mini Card */}
      <div className="p-4 border-t border-[#002952]">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#003A6B] flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#001D3D] hover:text-white transition-colors"
              title="Cerrar Sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#003A6B] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white truncate font-medium">{user?.name}</p>
              <p className="text-[11px] text-[#94A3B8] capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#001D3D] hover:text-white transition-colors flex-shrink-0"
              title="Cerrar Sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-[#001529] text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen z-50">{renderSidebar()}</aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 h-screen z-50">
            <div className="w-[260px] h-screen bg-[#001529] flex flex-col">
              {/* Mobile logo */}
              <div className="h-[72px] flex items-center px-5 border-b border-[#002952]">
                <img src="/FJRServices.png" alt="FJR Services" className="h-8 w-auto flex-shrink-0" />
                <span className="ml-3 text-white font-semibold text-base tracking-wide">
                  FJR ADMIN
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="ml-auto text-[#64748B] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto py-2">
                {Object.entries(visibleGroups).map(([group, items], groupIndex) => (
                  <div key={group}>
                    {groupIndex > 0 && <div className="mx-4 my-2 h-px bg-[#002952]" />}
                    <div className="px-5 pt-4 pb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                        {group}
                      </span>
                    </div>
                    {items.map((item) => {
                      const isActive =
                        item.to === '/admin'
                          ? location.pathname === '/admin'
                          : location.pathname.startsWith(item.to);
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin'}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive: navActive }) =>
                            `flex items-center h-11 mx-2 px-3 rounded-lg transition-colors duration-150 relative ${
                              navActive || isActive
                                ? 'bg-[#003A6B] text-white'
                                : 'text-[#94A3B8] hover:bg-[#001D3D] hover:text-white'
                            }`
                          }
                        >
                          {(isActive || undefined) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#00B4D8] rounded-r-full" />
                          )}
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="ml-3 text-sm font-medium">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Mobile user card */}
              <div className="p-4 border-t border-[#002952]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#003A6B] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate font-medium">{user?.name}</p>
                    <p className="text-[11px] text-[#94A3B8] capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#001D3D] hover:text-white transition-colors flex-shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
