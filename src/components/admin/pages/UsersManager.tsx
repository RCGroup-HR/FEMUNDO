import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../ui/Toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../ui/Modal';
import { ADMIN_MODULES, PERMISSION_PROFILES, resolveUserModules, detectProfile } from '../../../lib/permissions';

export default function UsersManager() {
  const { get, post, put, del } = useApi();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('personalizado');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await get('/api/users');
    if (res.ok) { const j = await res.json(); setUsers(j.data || []); }
    setLoading(false);
  }

  async function save() {
    const method = editing.id ? put : post;
    const url = editing.id ? `/api/users/${editing.id}` : '/api/users';
    const body: any = { ...editing };
    if (editing.id && !body.password) delete body.password;
    const res = await method(url, body);
    if (res.ok) { toast('Usuario guardado'); setModal(false); load(); }
    else { const j = await res.json(); toast(j.error || 'Error', 'error'); }
  }

  async function remove(id: number) {
    if (id === currentUser?.id) { toast('No puedes eliminarte a ti mismo', 'error'); return; }
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await del(`/api/users/${id}`);
    if (res.ok) { toast('Usuario eliminado'); load(); }
  }

  function openNew() {
    const defaultModules = PERMISSION_PROFILES.editor_contenido.modules;
    setEditing({
      name: '', username: '', email: '', password: '', role: 'editor', is_active: 1,
      allowed_modules: [...defaultModules],
    });
    setSelectedProfile('editor_contenido');
    setModal(true);
  }

  function openEdit(u: any) {
    const modules = u.allowed_modules || resolveUserModules(u.role, null);
    setEditing({
      ...u,
      name: u.name || u.full_name,
      password: '',
      allowed_modules: [...modules],
    });
    setSelectedProfile(detectProfile(modules));
    setModal(true);
  }

  function handleProfileChange(profileKey: string) {
    setSelectedProfile(profileKey);
    if (profileKey !== 'personalizado' && PERMISSION_PROFILES[profileKey]) {
      setEditing((prev: any) => ({
        ...prev,
        allowed_modules: [...PERMISSION_PROFILES[profileKey].modules],
      }));
    }
  }

  function handleModuleToggle(moduleKey: string) {
    setEditing((prev: any) => {
      const current = prev.allowed_modules || [];
      let updated: string[];
      if (current.includes(moduleKey)) {
        // No permitir quitar dashboard
        if (moduleKey === 'dashboard') return prev;
        updated = current.filter((k: string) => k !== moduleKey);
      } else {
        updated = [...current, moduleKey];
      }
      // Detectar si coincide con un perfil
      setTimeout(() => setSelectedProfile(detectProfile(updated)), 0);
      return { ...prev, allowed_modules: updated };
    });
  }

  function toggleAll(selectAll: boolean) {
    if (selectAll) {
      const allKeys = ADMIN_MODULES.map(m => m.key);
      setEditing((prev: any) => ({ ...prev, allowed_modules: allKeys }));
      setSelectedProfile(detectProfile(allKeys));
    } else {
      setEditing((prev: any) => ({ ...prev, allowed_modules: ['dashboard'] }));
      setSelectedProfile(detectProfile(['dashboard']));
    }
  }

  if (loading) return <p>Cargando...</p>;

  const roleColors: Record<string, string> = {
    super_admin: '#dc2626', admin: '#d97706', editor: '#2563eb', viewer: '#64748b',
  };

  const isSuperAdmin = editing?.role === 'super_admin';

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Usuarios</h1>
        <button onClick={openNew} style={S.btn}><i className="fas fa-plus" /> Nuevo Usuario</button>
      </div>
      <div style={S.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={S.th}>Nombre</th><th style={S.th}>Usuario</th><th style={S.th}>Email</th><th style={S.th}>Rol</th><th style={S.th}>Perfil</th><th style={S.th}>Estado</th><th style={S.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const modules = u.allowed_modules || resolveUserModules(u.role, null);
              const profile = u.role === 'super_admin' ? 'admin_completo' : detectProfile(modules);
              const profileLabel = profile === 'personalizado' ? 'Personalizado' : (PERMISSION_PROFILES[profile]?.label || '—');
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={S.td}><strong>{u.name || u.full_name}</strong></td>
                  <td style={S.td}><span style={{ color: '#64748b', fontSize: '0.82rem' }}>@{u.username || '—'}</span></td>
                  <td style={S.td}>{u.email}</td>
                  <td style={S.td}>
                    <span style={{
                      padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      color: roleColors[u.role] || '#64748b', background: `${roleColors[u.role] || '#64748b'}15`,
                    }}>{u.role}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{profileLabel}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ color: u.is_active ? '#16a34a' : '#dc2626', fontSize: '0.85rem' }}>
                      {u.is_active ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button onClick={() => openEdit(u)} style={S.btnSm}>Editar</button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => remove(u.id)} style={{ ...S.btnSm, color: '#dc2626', marginLeft: '0.35rem' }}>Eliminar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Editar Usuario' : 'Nuevo Usuario'}>
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Datos básicos */}
            <F label="Nombre Completo" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <F label="Nombre de Usuario" value={editing.username} onChange={v => setEditing({ ...editing, username: v.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} placeholder="ej: ronnie.hdez" />
            <F label="Email" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} type="email" />
            <F label={editing.id ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'} value={editing.password} onChange={v => setEditing({ ...editing, password: v })} type="password" />

            {/* Rol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={S.fieldLabel}>Rol</label>
              <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} style={S.input}>
                <option value="viewer">Viewer</option><option value="editor">Editor</option>
                <option value="admin">Admin</option><option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Activo */}
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} /> Activo
            </label>

            {/* Separador */}
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

            {/* Permisos de módulos */}
            <div>
              <label style={{ ...S.fieldLabel, marginBottom: '0.5rem', display: 'block' }}>
                <i className="fas fa-shield-halved" style={{ marginRight: '0.35rem' }} />
                Permisos de Módulos
              </label>

              {isSuperAdmin ? (
                <div style={{
                  background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px',
                  padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#92400e',
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '0.35rem' }} />
                  Los Super Admin siempre tienen acceso a todos los módulos.
                </div>
              ) : (
                <>
                  {/* Selector de perfil predefinido */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Perfil predefinido</label>
                    <select
                      value={selectedProfile}
                      onChange={e => handleProfileChange(e.target.value)}
                      style={{ ...S.input, width: '100%' }}
                    >
                      {Object.entries(PERMISSION_PROFILES).map(([key, profile]) => (
                        <option key={key} value={key}>{profile.label} — {profile.description}</option>
                      ))}
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  {/* Botones rápidos */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <button type="button" onClick={() => toggleAll(true)} style={S.btnXs}>
                      <i className="fas fa-check-double" /> Seleccionar todos
                    </button>
                    <button type="button" onClick={() => toggleAll(false)} style={S.btnXs}>
                      <i className="fas fa-times" /> Deseleccionar todos
                    </button>
                  </div>

                  {/* Grid de checkboxes de módulos */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '0.35rem',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    background: '#f8fafc',
                  }}>
                    {ADMIN_MODULES.map(mod => {
                      const checked = editing.allowed_modules?.includes(mod.key) || false;
                      const isDashboard = mod.key === 'dashboard';
                      return (
                        <label
                          key={mod.key}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.35rem 0.5rem', borderRadius: '6px',
                            background: checked ? '#eff6ff' : 'transparent',
                            border: checked ? '1px solid #bfdbfe' : '1px solid transparent',
                            cursor: isDashboard ? 'not-allowed' : 'pointer',
                            opacity: isDashboard ? 0.7 : 1,
                            fontSize: '0.8rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isDashboard}
                            onChange={() => handleModuleToggle(mod.key)}
                            style={{ cursor: isDashboard ? 'not-allowed' : 'pointer' }}
                          />
                          <i className={`fas ${mod.icon}`} style={{ color: checked ? '#1e3a8a' : '#94a3b8', fontSize: '0.75rem', width: '16px', textAlign: 'center' }} />
                          <span style={{ color: checked ? '#1e293b' : '#64748b', fontWeight: checked ? 500 : 400 }}>
                            {mod.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.35rem 0 0' }}>
                    Dashboard siempre está activo. Los módulos seleccionados serán visibles en el sidebar y accesibles para este usuario.
                  </p>
                </>
              )}
            </div>

            <button onClick={save} style={S.btn}>Guardar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function F({ label, value, onChange, type, placeholder }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type || 'text'} value={value || ''} placeholder={placeholder || ''} onChange={(e: any) => onChange(e.target.value)} style={{
        padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none',
      }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
  btn: { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSm: { padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnXs: { padding: '0.3rem 0.65rem', borderRadius: '5px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.72rem', color: '#475569' },
  table: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { padding: '0.85rem 1rem', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#64748b' },
  td: { padding: '0.85rem 1rem', fontSize: '0.875rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' },
  fieldLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
};
