import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';
import RichTextEditor from '../ui/RichTextEditor';

export default function ArticlesManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    const res = await get(`/api/articles?page=${page}&limit=10&all=true`);
    if (res.ok) { const j = await res.json(); setArticles(j.data || []); setPagination(j.pagination || {}); }
    setLoading(false);
  }

  async function save() {
    const payload = {
      ...editing,
      hero_image_url: editing.hero_image_url || editing.image_url || null,
    };
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/articles/${editing.id}` : '/api/articles';
    const res = await method(url, payload);
    if (res.ok) { toast('Artículo guardado'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este artículo?')) return;
    const res = await del(`/api/articles/${id}`);
    if (res.ok) { toast('Artículo eliminado'); load(); }
  }

  function openNew() {
    setEditing({
      title_es: '', title_en: '', content_es: '', content_en: '', excerpt_es: '', excerpt_en: '',
      hero_image_url: '', category: '', status: 'draft', is_featured: 0,
    });
    setModal(true);
  }

  async function openEdit(id: number) {
    const res = await get(`/api/articles/${id}`);
    if (res.ok) { const j = await res.json(); setEditing(j.data); setModal(true); }
  }

  if (loading && articles.length === 0) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Artículos</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Artículo</button>
      </div>

      <div style={S.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={S.th}>Título</th><th style={S.th}>Categoría</th><th style={S.th}>Estado</th><th style={S.th}>Vistas</th><th style={S.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {a.hero_image_url && <img src={a.hero_image_url} alt="" style={{ width: 40, height: 40, borderRadius: '6px', objectFit: 'cover' }} />}
                    <div>
                      <strong>{a.title_es}</strong>
                      {a.is_featured ? <span style={{ marginLeft: '0.5rem', color: '#d97706', fontSize: '0.75rem' }}>★ Destacado</span> : null}
                    </div>
                  </div>
                </td>
                <td style={S.td}>{a.category || '-'}</td>
                <td style={S.td}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: a.status === 'published' ? '#dcfce7' : '#fef3c7',
                    color: a.status === 'published' ? '#16a34a' : '#d97706',
                  }}>{a.status === 'published' ? 'Publicado' : 'Borrador'}</span>
                </td>
                <td style={S.td}>{a.views_count || 0}</td>
                <td style={S.td}>
                  <button onClick={() => openEdit(a.id)} style={S.btnSm}>Editar</button>
                  <button onClick={() => remove(a.id)} style={{ ...S.btnSm, color: '#dc2626', marginLeft: '0.35rem' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay artículos. Crea el primero.</td></tr>}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              ...S.btnSm, background: page === i + 1 ? '#1e3a8a' : 'white',
              color: page === i + 1 ? 'white' : '#334155',
            }}>{i + 1}</button>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Artículo' : 'Nuevo Artículo'} width="900px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={S.grid}>
              <F label="Título (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
              <F label="Título (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
              <F label="Extracto (ES)" value={editing.excerpt_es} onChange={v => setEditing({ ...editing, excerpt_es: v })} multiline />
              <F label="Extracto (EN)" value={editing.excerpt_en} onChange={v => setEditing({ ...editing, excerpt_en: v })} multiline />
            </div>

            <RichTextEditor
              label="Contenido (ES)"
              value={editing.content_es || ''}
              onChange={v => setEditing({ ...editing, content_es: v })}
              minHeight="250px"
            />

            <RichTextEditor
              label="Contenido (EN)"
              value={editing.content_en || ''}
              onChange={v => setEditing({ ...editing, content_en: v })}
              minHeight="200px"
            />

            <div style={S.grid}>
              <ImageUploader
                label="Imagen del Artículo"
                value={editing.hero_image_url}
                onChange={url => setEditing({ ...editing, hero_image_url: url })}
                category="articles"
              />
              <div>
                <F label="Categoría" value={editing.category} onChange={v => setEditing({ ...editing, category: v })} />
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Estado</label>
                  <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} style={S.input}>
                    <option value="draft">Borrador</option><option value="published">Publicado</option>
                  </select>
                </div>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                  <input type="checkbox" checked={!!editing.is_featured} onChange={e => setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })} /> Destacado
                </label>
              </div>
            </div>
            <button onClick={save} style={S.btn}>Guardar Artículo</button>
          </div>
        )}
      </Modal>
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
        ...(multiline ? { minHeight: '70px' } : {}),
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
  th: { padding: '0.85rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#64748b' },
  td: { padding: '0.85rem 1rem', fontSize: '0.875rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%' },
};
