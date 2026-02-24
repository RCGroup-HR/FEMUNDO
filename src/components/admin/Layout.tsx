import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ADMIN_MODULES } from '../../lib/permissions';
import ChangePasswordModal from './ChangePasswordModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, canAccess } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Detect mobile screen
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const visibleModules = ADMIN_MODULES.filter(m => canAccess(m.key));

  const sidebarWidth = isMobile ? '260px' : (collapsed ? '65px' : '250px');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile backdrop overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
        color: 'white',
        transition: 'transform 0.3s ease, width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        transform: isMobile
          ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'translateX(0)',
        boxShadow: isMobile && mobileOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}>

        {/* Logo / Brand */}
        <div style={{
          padding: (!isMobile && collapsed) ? '1rem 0' : '1.25rem 1rem',
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          justifyContent: (!isMobile && collapsed) ? 'center' : 'space-between',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/icono.png" alt="FEMUNDO" width="36" height="36" style={{ flexShrink: 0 }} />
            {(isMobile || !collapsed) && (
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em' }}>FEMUNDO</span>
            )}
          </div>
          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
                width: 32, height: 32, borderRadius: '7px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.95rem', flexShrink: 0,
              }}
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* User info on mobile (inside sidebar) */}
        {isMobile && (
          <div style={{
            padding: '0.85rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{user?.name}</div>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                padding: '1px 7px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 600,
              }}>{user?.role}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {visibleModules.map(item => {
            const active = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: (!isMobile && collapsed) ? '0.75rem 0' : '0.75rem 0.85rem',
                  borderRadius: '8px',
                  color: active ? 'white' : 'rgba(255,255,255,0.75)',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`fas ${item.icon}`} style={{ width: '20px', textAlign: 'center', flexShrink: 0 }} />
                {(isMobile || !collapsed) && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile: Cambiar contraseña + Salir dentro del sidebar */}
        {isMobile && (
          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => { setMobileOpen(false); setShowChangePwd(true); }}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.85)',
                padding: '0.7rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.875rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <i className="fas fa-key" style={{ width: '20px', textAlign: 'center' }} />
              Cambiar contraseña
            </button>
            <button
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.85)',
                padding: '0.7rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.875rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <i className="fas fa-sign-out-alt" style={{ width: '20px', textAlign: 'center' }} />
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white',
              padding: '0.75rem', cursor: 'pointer', fontSize: '0.85rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
          </button>
        )}
      </aside>

      {/* Main content area */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : (collapsed ? '65px' : '250px'),
        transition: 'margin-left 0.3s ease',
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}>

        {/* Top header bar */}
        <header style={{
          background: 'white',
          padding: '0.75rem 1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky', top: 0, zIndex: 50,
          gap: '0.5rem',
        }}>
          {/* Left: hamburger (mobile) + Ver sitio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{
                  background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px',
                  padding: '0.45rem 0.6rem', cursor: 'pointer', color: '#374151',
                  fontSize: '1rem', flexShrink: 0,
                }}
              >
                <i className="fas fa-bars" />
              </button>
            )}
            <a
              href="/"
              target="_blank"
              style={{
                color: '#64748b', textDecoration: 'none', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap',
              }}
            >
              <i className="fas fa-external-link-alt" />
              {!isMobile && ' Ver sitio'}
            </a>
          </div>

          {/* Right: user info + actions (desktop only for user info) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.85rem', flexShrink: 0 }}>
            {!isMobile && (
              <>
                <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {user?.name}
                  <span style={{
                    background: '#dbeafe', color: '#1e40af', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginLeft: '0.4rem',
                  }}>
                    {user?.role}
                  </span>
                </span>
                <button
                  onClick={() => setShowChangePwd(true)}
                  title="Cambiar contraseña"
                  style={{
                    background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                    padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem',
                    color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="fas fa-key" /> Mi cuenta
                </button>
                <button
                  onClick={logout}
                  style={{
                    background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                    padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem',
                    color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="fas fa-sign-out-alt" /> Salir
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: isMobile ? '0.85rem' : '1.5rem',
          background: '#f1f5f9',
        }}>
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
    </div>
  );
}
