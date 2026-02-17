import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const federation = await queryOne('SELECT * FROM federations WHERE id = ?', [params.id]);
  if (!federation) return errorResponse('Federación no encontrada', 404);
  return jsonResponse({ data: federation });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE federations SET country=?, country_flag=?, name_es=?, name_en=?, president=?,
     website_url=?, facebook_url=?, instagram_url=?, logo_url=?, description_es=?, description_en=?,
     is_active=?, display_order=? WHERE id=?`,
    [body.country || '', body.country_flag || null, body.name_es || '', body.name_en || null,
     body.president || null, body.website_url || null, body.facebook_url || null, body.instagram_url || null,
     body.logo_url || null, body.description_es || null, body.description_en || null,
     body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, body.display_order || 0, params.id]
  );

  await logActivity(user.id, 'update', 'federations', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Federación actualizada' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM federations WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'federations', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Federación eliminada' });
};
