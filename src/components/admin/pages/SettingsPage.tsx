import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import ImageUploader from '../ui/ImageUploader';

export default function SettingsPage() {
  const { get, put } = useApi();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/settings');
    if (res.ok) { const j = await res.json(); setSettings(j.data || []); }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const payload: Record<string, string> = {};
    settings.forEach(s => { payload[s.setting_key] = s.setting_value; });
    const res = await put('/api/settings', payload);
    if (res.ok) toast('Configuración guardada');
    else toast('Error al guardar', 'error');
    setSaving(false);
  }

  function update(key: string, value: string) {
    setSettings(settings.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Configuración del Sitio</h1>
        <button onClick={save} disabled={saving} style={S.btn}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
      <div style={S.card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {settings.map(s => (
            <div key={s.setting_key} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'start' }}>
              <div style={{ paddingTop: s.setting_type === 'image' ? '0.5rem' : '0.6rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block' }}>
                  {s.setting_key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </label>
                {s.description_es && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.description_es}</span>}
              </div>
              {s.setting_type === 'image' ? (
                <ImageUploader
                  label=""
                  value={s.setting_value}
                  onChange={url => update(s.setting_key, url)}
                  category="settings"
                />
              ) : s.setting_value && s.setting_value.length > 60 ? (
                <textarea value={s.setting_value} onChange={e => update(s.setting_key, e.target.value)} style={{ ...S.input, minHeight: '60px', resize: 'vertical' as const }} />
              ) : s.setting_key.includes('color') ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" value={s.setting_value || '#000000'} onChange={e => update(s.setting_key, e.target.value)} />
                  <input value={s.setting_value || ''} onChange={e => update(s.setting_key, e.target.value)} style={S.input} />
                </div>
              ) : (
                <input value={s.setting_value || ''} onChange={e => update(s.setting_key, e.target.value)} style={S.input} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%' },
};
