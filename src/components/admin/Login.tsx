import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(identifier, password);
    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src="/icono.png" alt="FEMUNDO" width="70" height="70" />
          <h1 style={styles.title}>FEMUNDO</h1>
          <p style={styles.subtitle}>Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>Email o Nombre de Usuario</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              style={styles.input}
              placeholder="admin@femundo.org o nombre.usuario"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p style={styles.footer}>
          <a href="/" style={styles.link}>← Volver al sitio</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #ff8c00 100%)',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  logoWrap: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1e3a8a',
    margin: '0.5rem 0 0.25rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
  },
};
