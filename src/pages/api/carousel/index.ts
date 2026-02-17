import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  let data;
  if (type) {
    data = await query(
      'SELECT * FROM carousel_slides WHERE carousel_type = ? ORDER BY display_order ASC',
      [type]
    );
  } else {
    data = await query('SELECT * FROM carousel_slides ORDER BY display_order ASC');
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

  const order = body.display_order || body.sort_order || 0;

  const result = await execute(
    `INSERT INTO carousel_slides (title_es, title_en, description_es, description_en, image_url, link_url, display_order, is_active, carousel_type)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [body.title_es || null, body.title_en || null, body.description_es || null, body.description_en || null,
     body.image_url || null, body.link_url || null, order, body.is_active ? 1 : 0, body.carousel_type || 'hero']
  );

  await logActivity(user.id, 'create', 'carousel_slides', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Slide creado', id: result.insertId }, 201);
};
