import type { APIRoute } from 'astro';
import { query, queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const all = url.searchParams.get('all');

  let data;
  if (all === '1') {
    // Admin mode: return ALL announcements regardless of status/dates
    data = await query('SELECT * FROM announcement ORDER BY display_order ASC, id DESC');
  } else {
    // Public mode: only active + within date range
    data = await query(
      `SELECT * FROM announcement WHERE is_active = TRUE
       AND (start_date IS NULL OR start_date <= CURDATE())
       AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY display_order ASC`
    );
  }
  return jsonResponse({ data });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const result = await execute(
    `INSERT INTO announcement (title_es, title_en, image_url, link_url, is_active, display_order, start_date, end_date)
     VALUES (?,?,?,?,?,?,?,?)`,
    [body.title_es || null, body.title_en || null, body.image_url || null, body.link_url || null,
     body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, body.display_order || 0, body.start_date || null, body.end_date || null]
  );

  await logActivity(user.id, 'create', 'announcement', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Anuncio creado', id: result.insertId }, 201);
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body || !body.id) return errorResponse('ID requerido', 400);

  await execute(
    `UPDATE announcement SET title_es=?, title_en=?, image_url=?, link_url=?,
     is_active=?, display_order=?, start_date=?, end_date=? WHERE id=?`,
    [body.title_es || null, body.title_en || null, body.image_url || null, body.link_url || null,
     body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, body.display_order || 0, body.start_date || null,
     body.end_date || null, body.id]
  );

  await logActivity(user.id, 'update', 'announcement', body.id, null, getClientIP(request));
  return jsonResponse({ message: 'Anuncio actualizado' });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('ID requerido', 400);

  await execute('DELETE FROM announcement WHERE id = ?', [id]);
  await logActivity(user.id, 'delete', 'announcement', parseInt(id), null, getClientIP(request));
  return jsonResponse({ message: 'Anuncio eliminado' });
};
