import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await query('SELECT * FROM about_section WHERE is_active = TRUE ORDER BY display_order ASC');
  return jsonResponse({ data });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody<any[]>(request);
  if (!body || !Array.isArray(body)) return errorResponse('Se espera un array de secciones', 400);

  for (const section of body) {
    if (section.id) {
      await execute(
        `UPDATE about_section SET title_es=?, title_en=?, content_es=?, content_en=?,
         image_url=?, display_order=?, is_active=? WHERE id=?`,
        [section.title_es || null, section.title_en || null, section.content_es || null, section.content_en || null,
         section.image_url || null, section.display_order || 0, section.is_active !== undefined ? (section.is_active ? 1 : 0) : 1, section.id]
      );
    } else {
      await execute(
        `INSERT INTO about_section (title_es, title_en, content_es, content_en, image_url, display_order, is_active)
         VALUES (?,?,?,?,?,?,?)`,
        [section.title_es || null, section.title_en || null, section.content_es || null, section.content_en || null,
         section.image_url || null, section.display_order || 0, section.is_active !== undefined ? (section.is_active ? 1 : 0) : 1]
      );
    }
  }

  await logActivity(user.id, 'update', 'about_section', null, null, getClientIP(request));
  return jsonResponse({ message: 'About actualizado' });
};
