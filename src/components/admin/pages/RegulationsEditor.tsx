import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import RichTextEditor from '../ui/RichTextEditor';

const SECTION_TYPES = [
  { value: 'article', label: 'Articulo' },
  { value: 'card_system', label: 'Sistema de Tarjetas' },
  { value: 'commission', label: 'Comision' },
  { value: 'final', label: 'Disposicion Final' },
];

const EMPTY_SECTION = {
  section_key: '',
  title_es: '',
  title_en: '',
  content_es: '',
  content_en: '',
  icon: '',
  section_type: 'article',
  display_order: 0,
  is_active: 1,
};

export default function RegulationsEditor() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await get('/api/sections/regulations');
    if (res.ok) { const j = await res.json(); setSections(j.data || []); }
    else toast('Error al cargar reglamento', 'error');
    setLoading(false);
  }

  function openNew() {
    setEditing({ ...EMPTY_SECTION, display_order: sections.length + 1 });
    setModal(true);
  }

  function openEdit(section: any) {
    setEditing({ ...section });
    setModal(true);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const method = editing.id ? put : post;
    const res = await method('/api/sections/regulations', editing);
    if (res.ok) {
      toast(editing.id ? 'Seccion actualizada' : 'Seccion creada');
      setModal(false);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      toast(j.error || 'Error al guardar', 'error');
    }
    setSaving(false);
  }

  async function remove(id: number) {
    if (!confirm('Eliminar esta seccion del reglamento?')) return;
    const res = await del(`/api/sections/regulations?id=${id}`);
    if (res.ok) { toast('Seccion eliminada'); load(); }
    else toast('Error al eliminar', 'error');
  }

  function getTypeLabel(type: string) {
    return SECTION_TYPES.find(t => t.value === type)?.label || type;
  }

  function getTypeBadgeColor(type: string) {
    switch (type) {
      case 'article': return { bg: '#dbeafe', color: '#1e40af' };
      case 'card_system': return { bg: '#fef3c7', color: '#92400e' };
      case 'commission': return { bg: '#d1fae5', color: '#065f46' };
      case 'final': return { bg: '#ede9fe', color: '#5b21b6' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Reglamento de Competencia</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Administra las secciones del reglamento oficial de FEMUNDO
          </p>
        </div>
        <button onClick={openNew} style={S.btn}>
          <i className="fas fa-plus" /> Nuevo Articulo
        </button>
      </div>

      {/* Sections list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sections.map((sec: any) => {
          const badge = getTypeBadgeColor(sec.section_type);
          return (
            <div key={sec.id} style={{ ...S.card, opacity: sec.is_active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Icon/Number */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: sec.is_active ? '#1e3a8a' : '#94a3b8',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
                }}>
                  {sec.icon && sec.icon.startsWith('fa-') ? (
                    <i className={`fas ${sec.icon}`} />
                  ) : (
                    sec.icon || sec.display_order
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                      {sec.title_es || sec.section_key}
                    </span>
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                      background: badge.bg, color: badge.color, fontWeight: 600,
                    }}>
                      {getTypeLabel(sec.section_type)}
                    </span>
                    {!sec.is_active && (
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                        background: '#fee2e2', color: '#dc2626', fontWeight: 600,
                      }}>
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Clave: {sec.section_key} &middot; Orden: {sec.display_order}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button onClick={() => openEdit(sec)} style={S.btnSm}>
                    <i className="fas fa-edit" /> Editar
                  </button>
                  <button onClick={() => remove(sec.id)} style={{ ...S.btnSm, color: '#dc2626' }}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sections.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <i className="fas fa-gavel" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
          <p>No hay secciones de reglamento. Se crearan automaticamente al recargar.</p>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Seccion' : 'Nueva Seccion'} width="850px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={S.grid}>
              <F label="Clave (section_key)" value={editing.section_key} onChange={v => setEditing({ ...editing, section_key: v })} />
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                <label style={S.label}>Tipo de seccion</label>
                <select
                  value={editing.section_type || 'article'}
                  onChange={(e: any) => setEditing({ ...editing, section_type: e.target.value })}
                  style={{ ...S.input, appearance: 'auto' as const }}
                >
                  {SECTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={S.grid}>
              <F label="Titulo (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
              <F label="Titulo (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
            </div>

            <div style={S.grid}>
              <F label="Icono (numero o clase fa-*)" value={editing.icon} onChange={v => setEditing({ ...editing, icon: v })} />
              <F label="Orden de visualizacion" value={editing.display_order} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
            </div>

            {/* Content ES - Rich Text Editor */}
            <RichTextEditor
              label="Contenido (ES)"
              value={editing.content_es || ''}
              onChange={v => setEditing({ ...editing, content_es: v })}
              minHeight="200px"
            />

            {/* Content EN - Rich Text Editor */}
            <RichTextEditor
              label="Contenido (EN)"
              value={editing.content_en || ''}
              onChange={v => setEditing({ ...editing, content_en: v })}
              minHeight="150px"
            />

            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={!!editing.is_active}
                onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })}
              /> Activo
            </label>

            <button onClick={save} disabled={saving} style={S.btn}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function F({ label, value, onChange, type }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={S.label}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  btnSm: { padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  card: { background: 'white', borderRadius: '10px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
};
