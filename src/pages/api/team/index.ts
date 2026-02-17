import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const categories = await query('SELECT * FROM team_categories ORDER BY display_order ASC');
  const members = await query('SELECT * FROM team_members ORDER BY display_order ASC');

  // Agrupar miembros por categoría y añadir alias 'name'
  const result = (categories as any[]).map(cat => ({
    ...cat,
    members: (members as any[])
      .filter(m => m.category_id === cat.id)
      .map(m => ({ ...m, name: m.full_name })),
  }));

  return jsonResponse({ data: result });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const fullName = body.full_name || body.name || 'Sin nombre';

  const result = await execute(
    `INSERT INTO team_members (category_id, full_name, position_es, position_en, country, country_flag,
     photo_url, bio_es, bio_en, email, phone, display_order, is_active)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [body.category_id || null, fullName, body.position_es || null, body.position_en || null, body.country || null,
     body.country_flag || null, body.photo_url || null, body.bio_es || null, body.bio_en || null,
     body.email || null, body.phone || null, body.display_order || body.sort_order || 0,
     body.is_active ? 1 : 1]
  );

  await logActivity(user.id, 'create', 'team_members', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Miembro creado', id: result.insertId }, 201);
};
