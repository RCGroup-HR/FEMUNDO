import type { APIRoute } from 'astro';
import { query, queryOne, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const event = await queryOne('SELECT * FROM events WHERE id = ? OR slug = ?', [params.id, params.id]);
  if (!event) return errorResponse('Evento no encontrado', 404);

  const pricing = await query(
    'SELECT * FROM event_pricing WHERE event_id = ? ORDER BY display_order ASC',
    [(event as any).id]
  );
  (event as any).pricing = pricing;
  // Alias para frontend
  (event as any).title_es = (event as any).name_es;
  (event as any).title_en = (event as any).name_en;
  (event as any).image_url = (event as any).flyer_image_url || (event as any).cover_image_url;

  return jsonResponse({ data: event });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  await execute(
    `UPDATE events SET name_es=?, name_en=?, description_es=?, description_en=?, location=?, country=?,
     start_date=?, end_date=?, flyer_image_url=?, cover_image_url=?, registration_url=?, gallery_url=?,
     status=?, is_featured=?, display_order=? WHERE id=?`,
    [body.name_es || body.title_es || null, body.name_en || body.title_en || null, body.description_es || null, body.description_en || null,
     body.location || null, body.country || null, body.start_date || null, body.end_date || null,
     body.flyer_image_url || body.image_url || null, body.cover_image_url || null, body.registration_url || null, body.gallery_url || null,
     body.status || 'upcoming', body.is_featured ? 1 : 0, body.display_order || 0, params.id]
  );

  // Actualizar pricing si viene
  if (body.pricing && Array.isArray(body.pricing)) {
    for (const plan of body.pricing) {
      if (plan.id) {
        await execute(
          `UPDATE event_pricing SET plan_name_es=?, plan_name_en=?, price=?, currency=?,
           description_es=?, description_en=?, features_es=?, features_en=?, stripe_link=?,
           is_active=?, is_recommended=?, display_order=? WHERE id=?`,
          [plan.plan_name_es || null, plan.plan_name_en || null, plan.price || null, plan.currency || 'USD',
           plan.description_es || null, plan.description_en || null,
           plan.features_es ? JSON.stringify(plan.features_es) : null, plan.features_en ? JSON.stringify(plan.features_en) : null,
           plan.stripe_link || null, plan.is_active !== undefined ? (plan.is_active ? 1 : 0) : 1, plan.is_recommended ? 1 : 0,
           plan.display_order || 0, plan.id]
        );
      } else {
        await execute(
          `INSERT INTO event_pricing (event_id, plan_name_es, plan_name_en, price, currency,
           description_es, description_en, features_es, features_en, stripe_link, is_active, is_recommended, display_order)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [params.id, plan.plan_name_es || null, plan.plan_name_en || null, plan.price || null, plan.currency || 'USD',
           plan.description_es || null, plan.description_en || null,
           plan.features_es ? JSON.stringify(plan.features_es) : null, plan.features_en ? JSON.stringify(plan.features_en) : null,
           plan.stripe_link || null, plan.is_active !== undefined ? (plan.is_active ? 1 : 0) : 1, plan.is_recommended ? 1 : 0, plan.display_order || 0]
        );
      }
    }
  }

  await logActivity(user.id, 'update', 'events', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Evento actualizado' });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  await execute('DELETE FROM events WHERE id = ?', [params.id]);
  await logActivity(user.id, 'delete', 'events', parseInt(params.id!), null, getClientIP(request));
  return jsonResponse({ message: 'Evento eliminado' });
};
