import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await queryOne('SELECT * FROM video_section WHERE is_active = TRUE LIMIT 1');
  return jsonResponse({ data: data || {} });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const existing = await queryOne('SELECT id FROM video_section LIMIT 1');

  if (existing) {
    await execute(
      `UPDATE video_section SET title_es=?, title_en=?, subtitle_es=?, subtitle_en=?,
       video_url=?, video_type=?, is_active=?, multimedia_video_url=? WHERE id=?`,
      [body.title_es || null, body.title_en || null, body.subtitle_es || null, body.subtitle_en || null,
       body.video_url || null, body.video_type || 'youtube', body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
       body.multimedia_video_url || null, existing.id]
    );
  } else {
    await execute(
      `INSERT INTO video_section (title_es, title_en, subtitle_es, subtitle_en, video_url, video_type, is_active, multimedia_video_url)
       VALUES (?,?,?,?,?,?,?,?)`,
      [body.title_es || null, body.title_en || null, body.subtitle_es || null, body.subtitle_en || null,
       body.video_url || null, body.video_type || 'youtube', body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
       body.multimedia_video_url || null]
    );
  }

  await logActivity(user.id, 'update', 'video_section', existing?.id || 1, null, getClientIP(request));
  return jsonResponse({ message: 'Video actualizado' });
};
