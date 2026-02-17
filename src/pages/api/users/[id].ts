import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const row = await queryOne<any>(
    'SELECT id, email, username, full_name, role, avatar_url, is_active, last_login, created_at, allowed_modules FROM users WHERE id = ?',
    [params.id]
  );
  if (!row) return errorResponse('Usuario no encontrado', 404);
  // Parsear allowed_modules
  let allowed_modules = null;
  try {
    allowed_modules = row.allowed_modules
      ? (typeof row.allowed_modules === 'string' ? JSON.parse(row.allowed_modules) : row.allowed_modules)
      : null;
  } catch { allowed_modules = null; }
  return jsonResponse({ data: { ...row, allowed_modules } });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  // Solo super_admin puede cambiar roles a super_admin
  if (body.role === 'super_admin' && user.role !== 'super_admin') {
    return errorResponse('Solo super_admin puede asignar rol super_admin', 403);
  }

  // No permitir que un admin modifique a un super_admin
  const target = await queryOne<any>('SELECT role FROM users WHERE id = ?', [params.id]);
  if (target?.role === 'super_admin' && user.role !== 'super_admin') {
    return errorResponse('No puede modificar un super_admin', 403);
  }

  // Verificar username único si se cambió
  if (body.username) {
    const { query } = await import('../../../db/connection');
    const existingUsername = await query('SELECT id FROM users WHERE username = ? AND id != ?', [body.username, params.id]);
    if (existingUsername.length > 0) {
      return errorResponse('Ya existe un usuario con ese nombre de usuario', 409);
    }
  }

  // Preparar allowed_modules como JSON
  const modulesJson = body.allowed_modules && Array.isArray(body.allowed_modules) && body.allowed_modules.length > 0
    ? JSON.stringify(body.allowed_modules)
    : null;

  await execute(
    'UPDATE users SET full_name=?, username=?, role=?, avatar_url=?, is_active=?, allowed_modules=? WHERE id=?',
    [body.full_name || body.name || null, body.username || null, body.role || 'editor', body.avatar_url || null, body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, modulesJson, params.id]
  );

  await logActivity(user.id, 'update', 'users', parseInt(params.id!), { role: body.role, allowed_modules: body.allowed_modules }, getClientIP(request));
  return jsonResponse({ message: 'Usuario actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin');
  if (roleError) return errorResponse(roleError, 403);

  // No permitir auto-eliminación
  if (parseInt(params.id!) === user.id) {
    return errorResponse('No puede eliminarse a sí mismo', 400);
  }

  // Soft delete - desactivar en lugar de eliminar
  await execute('UPDATE users SET is_active = FALSE WHERE id = ?', [params.id]);
  await logActivity(user.id, 'deactivate', 'users', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Usuario desactivado' });
};
