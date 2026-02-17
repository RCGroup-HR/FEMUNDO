import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

export default function FooterEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/sections/footer');
    if (res.ok) { const j = await res.json(); setSections(j.data || []); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const res = await put('/api/sections/footer', { sections });
    if (res.ok) toast('Footer actualizado');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  function update(idx: number, field: string, value: string) {
    const copy = [...sections]; copy[idx] = { ...copy[idx], [field]: value }; setSections(copy);
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Footer</h1>
        <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
      {sections.map((s, i) => (
        <div key={s.id || i} style={S.card}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e3a8a' }}>{s.section_key || `Sección ${i + 1}`}</h3>
          <div style={S.grid}>
            <F label="Título (ES)" value={s.title_es} onChange={v => update(i, 'title_es', v)} />
            <F label="Título (EN)" value={s.title_en} onChange={v => update(i, 'title_en', v)} />
            <F label="Contenido (ES)" value={s.content_es} onChange={v => update(i, 'content_es', v)} multiline />
            <F label="Contenido (EN)" value={s.content_en} onChange={v => update(i, 'content_en', v)} multiline />
          </div>
        </div>
      ))}
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
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};
