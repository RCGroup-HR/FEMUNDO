import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';

export default function CarouselEditor() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/carousel');
    if (res.ok) { const j = await res.json(); setSlides(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/carousel/${editing.id}` : '/api/carousel';
    const res = await method(url, editing);
    if (res.ok) { toast('Slide guardado'); setModal(false); load(); }
    else toast('Error al guardar', 'error');
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este slide?')) return;
    const res = await del(`/api/carousel/${id}`);
    if (res.ok) { toast('Slide eliminado'); load(); }
  }

  function openNew() {
    setEditing({ title_es: '', title_en: '', description_es: '', description_en: '', image_url: '', link_url: '', display_order: slides.length, is_active: 1, carousel_type: 'hero' });
    setModal(true);
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Carrusel</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Slide</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {slides.map(s => (
          <div key={s.id} style={S.card}>
            {s.image_url && <img src={s.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>{s.title_es || 'Sin título'}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{s.description_es?.substring(0, 80)}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setEditing({ ...s }); setModal(true); }} style={S.btnSm}>Editar</button>
                <button onClick={() => remove(s.id)} style={{ ...S.btnSm, color: '#dc2626', borderColor: '#fecaca' }}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Slide' : 'Nuevo Slide'}>
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <F label="Título (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
            <F label="Título (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
            <F label="Descripción (ES)" value={editing.description_es} onChange={v => setEditing({ ...editing, description_es: v })} multiline />
            <F label="Descripción (EN)" value={editing.description_en} onChange={v => setEditing({ ...editing, description_en: v })} multiline />
            <ImageUploader label="Imagen del Slide" value={editing.image_url} onChange={url => setEditing({ ...editing, image_url: url })} category="carousel" />
            <F label="URL Enlace" value={editing.link_url} onChange={v => setEditing({ ...editing, link_url: v })} />
            <F label="Orden" value={editing.display_order} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} /> Activo
            </label>
            <button onClick={save} style={S.btn}>Guardar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function F({ label, value, onChange, multiline, type }: any) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <Tag type={type || 'text'} value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const,
        ...(multiline ? { minHeight: '70px' } : {}),
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
};
