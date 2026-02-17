import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';

const COUNTRIES = [
  { name: 'Argentina', code: 'ar' }, { name: 'Aruba', code: 'aw' },
  { name: 'Bolivia', code: 'bo' }, { name: 'Brasil', code: 'br' },
  { name: 'Canadá', code: 'ca' }, { name: 'Chile', code: 'cl' },
  { name: 'Colombia', code: 'co' }, { name: 'Costa Rica', code: 'cr' },
  { name: 'Cuba', code: 'cu' }, { name: 'Curazao', code: 'cw' },
  { name: 'Ecuador', code: 'ec' }, { name: 'El Salvador', code: 'sv' },
  { name: 'España', code: 'es' }, { name: 'Estados Unidos', code: 'us' },
  { name: 'Guatemala', code: 'gt' }, { name: 'Honduras', code: 'hn' },
  { name: 'Italia', code: 'it' }, { name: 'Jamaica', code: 'jm' },
  { name: 'México', code: 'mx' }, { name: 'Nicaragua', code: 'ni' },
  { name: 'Panamá', code: 'pa' }, { name: 'Paraguay', code: 'py' },
  { name: 'Perú', code: 'pe' }, { name: 'Puerto Rico', code: 'pr' },
  { name: 'República Dominicana', code: 'do' },
  { name: 'Trinidad y Tobago', code: 'tt' },
  { name: 'Uruguay', code: 'uy' }, { name: 'Venezuela', code: 've' },
];

const EMOJI_TO_CODE: Record<string, string> = {
  '🇦🇷': 'ar', '🇦🇼': 'aw', '🇧🇴': 'bo', '🇧🇷': 'br', '🇨🇦': 'ca',
  '🇨🇱': 'cl', '🇨🇴': 'co', '🇨🇷': 'cr', '🇨🇺': 'cu', '🇨🇼': 'cw',
  '🇪🇨': 'ec', '🇸🇻': 'sv', '🇪🇸': 'es', '🇺🇸': 'us', '🇬🇹': 'gt',
  '🇭🇳': 'hn', '🇮🇹': 'it', '🇯🇲': 'jm', '🇲🇽': 'mx', '🇳🇮': 'ni',
  '🇵🇦': 'pa', '🇵🇾': 'py', '🇵🇪': 'pe', '🇵🇷': 'pr', '🇩🇴': 'do',
  '🇹🇹': 'tt', '🇺🇾': 'uy', '🇻🇪': 've',
};

function normalizeFlagCode(flag: string, country: string): string {
  if (!flag && !country) return '';
  // Already a 2-letter ISO code
  if (flag && /^[a-z]{2}$/i.test(flag.trim())) return flag.trim().toLowerCase();
  // Emoji flag
  if (flag && EMOJI_TO_CODE[flag]) return EMOJI_TO_CODE[flag];
  // Try to resolve from country name
  const c = (country || '').trim();
  const found = COUNTRIES.find(ct => ct.name.toLowerCase() === c.toLowerCase());
  return found ? found.code : '';
}

function getFlagUrl(code: string, size = 40) {
  if (!code) return '';
  const c = code.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(c)) return `https://flagcdn.com/w${size}/${c}.png`;
  return '';
}

