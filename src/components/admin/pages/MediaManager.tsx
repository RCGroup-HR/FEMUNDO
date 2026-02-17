import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import ImageUploader from '../ui/ImageUploader';

export default function MediaManager() {
  const { get, del } = useApi();
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/media');
    if (res.ok) {
      const j = await res.json();
      // API returns paginated: { data: { data: [...], pagination: {...} } }
      const raw = j.data;
      setFiles(Array.isArray(raw) ? raw : (raw?.data || []));
    }
    setLoading(false);
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar este archivo?')) return;
    const res = await del(`/api/media?id=${id}`);
    if (res.ok) { toast('Archivo eliminado'); load(); }
    else toast('Error al eliminar', 'error');
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast('URL copiada', 'info');
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function handleUploadComplete(url: string) {
    toast('Archivo subido exitosamente');
    setShowUpload(false);
    load();
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Archivos / Media</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            Biblioteca de archivos multimedia. Sube imágenes y archivos para usarlos en cualquier sección del sitio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{files.length} archivos</span>
          <button onClick={() => setShowUpload(!showUpload)} style={S.btn}>
            <i className="fas fa-upload" style={{ marginRight: '0.35rem' }} />
            Subir Archivo
          </button>
        </div>
      </div>

      {showUpload && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <ImageUploader
            label="Seleccionar archivo para subir"
            value=""
            onChange={handleUploadComplete}
            category="general"
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Formatos permitidos: JPG, PNG, WebP, GIF, SVG, PDF, Word, Excel. Máximo 10MB.
          </p>
        </div>
      )}

      <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', color: '#1e40af', border: '1px solid #bfdbfe' }}>
        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }} />
        Cada archivo tiene una URL que puedes copiar y pegar donde necesites (artículos, galerías, eventos, etc.).
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {files.map(f => (
          <div key={f.id} style={S.card}>
            {f.mime_type?.startsWith('image/') ? (
              <img src={f.thumbnail_url || f.file_url || f.file_path} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
            ) : (
              <div style={{ width: '100%', height: '120px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
                <i className={`fas ${f.mime_type?.includes('pdf') ? 'fa-file-pdf' : f.mime_type?.includes('word') ? 'fa-file-word' : f.mime_type?.includes('excel') || f.mime_type?.includes('sheet') ? 'fa-file-excel' : 'fa-file'}`} style={{ fontSize: '2rem', color: '#94a3b8' }} />
              </div>
            )}
            <div style={{ padding: '0.65rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.filename || f.original_name}>{f.filename || f.original_name || 'Sin nombre'}</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatSize(f.file_size || 0)}</p>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                <button onClick={() => copyUrl(f.file_url || f.file_path)} style={S.btnSm} title="Copiar URL">
                  <i className="fas fa-copy" />
                </button>
                <button onClick={() => window.open(f.file_url || f.file_path, '_blank')} style={S.btnSm} title="Abrir">
                  <i className="fas fa-external-link-alt" />
                </button>
                <button onClick={() => remove(f.id)} style={{ ...S.btnSm, color: '#dc2626' }} title="Eliminar">
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block' }} />
            <p>No hay archivos subidos</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Usa el botón "Subir Archivo" para agregar tu primer archivo</p>
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  card: { background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  btnSm: { padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' },
};
