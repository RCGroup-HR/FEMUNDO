import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

function getYoutubeEmbedUrl(url: string) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function VideoEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/sections/video');
    if (res.ok) { const j = await res.json(); setData(j.data); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const res = await put('/api/sections/video', data);
    if (res.ok) toast('Videos actualizados');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>No hay datos de video</p>;

  const embedUrlHome = getYoutubeEmbedUrl(data.video_url || '');
  const embedUrlMultimedia = getYoutubeEmbedUrl(data.multimedia_video_url || '');

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Sección de Video</h1>
        <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
      </div>

      {/* Home Page Video */}
      <div style={{ ...S.card, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-home" /> Video Página Principal
        </h3>
        <div style={S.grid}>
          <F label="Título (ES)" value={data.title_es} onChange={v => setData({ ...data, title_es: v })} />
          <F label="Título (EN)" value={data.title_en} onChange={v => setData({ ...data, title_en: v })} />
          <F label="Descripción (ES)" value={data.description_es || data.subtitle_es} onChange={v => setData({ ...data, subtitle_es: v, description_es: v })} multiline />
          <F label="Descripción (EN)" value={data.description_en || data.subtitle_en} onChange={v => setData({ ...data, subtitle_en: v, description_en: v })} multiline />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <F label="URL del Video (YouTube) - Página Principal" value={data.video_url} onChange={v => setData({ ...data, video_url: v })} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.35rem' }} />
            Formatos: https://www.youtube.com/watch?v=XXXXX, https://youtu.be/XXXXX, o https://www.youtube.com/embed/XXXXX
          </p>
        </div>
        {embedUrlHome && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Vista previa - Principal</label>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
              <iframe src={embedUrlHome} title="Preview Home" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
      </div>

      {/* Multimedia Page Video */}
      <div style={S.card}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-photo-film" /> Video Página Multimedia
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
          Si deseas mostrar un video diferente en la página de Multimedia, configúralo aquí. Si está vacío, se usará el mismo video de la página principal.
        </p>
        <F label="URL del Video (YouTube) - Multimedia" value={data.multimedia_video_url || ''} onChange={v => setData({ ...data, multimedia_video_url: v })} />
        {embedUrlMultimedia && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Vista previa - Multimedia</label>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
              <iframe src={embedUrlMultimedia} title="Preview Multimedia" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, value, onChange, multiline }: any) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <Tag value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const,
        ...(multiline ? { minHeight: '80px' } : {}),
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};
