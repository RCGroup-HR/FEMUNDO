import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const location = url.searchParams.get('location');
  const all = url.searchParams.get('all');

  let sql = 'SELECT * FROM navigation_items';
  const params: any[] = [];
  const conditions: string[] = [];

  // Only filter active for public requests (not admin)
  if (!all) {
    conditions.push('is_active = TRUE');
  }

  if (location) {
    conditions.push('(location = ? OR location = ?)');
    params.push(location, 'both');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY display_order ASC';
  const data = await query(sql, params);
  return jsonResponse({ data });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const rawBody = await parseBody<any>(request);
  // Accept both array directly or { items: [...] } format
  const body = Array.isArray(rawBody) ? rawBody : (rawBody?.items && Array.isArray(rawBody.items) ? rawBody.items : null);
  if (!body) return errorResponse('Se espera un array de items de navegación', 400);

  for (const item of body) {
    if (item.id) {
      await execute(
        `UPDATE navigation_items SET label_es=?, label_en=?, url=?, target=?, icon=?,
         parent_id=?, display_order=?, is_active=?, location=? WHERE id=?`,
        [item.label_es || null, item.label_en || null, item.url || null, item.target || '_self', item.icon || null,
         item.parent_id || null, item.display_order || 0, item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1, item.location || 'header', item.id]
      );
    } else {
      await execute(
        `INSERT INTO navigation_items (label_es, label_en, url, target, icon, parent_id, display_order, is_active, location)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [item.label_es || null, item.label_en || null, item.url || null, item.target || '_self', item.icon || null,
         item.parent_id || null, item.display_order || 0, item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1, item.location || 'header']
      );
    }
  }

  await logActivity(user.id, 'update', 'navigation_items', null, null, getClientIP(request));
  return jsonResponse({ message: 'Navegación actualizada' });
};
