import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import ImageUploader from '../ui/ImageUploader';

export default function AnnouncementEditor() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    // Load ALL announcements (active and inactive) from announcement table
    const res = await get('/api/sections/announcement?all=1');
    if (res.ok) {
      const j = await res.json();
      const data = j.data;
      setAnnouncements(Array.isArray(data) ? data : (data ? [data] : []));
    }
    setLoading(false);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    let res;
    if (editing.id) {
      res = await put('/api/sections/announcement', editing);
    } else {
      res = await post('/api/sections/announcement', editing);
    }
    if (res.ok) {
      toast('Anuncio guardado');
      setEditing(null);
      load();
    } else {
      toast('Error al guardar', 'error');
    }
    setSaving(false);
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este anuncio?')) return;
    const res = await del(`/api/sections/announcement?id=${id}`);
    if (res.ok) { toast('Anuncio eliminado'); load(); }
    else toast('Error al eliminar', 'error');
  }

  function openNew() {
    setEditing({
      title_es: '', title_en: '', image_url: '', link_url: '',
      is_active: 1, display_order: 0,
      start_date: '', end_date: '',
    });
  }

  function openEdit(ann: any) {
    setEditing({ ...ann });
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Modal de Anuncio</h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
            Configura la imagen y el enlace del modal que aparece al entrar a la página principal.
          </p>
        </div>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" style={{ marginRight: '0.35rem' }} /> Nuevo Anuncio</button>
      </div>

      {/* List of existing announcements */}
      {announcements.length > 0 && !editing && (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {announcements.map((ann: any) => (
            <div key={ann.id} style={{ ...S.card, display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              {ann.image_url && (
                <img src={ann.image_url} alt={ann.title_es || 'Anuncio'} style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#f8fafc' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{ann.title_es || 'Sin título'}</h3>
                    {ann.link_url && <p style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.25rem' }}>{ann.link_url}</p>}
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '10px',
                    background: ann.is_active ? '#dcfce7' : '#fee2e2',
                    color: ann.is_active ? '#166534' : '#991b1b',
                  }}>
                    {ann.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {(ann.start_date || ann.end_date) && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    <i className="fas fa-calendar" style={{ marginRight: 4 }} />
                    {ann.start_date ? new Date(ann.start_date).toLocaleDateString('es-ES') : '∞'} — {ann.end_date ? new Date(ann.end_date).toLocaleDateString('es-ES') : '∞'}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => openEdit(ann)} style={S.btnSm}>
                    <i className="fas fa-edit" style={{ marginRight: 4 }} />Editar
                  </button>
                  <button onClick={() => remove(ann.id)} style={{ ...S.btnSm, color: '#dc2626' }}>
                    <i className="fas fa-trash" style={{ marginRight: 4 }} />Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {announcements.length === 0 && !editing && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '12px' }}>
          <i className="fas fa-bullhorn" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block' }} />
          <p>No hay anuncios configurados</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Crea un anuncio para que aparezca como modal al abrir la página principal</p>
        </div>
      )}

      {/* Edit/Create form */}
      {editing && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a' }}>
              {editing.id ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h3>
            <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={S.grid}>
              <F label="Título (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
              <F label="Título (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
            </div>

            <ImageUploader
              label="Imagen del Anuncio (se mostrará en el modal al entrar a la página)"
              value={editing.image_url}
              onChange={url => setEditing({ ...editing, image_url: url })}
              category="announcements"
            />
            {editing.image_url && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Vista previa:</p>
                <img src={editing.image_url} alt="Preview" style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
              </div>
            )}

            <F label="URL de Enlace (al hacer clic en la imagen, abre este enlace)" value={editing.link_url} onChange={v => setEditing({ ...editing, link_url: v })} />

            <div style={S.grid}>
              <F label="Fecha Inicio (opcional)" value={editing.start_date ? editing.start_date.slice(0, 10) : ''} onChange={v => setEditing({ ...editing, start_date: v || null })} type="date" />
              <F label="Fecha Fin (opcional)" value={editing.end_date ? editing.end_date.slice(0, 10) : ''} onChange={v => setEditing({ ...editing, end_date: v || null })} type="date" />
            </div>

            <F label="Orden" value={editing.display_order} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />

            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} /> Anuncio Activo
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setEditing(null)} style={S.btnSm}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.875rem', outline: 'none',
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};
