import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await query(
    `SELECT fa.*, a.slug, a.title_es as article_title_es, a.title_en as article_title_en,
     a.excerpt_es, a.excerpt_en, a.hero_image_url as article_image
     FROM featured_articles fa
     JOIN articles a ON fa.article_id = a.id
     WHERE fa.is_active = TRUE AND a.status = 'published'
     ORDER BY fa.display_order ASC`
  );
  return jsonResponse(data);
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body || !body.article_id) return errorResponse('article_id es requerido', 400);

  const result = await execute(
    `INSERT INTO featured_articles (article_id, display_order, custom_title_es, custom_title_en,
     custom_image_url, highlight_color, is_active) VALUES (?,?,?,?,?,?,?)`,
    [body.article_id, body.display_order || 0, body.custom_title_es, body.custom_title_en,
     body.custom_image_url, body.highlight_color, body.is_active ?? true]
  );

  await logActivity(user.id, 'create', 'featured_articles', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Artículo destacado agregado', id: result.insertId }, 201);
};
