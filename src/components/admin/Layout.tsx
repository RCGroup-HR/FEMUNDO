import React, { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ADMIN_MODULES } from '../../lib/permissions';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, canAccess } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Filtrar módulos del sidebar según permisos del usuario
  const visibleModules = ADMIN_MODULES.filter(m => canAccess(m.key));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '65px' : '250px',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
        color: 'white',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <img src="/icono.png" alt="FEMUNDO" width="36" height="36" />
          {!collapsed && <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>FEMUNDO</span>}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {visibleModules.map(item => {
            const active = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.7rem 0' : '0.7rem 0.85rem',
                  borderRadius: '8px',
                  color: active ? 'white' : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`fas ${item.icon}`} style={{ width: '20px', textAlign: 'center' }} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
          padding: '0.75rem', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
        </button>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? '65px' : '250px',
        transition: 'margin-left 0.3s',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header style={{
          background: 'white',
          padding: '0.85rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <a href="/" target="_blank" style={{
              color: '#64748b', textDecoration: 'none', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              <i className="fas fa-external-link-alt" /> Ver sitio
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {user?.name} <span style={{
                background: '#dbeafe', color: '#1e40af', padding: '2px 8px',
                borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginLeft: '0.35rem',
              }}>{user?.role}</span>
            </span>
            <button onClick={logout} style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
              padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b',
            }}>
              <i className="fas fa-sign-out-alt" /> Salir
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem', background: '#f1f5f9' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
