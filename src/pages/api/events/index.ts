import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody, generateSlug } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  let sql = 'SELECT * FROM events';
  const params: any[] = [];
  const conditions: string[] = [];

  if (status) { conditions.push('status = ?'); params.push(status); }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY display_order ASC, start_date DESC';

  const data = await query(sql, params);

  // Incluir pricing y normalizar nombres para frontend
  for (const event of data as any[]) {
    const pricing = await query(
      'SELECT * FROM event_pricing WHERE event_id = ? ORDER BY display_order ASC',
      [event.id]
    );
    event.pricing = pricing;
    // Alias para compatibilidad frontend
    event.title_es = event.name_es;
    event.title_en = event.name_en;
    event.image_url = event.flyer_image_url || event.cover_image_url;
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

  // Aceptar title_es O name_es
  const nameEs = body.name_es || body.title_es || 'Sin título';
  const nameEn = body.name_en || body.title_en || null;
  const descEs = body.description_es || null;
  const descEn = body.description_en || null;
  const imageUrl = body.flyer_image_url || body.image_url || null;

  const slug = body.slug || generateSlug(nameEs);

  // Strip time component from ISO datetime strings (e.g. "2025-11-01T00:00:00.000Z" → "2025-11-01")
  const toDateOnly = (v: any) => v ? String(v).slice(0, 10) : null;

  const result = await execute(
    `INSERT INTO events (slug, name_es, name_en, description_es, description_en, location, country,
     start_date, end_date, flyer_image_url, cover_image_url, registration_url, gallery_url, status, is_featured, display_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [slug, nameEs, nameEn, descEs, descEn,
     body.location || null, body.country || null, toDateOnly(body.start_date), toDateOnly(body.end_date),
     imageUrl, body.cover_image_url || null, body.registration_url || null, body.gallery_url || null,
     body.status || 'upcoming', body.is_featured ? 1 : 0, body.display_order || 0]
  );

  // Crear pricing si viene
  if (body.pricing && Array.isArray(body.pricing)) {
    for (const p of body.pricing) {
      await execute(
        `INSERT INTO event_pricing (event_id, name_es, name_en, price, currency, stripe_link, display_order, is_active)
         VALUES (?,?,?,?,?,?,?,?)`,
        [result.insertId, p.name_es || null, p.name_en || null, p.price || 0,
         p.currency || 'USD', p.stripe_link || null, p.display_order || 0, 1]
      );
    }
  }

  await logActivity(user.id, 'create', 'events', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Evento creado', id: result.insertId, slug }, 201);
};
