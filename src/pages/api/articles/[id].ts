import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const article = await queryOne('SELECT * FROM articles WHERE id = ? OR slug = ?', [params.id, params.id]);
  if (!article) return errorResponse('Artículo no encontrado', 404);

  // Incrementar vistas
  await execute('UPDATE articles SET views_count = views_count + 1 WHERE id = ?', [(article as any).id]);

  return jsonResponse({ data: article });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  try {
    const imageUrl = body.hero_image_url || body.image_url || null;
    const pubDate = body.pub_date ? String(body.pub_date).slice(0, 10) : null;

    await execute(
      `UPDATE articles SET title_es=?, title_en=?, excerpt_es=?, excerpt_en=?, content_es=?, content_en=?,
       hero_image_url=?, category=?, tags=?, status=?, is_featured=?, featured_order=?, pub_date=? WHERE id=?`,
      [body.title_es || null, body.title_en || null, body.excerpt_es || null, body.excerpt_en || null,
       body.content_es || null, body.content_en || null,
       imageUrl, body.category || null, body.tags ? JSON.stringify(body.tags) : null,
       body.status || 'draft', body.is_featured ? 1 : 0, body.featured_order || 0,
       pubDate, params.id]
    );

    await logActivity(user.id, 'update', 'articles', parseInt(params.id!), null, getClientIP(request));
    return jsonResponse({ message: 'Artículo actualizado' });
  } catch (e: any) {
    console.error('PUT /api/articles/[id] error:', e);
    return errorResponse(`Error al actualizar artículo: ${e?.message || String(e)}`, 500);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM articles WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'articles', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Artículo eliminado' });
};
