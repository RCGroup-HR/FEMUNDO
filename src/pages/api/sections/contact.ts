import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await queryOne('SELECT * FROM contact_info LIMIT 1');
  return jsonResponse({ data: data || {} });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const existing = await queryOne('SELECT id FROM contact_info LIMIT 1');
  if (existing) {
    await execute(
      `UPDATE contact_info SET address_es=?, address_en=?, phone=?, email=?, whatsapp=?,
       facebook_url=?, instagram_url=?, youtube_url=?, twitter_url=?, map_embed_url=? WHERE id=?`,
      [body.address_es || null, body.address_en || null, body.phone || null, body.email || null, body.whatsapp || null,
       body.facebook_url || null, body.instagram_url || null, body.youtube_url || null, body.twitter_url || null,
       body.map_embed_url || null, existing.id]
    );
  } else {
    await execute(
      `INSERT INTO contact_info (address_es, address_en, phone, email, whatsapp,
       facebook_url, instagram_url, youtube_url, twitter_url, map_embed_url)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [body.address_es || null, body.address_en || null, body.phone || null, body.email || null, body.whatsapp || null,
       body.facebook_url || null, body.instagram_url || null, body.youtube_url || null, body.twitter_url || null,
       body.map_embed_url || null]
    );
  }

  await logActivity(user.id, 'update', 'contact_info', existing?.id || 1, null, getClientIP(request));
  return jsonResponse({ message: 'Contacto actualizado' });
};
