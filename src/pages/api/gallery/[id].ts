import type { APIRoute } from 'astro';
import { query, queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const album = await queryOne('SELECT * FROM gallery_albums WHERE id = ? OR slug = ?', [params.id, params.id]);
  if (!album) return errorResponse('Álbum no encontrado', 404);

  const images = await query(
    'SELECT * FROM gallery_images WHERE album_id = ? ORDER BY display_order ASC',
    [(album as any).id]
  );
  (album as any).images = images;
  (album as any).cover_image = (album as any).cover_image_url;

  return jsonResponse({ data: album });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE gallery_albums SET title_es=?, title_en=?, description_es=?, description_en=?,
     cover_image_url=?, event_id=?, is_active=?, display_order=? WHERE id=?`,
    [body.title_es || null, body.title_en || null, body.description_es || null, body.description_en || null,
     body.cover_image_url || body.cover_image || null, body.event_id || null, body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, body.display_order || 0, params.id]
  );

  // Si vienen imágenes nuevas, agregarlas
  if (body.new_images && Array.isArray(body.new_images)) {
    for (const img of body.new_images) {
      await execute(
        'INSERT INTO gallery_images (album_id, image_url, thumbnail_url, caption_es, caption_en, display_order) VALUES (?,?,?,?,?,?)',
        [params.id, img.image_url || null, img.thumbnail_url || null, img.caption_es || null, img.caption_en || null, img.display_order || 0]
      );
    }
  }

  await logActivity(user.id, 'update', 'gallery_albums', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Álbum actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM gallery_albums WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'gallery_albums', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Álbum eliminado' });
};
