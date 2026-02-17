import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

export default function StatsEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/sections/stats');
    if (res.ok) { const j = await res.json(); setStats(j.data || []); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    // API expects bare array, not { statistics: [...] }
    const res = await put('/api/sections/stats', stats);
    if (res.ok) toast('Estadísticas actualizadas');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  function update(idx: number, field: string, value: any) {
    const copy = [...stats];
    copy[idx] = { ...copy[idx], [field]: value };
    setStats(copy);
  }

  function addStat() {
    setStats([...stats, { label_es: '', label_en: '', value: '', icon: 'fa-star', sort_order: stats.length }]);
  }

  function removeStat(idx: number) {
    setStats(stats.filter((_, i) => i !== idx));
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Estadísticas</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={addStat} style={{ ...S.btn, background: '#16a34a' }}><i className="fas fa-plus" /> Agregar</button>
          <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: '#1e3a8a' }}>#{i + 1}</span>
              <button onClick={() => removeStat(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <F label="Valor" value={s.value} onChange={v => update(i, 'value', v)} />
              <F label="Etiqueta (ES)" value={s.label_es} onChange={v => update(i, 'label_es', v)} />
              <F label="Etiqueta (EN)" value={s.label_en} onChange={v => update(i, 'label_en', v)} />
              <F label="Ícono" value={s.icon} onChange={v => update(i, 'icon', v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function F({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.2rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
};
