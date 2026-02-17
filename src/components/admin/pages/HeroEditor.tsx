import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import ImageUploader from '../ui/ImageUploader';

export default function HeroEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/sections/hero');
    if (res.ok) { const j = await res.json(); setData(j.data); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const res = await put('/api/sections/hero', data);
    if (res.ok) toast('Hero actualizado');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>No hay datos del hero</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Hero / Banner Principal</h1>
        <button onClick={save} disabled={saving} style={S.btn}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
      <div style={S.card}>
        <div style={S.grid}>
          <Field label="Título (ES)" value={data.title_es} onChange={v => setData({ ...data, title_es: v })} />
          <Field label="Título (EN)" value={data.title_en} onChange={v => setData({ ...data, title_en: v })} />
          <Field label="Subtítulo (ES)" value={data.subtitle_es} onChange={v => setData({ ...data, subtitle_es: v })} />
          <Field label="Subtítulo (EN)" value={data.subtitle_en} onChange={v => setData({ ...data, subtitle_en: v })} />
          <Field label="Texto CTA (ES)" value={data.cta_text_es} onChange={v => setData({ ...data, cta_text_es: v })} />
          <Field label="Texto CTA (EN)" value={data.cta_text_en} onChange={v => setData({ ...data, cta_text_en: v })} />
          <Field label="URL CTA" value={data.cta_url} onChange={v => setData({ ...data, cta_url: v })} />
          <Field label="URL Video de Fondo (YouTube)" value={data.background_video} onChange={v => setData({ ...data, background_video: v })} />
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <ImageUploader
            label="Imagen de Fondo"
            value={data.background_image}
            onChange={url => setData({ ...data, background_image: url })}
            category="hero"
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.3rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <Tag value={value || ''} onChange={e => onChange(e.target.value)} style={{
        padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.9rem', outline: 'none', resize: 'vertical' as const,
        ...(multiline ? { minHeight: '80px' } : {}),
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: {
    padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
    background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
  },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};
