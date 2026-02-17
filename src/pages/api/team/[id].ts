import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const member = await queryOne('SELECT * FROM team_members WHERE id = ?', [params.id]);
  if (!member) return errorResponse('Miembro no encontrado', 404);
  (member as any).name = (member as any).full_name;
  return jsonResponse({ data: member });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE team_members SET category_id=?, full_name=?, position_es=?, position_en=?, country=?,
     country_flag=?, photo_url=?, bio_es=?, bio_en=?, email=?, phone=?, display_order=?, is_active=? WHERE id=?`,
    [body.category_id || null, body.full_name || body.name || null, body.position_es || null, body.position_en || null, body.country || null,
     body.country_flag || null, body.photo_url || null, body.bio_es || null, body.bio_en || null, body.email || null, body.phone || null,
     body.display_order || 0, body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, params.id]
  );

  await logActivity(user.id, 'update', 'team_members', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Miembro actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM team_members WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'team_members', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Miembro eliminado' });
};
