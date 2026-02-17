import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';

export default function EventsManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  // Results
  const [resultsModal, setResultsModal] = useState(false);
  const [resultsEvent, setResultsEvent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [editingResult, setEditingResult] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/events');
    if (res.ok) { const j = await res.json(); setEvents(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/events/${editing.id}` : '/api/events';
    const res = await method(url, editing);
    if (res.ok) { toast('Evento guardado'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este evento?')) return;
    const res = await del(`/api/events/${id}`);
    if (res.ok) { toast('Evento eliminado'); load(); }
  }

  function openNew() {
    setEditing({
      slug: '', title_es: '', title_en: '', description_es: '', description_en: '',
      location: '', country: '', start_date: '', end_date: '', image_url: '',
      flyer_image_url: '', cover_image_url: '', registration_url: '', gallery_url: '',
      status: 'upcoming', is_featured: 1, pricing: [],
    });
    setModal(true);
  }

  async function openEdit(id: number) {
    const res = await get(`/api/events/${id}`);
    if (res.ok) { const j = await res.json(); setEditing(j.data); setModal(true); }
  }

  function addPricing() {
    setEditing({ ...editing, pricing: [...(editing.pricing || []), { name_es: '', name_en: '', price: 0, currency: 'USD', stripe_link: '' }] });
  }

  function updatePricing(idx: number, field: string, val: any) {
    const p = [...editing.pricing]; p[idx] = { ...p[idx], [field]: val };
    setEditing({ ...editing, pricing: p });
  }

  // --- Results Management ---
  async function openResults(event: any) {
    setResultsEvent(event);
    setResultsModal(true);
    await loadResults(event.id);
  }

  async function loadResults(eventId: number) {
    const res = await get(`/api/event-results?event_id=${eventId}`);
    if (res.ok) { const j = await res.json(); setResults(j.data || []); }
  }

  function openNewResult() {
    setEditingResult({
      event_id: resultsEvent.id, category_es: '', category_en: '', position: 1,
      player_name: '', team_name: '', country: '', country_flag: '', prize: '', notes: '', display_order: 0,
    });
  }

  function openEditResult(r: any) {
    setEditingResult({ ...r });
  }

  async function saveResult() {
    const method = editingResult.id ? put : post;
    const url = editingResult.id ? `/api/event-results/${editingResult.id}` : '/api/event-results';
    const res = await method(url, editingResult);
    if (res.ok) { toast('Resultado guardado'); setEditingResult(null); loadResults(resultsEvent.id); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function removeResult(id: number) {
    if (!confirm('¿Eliminar este resultado?')) return;
    const res = await del(`/api/event-results/${id}`);
    if (res.ok) { toast('Resultado eliminado'); loadResults(resultsEvent.id); }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Eventos</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Evento</button>
      </div>

      <div style={S.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={S.th}>Evento</th><th style={S.th}>Fecha</th><th style={S.th}>Estado</th><th style={S.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={S.td}>
                  <strong>{ev.title_es || ev.name_es}</strong>
                  <br /><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ev.location}{ev.country ? `, ${ev.country}` : ''}</span>
                  {ev.slug && <br />}
                  {ev.slug && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/{ev.slug}</span>}
                </td>
                <td style={S.td}>{ev.start_date ? new Date(ev.start_date).toLocaleDateString('es') : '-'}</td>
                <td style={S.td}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: ev.status === 'upcoming' ? '#dbeafe' : ev.status === 'active' ? '#dcfce7' : ev.status === 'completed' ? '#f1f5f9' : '#fee2e2',
                    color: ev.status === 'upcoming' ? '#1e40af' : ev.status === 'active' ? '#16a34a' : ev.status === 'completed' ? '#64748b' : '#dc2626',
                  }}>{ev.status}</span>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <button onClick={() => openEdit(ev.id)} style={S.btnSm}>Editar</button>
                    <button onClick={() => openResults(ev)} style={{ ...S.btnSm, color: '#d97706' }}>
                      <i className="fas fa-trophy" style={{ marginRight: 3 }} />Resultados
                    </button>
                    <button onClick={() => remove(ev.id)} style={{ ...S.btnSm, color: '#dc2626' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>No hay eventos</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Event Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Evento' : 'Nuevo Evento'} width="800px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={S.grid}>
              <F label="Slug (URL)" value={editing.slug} onChange={v => setEditing({ ...editing, slug: v })} placeholder="ej: barbados2025" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Estado</label>
                <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} style={S.input}>
                  <option value="upcoming">Próximo</option><option value="active">En curso</option>
                  <option value="completed">Completado</option><option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div style={S.grid}>
              <F label="Nombre (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
              <F label="Nombre (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
            </div>
            <div style={S.grid}>
              <F label="Descripción (ES)" value={editing.description_es} onChange={v => setEditing({ ...editing, description_es: v })} multiline />
              <F label="Descripción (EN)" value={editing.description_en} onChange={v => setEditing({ ...editing, description_en: v })} multiline />
            </div>
            <div style={S.grid}>
              <F label="Ubicación" value={editing.location} onChange={v => setEditing({ ...editing, location: v })} placeholder="ej: Barbados" />
              <F label="País" value={editing.country} onChange={v => setEditing({ ...editing, country: v })} placeholder="ej: Barbados" />
            </div>
            <div style={S.grid}>
              <F label="Fecha Inicio" value={editing.start_date?.substring(0, 10)} onChange={v => setEditing({ ...editing, start_date: v })} type="date" />
              <F label="Fecha Fin" value={editing.end_date?.substring(0, 10)} onChange={v => setEditing({ ...editing, end_date: v })} type="date" />
            </div>

            <h4 style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Imágenes</h4>
            <div style={S.grid}>
              <ImageUploader label="Flyer" value={editing.flyer_image_url || editing.image_url} onChange={url => setEditing({ ...editing, flyer_image_url: url, image_url: url })} category="events" />
              <ImageUploader label="Portada" value={editing.cover_image_url} onChange={url => setEditing({ ...editing, cover_image_url: url })} category="events" />
            </div>

            <h4 style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Enlaces</h4>
            <div style={S.grid}>
              <F label="URL de Registro" value={editing.registration_url} onChange={v => setEditing({ ...editing, registration_url: v })} placeholder="/registro?evento=..." />
              <F label="URL de Galería" value={editing.gallery_url} onChange={v => setEditing({ ...editing, gallery_url: v })} placeholder="/galeria o /multimedia/galeria/slug" />
            </div>

            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_featured} onChange={e => setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })} /> Destacado en homepage
            </label>

            <h4 style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
              Precios de Inscripción
            </h4>
            {(editing.pricing || []).map((p: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <F label="Nombre (ES)" value={p.name_es} onChange={(v: string) => updatePricing(i, 'name_es', v)} />
                <F label="Nombre (EN)" value={p.name_en} onChange={(v: string) => updatePricing(i, 'name_en', v)} />
                <F label="Precio" value={p.price} onChange={(v: string) => updatePricing(i, 'price', parseFloat(v) || 0)} type="number" />
                <F label="Moneda" value={p.currency} onChange={(v: string) => updatePricing(i, 'currency', v)} />
                <F label="Stripe Link" value={p.stripe_link} onChange={(v: string) => updatePricing(i, 'stripe_link', v)} />
                <button onClick={() => { const pr = [...editing.pricing]; pr.splice(i, 1); setEditing({ ...editing, pricing: pr }); }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', paddingBottom: '0.5rem', fontSize: '1rem' }}>✕</button>
              </div>
            ))}
            <button onClick={addPricing} style={{ ...S.btnSm, alignSelf: 'flex-start' }}>+ Agregar Precio</button>

            <button onClick={save} style={S.btn}>Guardar Evento</button>
          </div>
        )}
      </Modal>

      {/* Results Modal */}
      <Modal open={resultsModal} onClose={() => { setResultsModal(false); setEditingResult(null); }} title={`Resultados: ${resultsEvent?.title_es || resultsEvent?.name_es || ''}`} width="850px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{results.length} resultado(s)</span>
            <button onClick={openNewResult} style={S.btn}><i className="fas fa-plus" /> Agregar Resultado</button>
          </div>

          {/* Result Form */}
          {editingResult && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e3a8a' }}>
                {editingResult.id ? 'Editar Resultado' : 'Nuevo Resultado'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <F label="Categoría (ES)" value={editingResult.category_es} onChange={v => setEditingResult({ ...editingResult, category_es: v })} placeholder="ej: Individual, Parejas, Equipos" />
                <F label="Categoría (EN)" value={editingResult.category_en} onChange={v => setEditingResult({ ...editingResult, category_en: v })} />
                <F label="Posición" value={editingResult.position} onChange={v => setEditingResult({ ...editingResult, position: parseInt(v) || 0 })} type="number" />
                <F label="Nombre Jugador" value={editingResult.player_name} onChange={v => setEditingResult({ ...editingResult, player_name: v })} />
                <F label="Nombre Equipo" value={editingResult.team_name} onChange={v => setEditingResult({ ...editingResult, team_name: v })} />
                <F label="País" value={editingResult.country} onChange={v => setEditingResult({ ...editingResult, country: v })} />
                <F label="Bandera (emoji)" value={editingResult.country_flag} onChange={v => setEditingResult({ ...editingResult, country_flag: v })} placeholder="🇺🇸" />
                <F label="Premio" value={editingResult.prize} onChange={v => setEditingResult({ ...editingResult, prize: v })} placeholder="ej: $1,000 USD" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button onClick={saveResult} style={S.btn}>Guardar</button>
                <button onClick={() => setEditingResult(null)} style={S.btnSm}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div style={S.table}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={S.th}>Pos.</th>
                    <th style={S.th}>Categoría</th>
                    <th style={S.th}>Jugador/Equipo</th>
                    <th style={S.th}>País</th>
                    <th style={S.th}>Premio</th>
                    <th style={S.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={S.td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%', fontWeight: 700, fontSize: '0.8rem',
                          background: r.position === 1 ? '#ffd700' : r.position === 2 ? '#c0c0c0' : r.position === 3 ? '#cd7f32' : '#f1f5f9',
                          color: r.position <= 2 ? '#333' : r.position === 3 ? 'white' : '#64748b',
                        }}>{r.position}</span>
                      </td>
                      <td style={S.td}><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.category_es || 'General'}</span></td>
                      <td style={S.td}>
                        <strong>{r.player_name || r.team_name}</strong>
                        {r.player_name && r.team_name && <br />}
                        {r.player_name && r.team_name && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.team_name}</span>}
                      </td>
                      <td style={S.td}>{r.country_flag} {r.country}</td>
                      <td style={S.td}>{r.prize || '-'}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button onClick={() => openEditResult(r)} style={S.btnSm}>Editar</button>
                          <button onClick={() => removeResult(r.id)} style={{ ...S.btnSm, color: '#dc2626' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {results.length === 0 && !editingResult && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <i className="fas fa-trophy" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }} />
              <p>No hay resultados para este evento</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function F({ label, value, onChange, multiline, type, placeholder }: any) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.2rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <Tag type={type || 'text'} value={value || ''} placeholder={placeholder || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
        resize: 'vertical' as const, ...(multiline ? { minHeight: '70px' } : {}),
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  table: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.85rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const },
  td: { padding: '0.85rem 1rem', fontSize: '0.875rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  input: { padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' },
};
