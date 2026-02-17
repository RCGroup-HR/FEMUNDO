import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await query('SELECT * FROM statistics WHERE is_active = TRUE ORDER BY display_order ASC');
  return jsonResponse({ data });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const rawBody = await parseBody<any>(request);
  // Accept both bare array and { statistics: [...] } format
  const body = Array.isArray(rawBody) ? rawBody : (rawBody?.statistics && Array.isArray(rawBody.statistics) ? rawBody.statistics : null);
  if (!body) return errorResponse('Se espera un array de estadísticas', 400);

  for (const stat of body) {
    if (stat.id) {
      await execute(
        `UPDATE statistics SET label_es=?, label_en=?, value=?, suffix=?, icon=?, display_order=?, is_active=? WHERE id=?`,
        [stat.label_es || null, stat.label_en || null, stat.value || null, stat.suffix || '', stat.icon || null, stat.display_order || 0, stat.is_active !== undefined ? (stat.is_active ? 1 : 0) : 1, stat.id]
      );
    } else {
      await execute(
        `INSERT INTO statistics (label_es, label_en, value, suffix, icon, display_order, is_active) VALUES (?,?,?,?,?,?,?)`,
        [stat.label_es || null, stat.label_en || null, stat.value || null, stat.suffix || '', stat.icon || null, stat.display_order || 0, stat.is_active !== undefined ? (stat.is_active ? 1 : 0) : 1]
      );
    }
  }

  await logActivity(user.id, 'update', 'statistics', null, null, getClientIP(request));
  return jsonResponse({ message: 'Estadísticas actualizadas' });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('ID requerido', 400);

  await execute('DELETE FROM statistics WHERE id = ?', [id]);
  await logActivity(user.id, 'delete', 'statistics', parseInt(id), null, getClientIP(request));
  return jsonResponse({ message: 'Estadística eliminada' });
};
