import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';

// Country list with ISO codes for flag images
const COUNTRIES = [
  { country: 'Argentina', code: 'ar' }, { country: 'Aruba', code: 'aw' },
  { country: 'Bolivia', code: 'bo' }, { country: 'Brasil', code: 'br' },
  { country: 'Chile', code: 'cl' }, { country: 'Colombia', code: 'co' },
  { country: 'Costa Rica', code: 'cr' }, { country: 'Cuba', code: 'cu' },
  { country: 'Curazao', code: 'cw' }, { country: 'Ecuador', code: 'ec' },
  { country: 'El Salvador', code: 'sv' }, { country: 'España', code: 'es' },
  { country: 'Estados Unidos', code: 'us' }, { country: 'Guatemala', code: 'gt' },
  { country: 'Honduras', code: 'hn' }, { country: 'Italia', code: 'it' },
  { country: 'Jamaica', code: 'jm' }, { country: 'México', code: 'mx' },
  { country: 'Nicaragua', code: 'ni' }, { country: 'Panamá', code: 'pa' },
  { country: 'Paraguay', code: 'py' }, { country: 'Perú', code: 'pe' },
  { country: 'Puerto Rico', code: 'pr' }, { country: 'República Dominicana', code: 'do' },
  { country: 'Trinidad y Tobago', code: 'tt' }, { country: 'Uruguay', code: 'uy' },
  { country: 'Venezuela', code: 've' },
].sort((a, b) => a.country.localeCompare(b.country));

// Get flag image URL from country code (valid flagcdn sizes: 20, 40, 80, 160, 320)
function getFlagUrl(code: string, size = 40) {
  const validSizes = [20, 40, 80, 160, 320];
  const closest = validSizes.reduce((prev, curr) => Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev);
  return `https://flagcdn.com/w${closest}/${code.toLowerCase()}.png`;
}

// Get country code from country_flag field (stored as ISO code like "do", "ve")
function getCodeFromFlag(flag: string): string {
  if (!flag) return '';
  if (/^[a-z]{2}$/i.test(flag.trim())) return flag.trim().toLowerCase();
  const found = COUNTRIES.find(c => c.code === flag.toLowerCase());
  return found ? found.code : '';
}

// Flag image component
function FlagImg({ code, size = 24, style }: { code: string; size?: number; style?: React.CSSProperties }) {
  if (!code) return <span style={{ fontSize: '1.5rem', ...style }}>🌐</span>;
  return <img src={getFlagUrl(code, size * 2)} alt={code} style={{ width: size, height: Math.round(size * 0.75), objectFit: 'cover', borderRadius: 2, ...style }} />;
}

