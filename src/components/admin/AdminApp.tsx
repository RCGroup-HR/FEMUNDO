import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './ui/Toast';
import Login from './Login';
import Layout from './Layout';
import Dashboard from './Dashboard';
import HeroEditor from './pages/HeroEditor';
import CarouselEditor from './pages/CarouselEditor';
import AboutEditor from './pages/AboutEditor';
import StatsEditor from './pages/StatsEditor';
import VideoEditor from './pages/VideoEditor';
import AnnouncementEditor from './pages/AnnouncementEditor';
import ContactEditor from './pages/ContactEditor';
import FooterEditor from './pages/FooterEditor';
import NavigationEditor from './pages/NavigationEditor';
import TranslationsEditor from './pages/TranslationsEditor';
import EventsManager from './pages/EventsManager';
import TeamManager from './pages/TeamManager';
import ArticlesManager from './pages/ArticlesManager';
import GalleryManager from './pages/GalleryManager';
import SettingsPage from './pages/SettingsPage';
import UsersManager from './pages/UsersManager';
import MediaManager from './pages/MediaManager';
import FederationsManager from './pages/FederationsManager';
import RegulationsEditor from './pages/RegulationsEditor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{
            width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#1e3a8a',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          Cargando...
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Layout>{children}</Layout>;
}

/**
 * Ruta protegida por módulo: verifica autenticación + permiso al módulo
 */
function ModuleRoute({ moduleKey, children }: { moduleKey: string; children: React.ReactNode }) {
  const { canAccess, loading } = useAuth();
  if (loading) return null;
  if (!canAccess(moduleKey)) {
    return (
      <ProtectedRoute>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '50vh', gap: '1rem', color: '#64748b',
        }}>
          <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
          <h2 style={{ color: '#1e293b', margin: 0 }}>Acceso Restringido</h2>
          <p style={{ margin: 0 }}>No tienes permiso para acceder a este módulo.</p>
          <a href="/admin/dashboard" style={{
            padding: '0.5rem 1.25rem', background: '#1e3a8a', color: 'white',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          }}>Ir al Dashboard</a>
        </div>
      </ProtectedRoute>
    );
  }
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AdminApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginRoute />} />
            <Route path="/admin/dashboard" element={<ModuleRoute moduleKey="dashboard"><Dashboard /></ModuleRoute>} />
            <Route path="/admin/hero" element={<ModuleRoute moduleKey="hero"><HeroEditor /></ModuleRoute>} />
            <Route path="/admin/carousel" element={<ModuleRoute moduleKey="carousel"><CarouselEditor /></ModuleRoute>} />
            <Route path="/admin/about" element={<ModuleRoute moduleKey="about"><AboutEditor /></ModuleRoute>} />
            <Route path="/admin/stats" element={<ModuleRoute moduleKey="stats"><StatsEditor /></ModuleRoute>} />
            <Route path="/admin/video" element={<ModuleRoute moduleKey="video"><VideoEditor /></ModuleRoute>} />
            <Route path="/admin/announcement" element={<ModuleRoute moduleKey="announcement"><AnnouncementEditor /></ModuleRoute>} />
            <Route path="/admin/contact" element={<ModuleRoute moduleKey="contact"><ContactEditor /></ModuleRoute>} />
            <Route path="/admin/footer" element={<ModuleRoute moduleKey="footer"><FooterEditor /></ModuleRoute>} />
            <Route path="/admin/navigation" element={<ModuleRoute moduleKey="navigation"><NavigationEditor /></ModuleRoute>} />
            <Route path="/admin/translations" element={<ModuleRoute moduleKey="translations"><TranslationsEditor /></ModuleRoute>} />
            <Route path="/admin/events" element={<ModuleRoute moduleKey="events"><EventsManager /></ModuleRoute>} />
            <Route path="/admin/team" element={<ModuleRoute moduleKey="team"><TeamManager /></ModuleRoute>} />
            <Route path="/admin/articles" element={<ModuleRoute moduleKey="articles"><ArticlesManager /></ModuleRoute>} />
            <Route path="/admin/gallery" element={<ModuleRoute moduleKey="gallery"><GalleryManager /></ModuleRoute>} />
            <Route path="/admin/settings" element={<ModuleRoute moduleKey="settings"><SettingsPage /></ModuleRoute>} />
            <Route path="/admin/users" element={<ModuleRoute moduleKey="users"><UsersManager /></ModuleRoute>} />
            <Route path="/admin/media" element={<ModuleRoute moduleKey="media"><MediaManager /></ModuleRoute>} />
            <Route path="/admin/federations" element={<ModuleRoute moduleKey="federations"><FederationsManager /></ModuleRoute>} />
            <Route path="/admin/regulations" element={<ModuleRoute moduleKey="regulations"><RegulationsEditor /></ModuleRoute>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <Login />;
}
