import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import ImageUploader from '../ui/ImageUploader';

export default function GalleryManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewAlbum, setViewAlbum] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/gallery');
    if (res.ok) { const j = await res.json(); setAlbums(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/gallery/${editing.id}` : '/api/gallery';
    const payload = {
      ...editing,
      cover_image_url: editing.cover_image_url || editing.cover_image || null,
    };
    const res = await method(url, payload);
    if (res.ok) { toast('Álbum guardado'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este álbum y todas sus imágenes?')) return;
    const res = await del(`/api/gallery/${id}`);
    if (res.ok) { toast('Álbum eliminado'); load(); }
  }

  function openNew() {
    setEditing({ title_es: '', title_en: '', description_es: '', description_en: '', cover_image: '', cover_image_url: '', is_active: 1, new_images: [] });
    setModal(true);
  }

  async function openEdit(id: number) {
    const res = await get(`/api/gallery/${id}`);
    if (res.ok) { const j = await res.json(); setEditing({ ...j.data, new_images: [] }); setModal(true); }
  }

  async function viewImages(id: number) {
    const res = await get(`/api/gallery/${id}`);
    if (res.ok) { const j = await res.json(); setViewAlbum(j.data); }
  }

  async function deleteImage(imageId: number) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    const res = await del(`/api/gallery/images/${imageId}`);
    if (res.ok) {
      toast('Imagen eliminada');
      // Refresh the view
      if (viewAlbum) {
        setViewAlbum({ ...viewAlbum, images: viewAlbum.images.filter((i: any) => i.id !== imageId) });
      }
      load();
    } else {
      toast('Error al eliminar imagen', 'error');
    }
  }

  async function setCoverFromImage(imageUrl: string) {
    if (!viewAlbum) return;
    const res = await put(`/api/gallery/${viewAlbum.id}`, { ...viewAlbum, cover_image_url: imageUrl, new_images: [] });
    if (res.ok) { toast('Portada actualizada'); load(); }
  }

  function addImage() {
    setEditing({ ...editing, new_images: [...(editing.new_images || []), { image_url: '', caption_es: '', caption_en: '' }] });
  }

  function updateNewImage(idx: number, field: string, val: string) {
    const imgs = [...(editing.new_images || [])]; imgs[idx] = { ...imgs[idx], [field]: val };
    setEditing({ ...editing, new_images: imgs });
  }

  function removeNewImage(idx: number) {
    const n = [...(editing.new_images || [])]; n.splice(idx, 1); setEditing({ ...editing, new_images: n });
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Galería de Fotos</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Álbum</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {albums.map(a => (
          <div key={a.id} style={S.card}>
            {(a.cover_image || a.cover_image_url) && <img src={a.cover_image || a.cover_image_url} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{a.title_es}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{a.image_count || 0} imágenes</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => viewImages(a.id)} style={S.btnSm}>Ver</button>
                <button onClick={() => openEdit(a.id)} style={S.btnSm}>Editar</button>
                <button onClick={() => remove(a.id)} style={{ ...S.btnSm, color: '#dc2626' }}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View images modal */}
      <Modal open={!!viewAlbum} onClose={() => setViewAlbum(null)} title={viewAlbum?.title_es || 'Álbum'} width="900px">
        {viewAlbum && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Haz clic en "Portada" para establecer esa imagen como portada del álbum. Usa "Eliminar" para quitar una foto.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {(viewAlbum.images || []).map((img: any) => (
                <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                  <img src={img.image_url} alt={img.caption_es || ''} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                  {img.caption_es && <p style={{ fontSize: '0.7rem', color: '#64748b', padding: '0.25rem 0.5rem' }}>{img.caption_es}</p>}
                  <div style={{ display: 'flex', gap: '0.25rem', padding: '0.35rem 0.5rem', background: '#f8fafc' }}>
                    <button onClick={() => setCoverFromImage(img.image_url)} style={{ ...S.btnSm, fontSize: '0.65rem', padding: '2px 6px' }}>
                      <i className="fas fa-image" style={{ marginRight: 3 }} />Portada
                    </button>
                    <button onClick={() => deleteImage(img.id)} style={{ ...S.btnSm, fontSize: '0.65rem', padding: '2px 6px', color: '#dc2626' }}>
                      <i className="fas fa-trash" style={{ marginRight: 3 }} />Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {(!viewAlbum.images || viewAlbum.images.length === 0) && (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay imágenes en este álbum</p>
            )}
          </div>
        )}
      </Modal>

      {/* Edit/New modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Álbum' : 'Nuevo Álbum'} width="750px">
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={S.grid}>
              <F label="Título (ES)" value={editing.title_es} onChange={v => setEditing({ ...editing, title_es: v })} />
              <F label="Título (EN)" value={editing.title_en} onChange={v => setEditing({ ...editing, title_en: v })} />
              <F label="Descripción (ES)" value={editing.description_es} onChange={v => setEditing({ ...editing, description_es: v })} multiline />
              <F label="Descripción (EN)" value={editing.description_en} onChange={v => setEditing({ ...editing, description_en: v })} multiline />
            </div>
            <ImageUploader label="Imagen de Portada" value={editing.cover_image_url || editing.cover_image} onChange={url => setEditing({ ...editing, cover_image_url: url, cover_image: url })} category="gallery" />
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} /> Activo
            </label>

            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              Agregar Nuevas Imágenes
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-0.5rem' }}>
              Sube múltiples imágenes de una vez seleccionándolas desde tu dispositivo.
            </p>

            {/* Bulk file upload */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}
              onClick={() => document.getElementById('bulkFileInput')?.click()}>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Haz clic para seleccionar múltiples imágenes</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG, WebP, GIF - Máximo 10MB por imagen</p>
              <input
                id="bulkFileInput"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e: any) => {
                  const files = Array.from(e.target.files || []) as File[];
                  if (files.length === 0) return;
                  for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('category', 'gallery');
                    try {
                      const token = localStorage.getItem('femundo-token');
                      const res = await fetch('/api/upload', {
                        method: 'POST', body: formData,
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                      });
                      if (res.ok) {
                        const j = await res.json();
                        const url = j.file_url || j.url || j.data?.file_url || j.data?.filePath || '';
                        if (url) {
                          setEditing((prev: any) => ({
                            ...prev,
                            new_images: [...(prev.new_images || []), { image_url: url, caption_es: '', caption_en: '' }],
                          }));
                        }
                      }
                    } catch (err) { console.error('Upload error:', err); }
                  }
                  e.target.value = '';
                  toast(`${files.length} imagen(es) subida(s)`);
                }}
              />
            </div>

            {/* Show uploaded images */}
            {(editing.new_images || []).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                {(editing.new_images || []).map((img: any, i: number) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                    {img.image_url ? (
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '120px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-spinner fa-spin" style={{ color: '#94a3b8' }} />
                      </div>
                    )}
                    <button onClick={() => removeNewImage(i)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Also keep the one-by-one option */}
            <button onClick={addImage} style={{ ...S.btnSm, alignSelf: 'flex-start' }}>
              <i className="fas fa-plus" style={{ marginRight: '0.35rem' }} /> Agregar Imagen Individual
            </button>
            <button onClick={save} style={S.btn}>Guardar Álbum</button>
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
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <Tag value={value || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
        fontSize: '0.85rem', outline: 'none', resize: 'vertical' as const,
        ...(multiline ? { minHeight: '60px' } : {}),
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
};
