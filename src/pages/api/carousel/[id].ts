import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const data = await queryOne('SELECT * FROM carousel_slides WHERE id = ?', [params.id]);
  if (!data) return errorResponse('Slide no encontrado', 404);
  return jsonResponse({ data });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE carousel_slides SET title_es=?, title_en=?, description_es=?, description_en=?,
     image_url=?, link_url=?, display_order=?, is_active=?, carousel_type=? WHERE id=?`,
    [body.title_es || null, body.title_en || null, body.description_es || null, body.description_en || null,
     body.image_url || null, body.link_url || null, body.display_order || 0, body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
     body.carousel_type || 'hero', params.id]
  );

  await logActivity(user.id, 'update', 'carousel_slides', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Slide actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM carousel_slides WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'carousel_slides', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Slide eliminado' });
};
