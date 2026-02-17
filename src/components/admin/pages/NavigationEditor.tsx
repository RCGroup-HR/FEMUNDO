import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

export default function NavigationEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/navigation?all=true');
    if (res.ok) { const j = await res.json(); setItems(j.data || []); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    // Asignar display_order basado en posición actual en la tabla
    const ordered = items.map((item, idx) => ({ ...item, display_order: idx, sort_order: idx }));
    const res = await put('/api/navigation', ordered);
    if (res.ok) { toast('Navegación actualizada'); load(); }
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  function update(idx: number, field: string, value: any) {
    const copy = [...items]; copy[idx] = { ...copy[idx], [field]: value }; setItems(copy);
  }

  function moveUp(idx: number) {
    if (idx <= 0) return;
    const copy = [...items];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setItems(copy);
  }

  function moveDown(idx: number) {
    if (idx >= items.length - 1) return;
    const copy = [...items];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
    setItems(copy);
  }

  function addItem() {
    setItems([...items, { label_es: '', label_en: '', url: '', location: 'header', sort_order: items.length, is_active: 1 }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Navegación</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={addItem} style={{ ...S.btn, background: '#16a34a' }}><i className="fas fa-plus" /> Agregar</button>
          <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
        Usa las flechas ↑↓ para ordenar los elementos del menú. El orden se guarda al presionar "Guardar".
      </p>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ ...S.th, width: '50px' }}>Orden</th>
              <th style={S.th}>Etiqueta (ES)</th><th style={S.th}>Etiqueta (EN)</th><th style={S.th}>URL</th>
              <th style={S.th}>Ubicación</th><th style={{ ...S.th, width: '50px' }}>Activo</th><th style={{ ...S.th, width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || `new-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={S.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0} style={S.arrowBtn} title="Subir">
                      <i className="fas fa-chevron-up" />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</span>
                    <button onClick={() => moveDown(i)} disabled={i === items.length - 1} style={S.arrowBtn} title="Bajar">
                      <i className="fas fa-chevron-down" />
                    </button>
                  </div>
                </td>
                <td style={S.td}><input value={item.label_es || ''} onChange={e => update(i, 'label_es', e.target.value)} style={S.input} /></td>
                <td style={S.td}><input value={item.label_en || ''} onChange={e => update(i, 'label_en', e.target.value)} style={S.input} /></td>
                <td style={S.td}><input value={item.url || ''} onChange={e => update(i, 'url', e.target.value)} style={S.input} /></td>
                <td style={S.td}>
                  <select value={item.location || 'header'} onChange={e => update(i, 'location', e.target.value)} style={S.input}>
                    <option value="header">Header</option><option value="footer">Footer</option><option value="both">Ambos</option>
                  </select>
                </td>
                <td style={{ ...S.td, textAlign: 'center' }}><input type="checkbox" checked={!!item.is_active} onChange={e => update(i, 'is_active', e.target.checked ? 1 : 0)} /></td>
                <td style={S.td}><button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No hay elementos de navegación. Agrega uno nuevo.</p>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' as const },
  th: { padding: '0.65rem 0.5rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 600, color: '#64748b' },
  td: { padding: '0.5rem' },
  input: { padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', width: '100%' },
  arrowBtn: {
    background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer',
    padding: '2px 6px', fontSize: '0.65rem', color: '#64748b', lineHeight: 1,
  },
};
