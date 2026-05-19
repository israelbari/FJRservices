import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './admin/components/AdminLayout';
import {
  AdminLogin,
  Dashboard,
  Pages,
  Sections,
  Media,
  Users,
  Clients,
  ClientDetail,
  Portal,
} from './admin/pages';

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* Public site routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
      </Route>

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin routes (with layout + auth guard) */}
      <Route path="/admin" element={<AdminRouteGuard><Dashboard /></AdminRouteGuard>} />
      <Route path="/admin/paginas" element={<AdminRouteGuard><Pages /></AdminRouteGuard>} />
      <Route path="/admin/secciones" element={<AdminRouteGuard><Sections /></AdminRouteGuard>} />
      <Route path="/admin/media" element={<AdminRouteGuard><Media /></AdminRouteGuard>} />
      <Route path="/admin/usuarios" element={<AdminRouteGuard><Users /></AdminRouteGuard>} />
      <Route path="/admin/clientes" element={<AdminRouteGuard><Clients /></AdminRouteGuard>} />
      <Route path="/admin/clientes/:id" element={<AdminRouteGuard><ClientDetail /></AdminRouteGuard>} />

      {/* Client portal (no layout) */}
      <Route path="/cliente/:token" element={<Portal />} />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