export default function FederationsManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [federations, setFederations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/federations');
    if (res.ok) { const j = await res.json(); setFederations(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/federations/${editing.id}` : '/api/federations';
    const res = await method(url, editing);
    if (res.ok) { toast('Federación guardada'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar esta federación?')) return;
    const res = await del(`/api/federations/${id}`);
    if (res.ok) { toast('Federación eliminada'); load(); }
  }

  function openNew() {
    setEditing({
      country: '', country_flag: '', name_es: '', name_en: '', president: '',
      website_url: '', facebook_url: '', instagram_url: '', logo_url: '',
      description_es: '', description_en: '', display_order: 0, is_active: 1,
    });
    setModal(true);
  }

  async function openEdit(id: number) {
    const res = await get(`/api/federations/${id}`);
    if (res.ok) { const j = await res.json(); setEditing(j.data); setModal(true); }
  }

  function handleCountryChange(country: string) {
    const found = COUNTRIES.find(c => c.country === country);
    setEditing({
      ...editing,
      country,
      country_flag: found ? found.code : editing.country_flag,
    });
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Federaciones Nacionales</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nueva Federación</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {federations.map((fed: any) => (
          <div key={fed.id} style={S.card}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              {fed.logo_url ? (
                <div style={{ position: 'relative' }}>
                  <img src={fed.logo_url} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '8px', background: '#f8fafc', padding: '2px' }} />
                  {fed.country_flag && (
                    <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'white', borderRadius: '50%', padding: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                      <FlagImg code={getCodeFromFlag(fed.country_flag)} size={16} />
                    </div>
                  )}
                </div>
              ) : (
                <FlagImg code={getCodeFromFlag(fed.country_flag)} size={40} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {fed.country_flag && (
                    <FlagImg code={getCodeFromFlag(fed.country_flag)} size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  )}
                  {fed.name_es}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{fed.country}</p>
              </div>
            </div>
            {fed.president && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                <i className="fas fa-user-tie" style={{ marginRight: 4 }} /> {fed.president}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {fed.website_url && <span style={{ fontSize: '0.7rem', background: '#dbeafe', padding: '2px 8px', borderRadius: 10 }}>Web</span>}
              {fed.facebook_url && <span style={{ fontSize: '0.7rem', background: '#dbeafe', padding: '2px 8px', borderRadius: 10 }}>FB</span>}
              {fed.instagram_url && <span style={{ fontSize: '0.7rem', background: '#dbeafe', padding: '2px 8px', borderRadius: 10 }}>IG</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
              <button onClick={() => openEdit(fed.id)} style={S.btnSm}>Editar</button>
              <button onClick={() => remove(fed.id)} style={{ ...S.btnSm, color: '#dc2626' }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {federations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <i className="fas fa-globe-americas" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
          <p>No hay federaciones registradas</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Federación' : 'Nueva Federación'} width="650px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Country selector with auto-flag */}
            <div style={S.grid}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>País</label>
                <select
                  value={editing.country || ''}
                  onChange={(e: any) => handleCountryChange(e.target.value)}
                  style={{ ...S.input, appearance: 'auto' as const }}
                >
                  <option value="">-- Seleccionar país --</option>
                  {COUNTRIES.map(c => (
                    <option key={c.country} value={c.country}>{c.country}</option>
                  ))}
                  <option value="__other">Otro...</option>
                </select>
                {editing.country === '__other' && (
                  <input
                    type="text"
                    placeholder="Nombre del país"
                    onChange={(e: any) => setEditing({ ...editing, country: e.target.value })}
                    style={{ ...S.input, marginTop: '0.35rem' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Bandera</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FlagImg code={getCodeFromFlag(editing.country_flag)} size={40} style={{ borderRadius: 4, border: '1px solid #e2e8f0' }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Se asigna automáticamente al elegir país</span>
                </div>
              </div>
            </div>

            <div style={S.grid}>
              <F label="Nombre (ES)" value={editing.name_es} onChange={v => setEditing({ ...editing, name_es: v })} />
              <F label="Nombre (EN)" value={editing.name_en} onChange={v => setEditing({ ...editing, name_en: v })} />
            </div>
            <F label="Presidente" value={editing.president} onChange={v => setEditing({ ...editing, president: v })} />
            <div style={S.grid}>
              <F label="Sitio Web" value={editing.website_url} onChange={v => setEditing({ ...editing, website_url: v })} />
              <F label="Facebook URL" value={editing.facebook_url} onChange={v => setEditing({ ...editing, facebook_url: v })} />
            </div>
            <F label="Instagram URL" value={editing.instagram_url} onChange={v => setEditing({ ...editing, instagram_url: v })} />

            {/* Logo uploader with constrained preview */}
            <div>
              <ImageUploader label="Logo de la Federación" value={editing.logo_url} onChange={url => setEditing({ ...editing, logo_url: url })} category="federations" />
              {editing.logo_url && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={editing.logo_url}
                    alt="Logo preview"
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#f8fafc', padding: '4px' }}
                  />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Vista previa del logo (se mostrará en tamaño pequeño en la página pública)</p>
                    {editing.country_flag && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <FlagImg code={getCodeFromFlag(editing.country_flag)} size={28} style={{ borderRadius: 3, border: '1px solid #e2e8f0' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <T label="Descripción (ES)" value={editing.description_es} onChange={v => setEditing({ ...editing, description_es: v })} />
            <T label="Descripción (EN)" value={editing.description_en} onChange={v => setEditing({ ...editing, description_en: v })} />
            <div style={S.grid}>
              <F label="Orden de visualización" value={editing.display_order} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
              <div />
            </div>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} /> Activa
            </label>
            <button onClick={save} style={S.btn}>Guardar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function F({ label, value, onChange, type }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

function T({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <textarea value={value || ''} onChange={(e: any) => onChange(e.target.value)} rows={3} style={{ ...S.input, resize: 'vertical' as const, minHeight: '70px' }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' },
  card: { background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' },
};
