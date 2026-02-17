import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const row = await queryOne('SELECT * FROM hero_section WHERE is_active = TRUE LIMIT 1');
  // Normalizar nombres de campos para el frontend
  const data = row ? {
    ...row,
    background_image: (row as any).background_image_url || (row as any).background_image || null,
    background_video: (row as any).background_video_url || (row as any).background_video || null,
  } : null;
  return jsonResponse({ data: data || {} });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const bgImage = body.background_image_url || body.background_image || null;
  const existing = await queryOne('SELECT id FROM hero_section LIMIT 1');

  if (existing) {
    await execute(
      `UPDATE hero_section SET title_es=?, title_en=?, subtitle_es=?, subtitle_en=?,
       cta_text_es=?, cta_text_en=?, cta_url=?, background_image_url=?, overlay_gradient=?, is_active=?
       WHERE id=?`,
      [body.title_es || null, body.title_en || null, body.subtitle_es || null, body.subtitle_en || null,
       body.cta_text_es || null, body.cta_text_en || null, body.cta_url || null, bgImage,
       body.overlay_gradient || null, 1, (existing as any).id]
    );
  } else {
    await execute(
      `INSERT INTO hero_section (title_es, title_en, subtitle_es, subtitle_en,
       cta_text_es, cta_text_en, cta_url, background_image_url, overlay_gradient, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [body.title_es || null, body.title_en || null, body.subtitle_es || null, body.subtitle_en || null,
       body.cta_text_es || null, body.cta_text_en || null, body.cta_url || null, bgImage,
       body.overlay_gradient || null, 1]
    );
  }

  await logActivity(user.id, 'update', 'hero_section', (existing as any)?.id || 1, null, getClientIP(request));
  return jsonResponse({ message: 'Hero actualizado' });
};
