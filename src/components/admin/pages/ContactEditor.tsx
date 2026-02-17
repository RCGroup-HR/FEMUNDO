import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

export default function ContactEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/sections/contact');
    if (res.ok) { const j = await res.json(); setData(j.data); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const res = await put('/api/sections/contact', data);
    if (res.ok) toast('Contacto actualizado');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>No hay datos de contacto</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Información de Contacto</h1>
        <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
      <div style={S.card}>
        <div style={S.grid}>
          <F label="Email" value={data.email} onChange={v => setData({ ...data, email: v })} />
          <F label="Teléfono" value={data.phone} onChange={v => setData({ ...data, phone: v })} />
          <F label="Dirección (ES)" value={data.address_es} onChange={v => setData({ ...data, address_es: v })} />
          <F label="Dirección (EN)" value={data.address_en} onChange={v => setData({ ...data, address_en: v })} />
          <F label="Facebook URL" value={data.facebook_url} onChange={v => setData({ ...data, facebook_url: v })} />
          <F label="Instagram URL" value={data.instagram_url} onChange={v => setData({ ...data, instagram_url: v })} />
          <F label="Twitter URL" value={data.twitter_url} onChange={v => setData({ ...data, twitter_url: v })} />
          <F label="YouTube URL" value={data.youtube_url} onChange={v => setData({ ...data, youtube_url: v })} />
          <F label="WhatsApp" value={data.whatsapp} onChange={v => setData({ ...data, whatsapp: v })} />
          <F label="Google Maps Embed" value={data.map_embed_url} onChange={v => setData({ ...data, map_embed_url: v })} />
        </div>
      </div>
    </div>
  );
}

function F({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.875rem', outline: 'none',
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
