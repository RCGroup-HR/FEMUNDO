import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody, generateSlug } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const albums = await query('SELECT * FROM gallery_albums WHERE is_active = TRUE ORDER BY display_order ASC');
  // Contar imágenes por álbum
  for (const album of albums as any[]) {
    const [count] = await query<any>('SELECT COUNT(*) as total FROM gallery_images WHERE album_id = ?', [album.id]);
    album.image_count = count?.total || 0;
    album.cover_image = album.cover_image_url;
  }
  return jsonResponse({ data: albums });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body || !body.title_es) return errorResponse('Título es requerido', 400);

  const slug = body.slug || generateSlug(body.title_es);

  const result = await execute(
    `INSERT INTO gallery_albums (slug, title_es, title_en, description_es, description_en,
     cover_image_url, event_id, is_active, display_order) VALUES (?,?,?,?,?,?,?,?,?)`,
    [slug, body.title_es || null, body.title_en || null, body.description_es || null, body.description_en || null,
     body.cover_image_url || body.cover_image || null, body.event_id || null, body.is_active ? 1 : 1, body.display_order || 0]
  );

  await logActivity(user.id, 'create', 'gallery_albums', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Álbum creado', id: result.insertId, slug }, 201);
};
