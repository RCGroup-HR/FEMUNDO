import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useApi } from './hooks/useApi';

interface DashboardStats {
  events: number;
  articles: number;
  team: number;
  gallery: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { get } = useApi();
  const [stats, setStats] = useState<DashboardStats>({ events: 0, articles: 0, team: 0, gallery: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [evRes, arRes, tmRes, glRes] = await Promise.all([
        get('/api/events'),
        get('/api/articles'),
        get('/api/team'),
        get('/api/gallery'),
      ]);
      const [ev, ar, tm, gl] = await Promise.all([
        evRes.ok ? evRes.json() : { data: [] },
        arRes.ok ? arRes.json() : { data: [] },
        tmRes.ok ? tmRes.json() : { data: [] },
        glRes.ok ? glRes.json() : { data: [] },
      ]);
      setStats({
        events: ev.data?.length || 0,
        articles: ar.data?.length || ar.pagination?.total || 0,
        team: tm.data?.reduce((a: number, c: any) => a + (c.members?.length || 0), 0) || 0,
        gallery: gl.data?.length || 0,
      });
    } catch { /* ignore */ }
    setLoading(false);
  }

  const cards = [
    { label: 'Eventos', value: stats.events, icon: 'fa-calendar', color: '#2563eb', path: '/admin/events' },
    { label: 'Artículos', value: stats.articles, icon: 'fa-newspaper', color: '#16a34a', path: '/admin/articles' },
    { label: 'Miembros', value: stats.team, icon: 'fa-users', color: '#d97706', path: '/admin/team' },
    { label: 'Álbumes', value: stats.gallery, icon: 'fa-photo-film', color: '#9333ea', path: '/admin/gallery' },
  ];

  const quickLinks = [
    { label: 'Editar Hero', icon: 'fa-image', path: '/admin/hero' },
    { label: 'Carrusel', icon: 'fa-images', path: '/admin/carousel' },
    { label: 'Configuración', icon: 'fa-gear', path: '/admin/settings' },
    { label: 'Traducciones', icon: 'fa-language', path: '/admin/translations' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
          Bienvenido, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Panel de administración de FEMUNDO</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(card => (
          <Link key={card.label} to={card.path} style={{
            background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem',
            textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderLeft: `4px solid ${card.color}`,
          }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{card.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>
                {loading ? '...' : card.value}
              </p>
            </div>
            <i className={`fas ${card.icon}`} style={{ fontSize: '1.75rem', color: card.color, opacity: 0.6 }} />
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Accesos Rápidos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1rem', borderRadius: '8px',
              border: '1px solid #e2e8f0', textDecoration: 'none',
              color: '#334155', fontSize: '0.9rem', fontWeight: 500,
              transition: 'all 0.15s',
            }}>
              <i className={`fas ${link.icon}`} style={{ color: '#2563eb' }} />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
