import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';

export default function TranslationsEditor() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/translations');
    if (res.ok) {
      const j = await res.json();
      // The API returns { data: { translations: [...], nested: {...} } }
      const data = j.data?.translations || j.data || [];
      setTranslations(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    // Send array directly - API expects array
    const res = await put('/api/translations', translations);
    if (res.ok) { toast('Traducciones guardadas'); load(); }
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  function update(idx: number, field: string, value: string) {
    const copy = [...translations]; copy[idx] = { ...copy[idx], [field]: value }; setTranslations(copy);
  }

  function addTranslation() {
    setTranslations([...translations, { translation_key: '', value_es: '', value_en: '', group_name: 'general' }]);
  }

  const filtered = translations.filter(t =>
    !search || t.translation_key?.toLowerCase().includes(search.toLowerCase()) ||
    t.value_es?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Traducciones</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={S.search} />
          <button onClick={addTranslation} style={{ ...S.btn, background: '#16a34a' }}>+ Nueva</button>
          <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
      <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#1e40af', border: '1px solid #bfdbfe' }}>
        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }} />
        Aquí puedes parametrizar los textos que aparecen en la página pública. Cada clave corresponde a un texto del sitio (menú, botones, títulos de sección). Puedes modificar tanto la versión en español como en inglés.
      </div>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={S.th}>Clave</th><th style={S.th}>Grupo</th><th style={S.th}>Español</th><th style={S.th}>English</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const realIdx = translations.indexOf(t);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={S.td}><input value={t.translation_key || ''} onChange={e => update(realIdx, 'translation_key', e.target.value)} style={S.input} /></td>
                  <td style={S.td}><input value={t.group_name || ''} onChange={e => update(realIdx, 'group_name', e.target.value)} style={{ ...S.input, width: '100px' }} /></td>
                  <td style={S.td}><input value={t.value_es || ''} onChange={e => update(realIdx, 'value_es', e.target.value)} style={S.input} /></td>
                  <td style={S.td}><input value={t.value_en || ''} onChange={e => update(realIdx, 'value_en', e.target.value)} style={S.input} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>{filtered.length} de {translations.length} traducciones</p>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  search: { padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', width: '200px' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' as const },
  th: { padding: '0.75rem 0.5rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 600, color: '#64748b' },
  td: { padding: '0.4rem 0.5rem' },
  input: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', width: '100%' },
};
