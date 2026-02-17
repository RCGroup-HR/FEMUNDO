import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, hashPassword, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody, isValidEmail } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const rows = await query(
    'SELECT id, email, username, full_name, role, avatar_url, is_active, last_login, created_at, allowed_modules FROM users ORDER BY created_at DESC'
  );
  // Parsear allowed_modules de cada usuario
  const data = rows.map((u: any) => {
    let allowed_modules = null;
    try {
      allowed_modules = u.allowed_modules
        ? (typeof u.allowed_modules === 'string' ? JSON.parse(u.allowed_modules) : u.allowed_modules)
        : null;
    } catch { allowed_modules = null; }
    return { ...u, allowed_modules };
  });
  return jsonResponse({ data });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const { email, username, password, full_name, name, role, allowed_modules } = body;
  const finalName = full_name || name;

  if (!email || !password || !finalName) {
    return errorResponse('Email, password y nombre son requeridos', 400);
  }

  if (!isValidEmail(email)) {
    return errorResponse('Email inválido', 400);
  }

  // Validación de complejidad de contraseña
  if (password.length < 12) {
    return errorResponse('El password debe tener al menos 12 caracteres', 400);
  }
  if (!/[A-Z]/.test(password)) {
    return errorResponse('El password debe contener al menos una letra mayúscula', 400);
  }
  if (!/[a-z]/.test(password)) {
    return errorResponse('El password debe contener al menos una letra minúscula', 400);
  }
  if (!/[0-9]/.test(password)) {
    return errorResponse('El password debe contener al menos un número', 400);
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return errorResponse('El password debe contener al menos un carácter especial (!@#$%^&*...)', 400);
  }

  if (username && !/^[a-z0-9._-]{3,50}$/.test(username)) {
    return errorResponse('El nombre de usuario debe tener entre 3 y 50 caracteres (letras minúsculas, números, puntos, guiones)', 400);
  }

  // Solo super_admin puede crear otros super_admin
  if (role === 'super_admin' && user.role !== 'super_admin') {
    return errorResponse('Solo super_admin puede crear usuarios super_admin', 403);
  }

  // Verificar que no exista email
  const existingEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existingEmail.length > 0) {
    return errorResponse('Ya existe un usuario con ese email', 409);
  }

  // Verificar que no exista username
  if (username) {
    const existingUsername = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return errorResponse('Ya existe un usuario con ese nombre de usuario', 409);
    }
  }

  const passwordHash = await hashPassword(password);

  // Preparar allowed_modules como JSON
  const modulesJson = allowed_modules && Array.isArray(allowed_modules) && allowed_modules.length > 0
    ? JSON.stringify(allowed_modules)
    : null;

  const result = await execute(
    'INSERT INTO users (email, username, password_hash, full_name, role, is_active, allowed_modules) VALUES (?,?,?,?,?,?,?)',
    [email, username || null, passwordHash, finalName, role || 'editor', 1, modulesJson]
  );

  await logActivity(user.id, 'create', 'users', result.insertId, { email, username, role, allowed_modules }, getClientIP(request));

  return jsonResponse({
    message: 'Usuario creado',
    user: { id: result.insertId, email, username, full_name: finalName, role: role || 'editor', allowed_modules: allowed_modules || null },
  }, 201);
};
