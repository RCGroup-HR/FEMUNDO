import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.current || !form.newPwd || !form.confirm) {
      setError('Todos los campos son requeridos'); return;
    }
    if (form.newPwd !== form.confirm) {
      setError('La nueva contraseña y la confirmación no coinciden'); return;
    }
    if (form.newPwd.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres'); return;
    }
    if (!/[A-Za-z]/.test(form.newPwd)) {
      setError('La nueva contraseña debe contener al menos una letra'); return;
    }
    if (!/[0-9]/.test(form.newPwd)) {
      setError('La nueva contraseña debe contener al menos un número'); return;
    }
    if (form.newPwd === form.current) {
      setError('La nueva contraseña debe ser diferente a la actual'); return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
      } else {
        setSuccess('¡Contraseña actualizada correctamente!');
        setForm({ current: '', newPwd: '', confirm: '' });
        setTimeout(() => onClose(), 1500);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 600, fontSize: '0.8rem',
    color: '#374151', marginBottom: '0.35rem',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '2rem',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fas fa-key" style={{ color: 'white', fontSize: '1rem' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                Cambiar contraseña
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Mínimo 8 caracteres con letras y números
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1,
          }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Contraseña actual</label>
            <input
              type="password"
              value={form.current}
              onChange={e => setForm({ ...form, current: e.target.value })}
              style={inputStyle}
              placeholder="Tu contraseña actual"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Nueva contraseña</label>
            <input
              type="password"
              value={form.newPwd}
              onChange={e => setForm({ ...form, newPwd: e.target.value })}
              style={inputStyle}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              style={inputStyle}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '0.65rem 0.85rem',
              color: '#dc2626', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '8px', padding: '0.65rem 0.85rem',
              color: '#16a34a', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              <i className="fas fa-check-circle" /> {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.65rem', borderRadius: '8px',
              border: '1.5px solid #e2e8f0', background: 'white',
              color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '0.65rem', borderRadius: '8px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              border: 'none', color: 'white', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
            }}>
              {loading ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
