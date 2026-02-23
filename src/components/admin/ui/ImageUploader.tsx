import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  category?: string;
}

export default function ImageUploader({ label, value, onChange, category = 'general' }: ImageUploaderProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast('La imagen no debe superar 10MB', 'error');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast('Formato no permitido. Usa JPG, PNG, WebP, GIF o SVG', 'error');
      return;
    }

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Subir al servidor
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.file_url || data.data?.file_url;
        if (uploadedUrl) {
          setPreview(uploadedUrl);
          onChange(uploadedUrl);
          toast('Imagen subida', 'success');
        }
      } else {
        const err = await res.json();
        toast(err.error || 'Error al subir imagen', 'error');
        setPreview(value || '');
      }
    } catch {
      toast('Error de conexión al subir', 'error');
      setPreview(value || '');
    }
    setUploading(false);

    // Resetear input
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleRemove() {
    setPreview('');
    onChange('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>

      {preview ? (
        <div style={{ position: 'relative', display: 'block', maxWidth: '300px', width: '100%' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '160px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: '#f8fafc',
              display: 'block',
            }}
          />
          <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={S.imgBtn}
              title="Cambiar imagen"
            >
              <i className="fas fa-pen" />
            </button>
            <button
              onClick={handleRemove}
              style={{ ...S.imgBtn, background: '#dc2626' }}
              title="Eliminar imagen"
            >
              <i className="fas fa-times" />
            </button>
          </div>
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', color: 'white', fontSize: '0.85rem',
            }}>
              <div style={{
                width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', marginRight: '0.5rem',
              }} />
              Subiendo...
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            width: '100%',
            maxWidth: '300px',
            display: 'block',
            height: '120px',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            color: '#94a3b8',
            fontSize: '0.85rem',
            transition: 'border-color 0.2s, background 0.2s',
            background: '#f8fafc',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#2563eb';
            (e.currentTarget as HTMLElement).style.background = '#eff6ff';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
            (e.currentTarget as HTMLElement).style.background = '#f8fafc';
          }}
        >
          {uploading ? (
            <>
              <div style={{
                width: 24, height: 24, border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', marginBottom: '0.5rem',
              }} />
              Subiendo...
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }} />
              <span>Click para subir imagen</span>
              <span style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>JPG, PNG, WebP (máx. 10MB)</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  imgBtn: {
    width: 28, height: 28, borderRadius: '6px', border: 'none',
    background: '#1e3a8a', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
};
