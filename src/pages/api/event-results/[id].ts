import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const result = await queryOne('SELECT * FROM event_results WHERE id = ?', [params.id]);
  if (!result) return errorResponse('Resultado no encontrado', 404);
  return jsonResponse({ data: result });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE event_results SET event_id=?, category_es=?, category_en=?, position=?, player_name=?,
     team_name=?, country=?, country_flag=?, prize=?, notes=?, display_order=? WHERE id=?`,
    [body.event_id, body.category_es || null, body.category_en || null, body.position || null,
     body.player_name || null, body.team_name || null, body.country || null, body.country_flag || null,
     body.prize || null, body.notes || null, body.display_order || 0, params.id]
  );

  await logActivity(user.id, 'update', 'event_results', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Resultado actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM event_results WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'event_results', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Resultado eliminado' });
};