export default function TeamManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/team');
    if (res.ok) { const j = await res.json(); setCategories(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const payload = {
      ...editing,
      full_name: editing.full_name || editing.name,
    };
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/team/${editing.id}` : '/api/team';
    const res = await method(url, payload);
    if (res.ok) { toast('Miembro guardado'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este miembro?')) return;
    const res = await del(`/api/team/${id}`);
    if (res.ok) { toast('Miembro eliminado'); load(); }
  }

  function openNew() {
    setEditing({
      full_name: '', name: '', position_es: '', position_en: '', country: '', country_flag: '',
      photo_url: '', bio_es: '', bio_en: '', category_id: categories[0]?.id || 1,
      email: '', phone: '', display_order: 0, is_active: 1,
    });
    setModal(true);
  }

  async function openEdit(id: number) {
    const res = await get(`/api/team/${id}`);
    if (res.ok) {
      const j = await res.json();
      const data = j.data;
      // Normalize flag to ISO code
      data.country_flag = normalizeFlagCode(data.country_flag, data.country);
      // Normalize country name to match COUNTRIES list
      if (data.country) {
        const found = COUNTRIES.find(c => c.code === data.country_flag);
        if (found) data.country = found.name;
      }
      setEditing(data);
      setModal(true);
    }
  }

  async function moveUpMember(catIdx: number, memIdx: number) {
    const cat = categories[catIdx];
    if (!cat?.members || memIdx <= 0) return;
    const members = [...cat.members];
    // Swap display_order
    const prevOrder = members[memIdx - 1].display_order;
    const currOrder = members[memIdx].display_order;
    await put(`/api/team/${members[memIdx].id}`, { ...members[memIdx], display_order: prevOrder, full_name: members[memIdx].full_name || members[memIdx].name });
    await put(`/api/team/${members[memIdx - 1].id}`, { ...members[memIdx - 1], display_order: currOrder, full_name: members[memIdx - 1].full_name || members[memIdx - 1].name });
    load();
    toast('Orden actualizado');
  }

  async function moveDownMember(catIdx: number, memIdx: number) {
    const cat = categories[catIdx];
    if (!cat?.members || memIdx >= cat.members.length - 1) return;
    const members = [...cat.members];
    const nextOrder = members[memIdx + 1].display_order;
    const currOrder = members[memIdx].display_order;
    await put(`/api/team/${members[memIdx].id}`, { ...members[memIdx], display_order: nextOrder, full_name: members[memIdx].full_name || members[memIdx].name });
    await put(`/api/team/${members[memIdx + 1].id}`, { ...members[memIdx + 1], display_order: currOrder, full_name: members[memIdx + 1].full_name || members[memIdx + 1].name });
    load();
    toast('Orden actualizado');
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Equipo / Directiva</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Miembro</button>
      </div>

      {categories.map((cat, catIdx) => (
        <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.75rem' }}>
            {cat.icon && <i className={cat.icon} style={{ marginRight: '0.5rem' }} />}
            {cat.name_es} ({cat.members?.length || 0})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.85rem' }}>
            {(cat.members || []).map((m: any, memIdx: number) => (
              <div key={m.id} style={S.card}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {m.photo_url ?
                    <img src={m.photo_url} alt="" style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover' }} /> :
                    <div style={{ width: 45, height: 45, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-user" />
                    </div>
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.full_name || m.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.position_es}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {m.country_flag && <span style={{ fontSize: '1.2rem' }}>{m.country_flag}</span>}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.country}</span>
                </div>
                {m.bio_es && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {m.bio_es}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => moveUpMember(catIdx, memIdx)} disabled={memIdx === 0} style={S.arrowBtn} title="Subir">
                    <i className="fas fa-arrow-up" />
                  </button>
                  <button onClick={() => moveDownMember(catIdx, memIdx)} disabled={memIdx === (cat.members?.length || 1) - 1} style={S.arrowBtn} title="Bajar">
                    <i className="fas fa-arrow-down" />
                  </button>
                  <button onClick={() => openEdit(m.id)} style={S.btnSm}>Editar</button>
                  <button onClick={() => remove(m.id)} style={{ ...S.btnSm, color: '#dc2626' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Miembro' : 'Nuevo Miembro'} width="650px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <F label="Nombre Completo" value={editing.full_name || editing.name} onChange={v => setEditing({ ...editing, full_name: v, name: v })} />
            <div style={S.grid}>
              <F label="Cargo (ES)" value={editing.position_es} onChange={v => setEditing({ ...editing, position_es: v })} />
              <F label="Cargo (EN)" value={editing.position_en} onChange={v => setEditing({ ...editing, position_en: v })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>País</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editing.country_flag && (
                  <img src={getFlagUrl(editing.country_flag, 40)} alt={editing.country} style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 3, border: '1px solid #e2e8f0' }} />
                )}
                <select
                  value={editing.country || ''}
                  onChange={e => {
                    const selected = COUNTRIES.find(c => c.name === e.target.value);
                    setEditing({ ...editing, country: e.target.value, country_flag: selected ? selected.code : '' });
                  }}
                  style={{ ...S.input, flex: 1 }}
                >
                  <option value="">Seleccionar país...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={S.grid}>
              <F label="Email" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} />
              <F label="Teléfono" value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} />
            </div>
            <ImageUploader label="Foto del Miembro" value={editing.photo_url} onChange={url => setEditing({ ...editing, photo_url: url })} category="team" />
            <T label="Biografía / Descripción (ES)" value={editing.bio_es} onChange={v => setEditing({ ...editing, bio_es: v })} />
            <T label="Biografía / Descripción (EN)" value={editing.bio_en} onChange={v => setEditing({ ...editing, bio_en: v })} />
            <div style={S.grid}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Categoría</label>
                <select value={editing.category_id} onChange={e => setEditing({ ...editing, category_id: parseInt(e.target.value) })} style={S.input}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_es}</option>)}
                </select>
              </div>
              <F label="Orden de visualización" value={editing.display_order} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
            </div>
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

function F({ label, value, onChange, type }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none',
      }} />
    </div>
  );
}

function T({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <textarea value={value || ''} onChange={(e: any) => onChange(e.target.value)} rows={3} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const, minHeight: '70px',
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' },
  arrowBtn: { padding: '0.25rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.65rem', color: '#64748b' },
  card: { background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%' },
};
