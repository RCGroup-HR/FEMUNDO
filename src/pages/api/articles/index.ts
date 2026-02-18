import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody, generateSlug, getPaginationParams, paginatedResponse } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const { page, limit, offset } = getPaginationParams(url);
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');
  const all = url.searchParams.get('all'); // Para admin

  let countSql = 'SELECT COUNT(*) as total FROM articles';
  let sql = 'SELECT id, slug, title_es, title_en, excerpt_es, excerpt_en, hero_image_url, category, status, is_featured, pub_date, views_count, created_at FROM articles';
  const conditions: string[] = [];

  // Interpolate safe string values directly to avoid ER_WRONG_ARGUMENTS with mysql2 + MySQL 8
  if (!all) conditions.push("status = 'published'");
  if (status) {
    // Whitelist allowed status values to prevent SQL injection
    const allowedStatus = ['draft', 'published', 'archived'];
    if (allowedStatus.includes(status)) conditions.push(`status = '${status}'`);
  }
  if (category) {
    // Sanitize category: only allow alphanumeric, hyphens, underscores
    const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeCategory) conditions.push(`category = '${safeCategory}'`);
  }
  if (featured === 'true') conditions.push('is_featured = TRUE');

  if (conditions.length) {
    const where = ' WHERE ' + conditions.join(' AND ');
    countSql += where;
    sql += where;
  }

  sql += ` ORDER BY pub_date DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const [countResult] = await query<any>(countSql);
  const data = await query(sql);

  return jsonResponse(paginatedResponse(data, countResult?.total || 0, page, limit));
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body || !body.title_es) return errorResponse('Título es requerido', 400);

  const slug = body.slug || generateSlug(body.title_es);
  const imageUrl = body.hero_image_url || body.image_url || null;
  const pubDate = body.pub_date || (body.status === 'published' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null);

  const result = await execute(
    `INSERT INTO articles (slug, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en,
     hero_image_url, category, tags, author_id, status, is_featured, featured_order, pub_date)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [slug, body.title_es || null, body.title_en || null, body.excerpt_es || null, body.excerpt_en || null,
     body.content_es || null, body.content_en || null, imageUrl, body.category || null,
     body.tags ? JSON.stringify(body.tags) : null, user.id, body.status || 'draft',
     body.is_featured ? 1 : 0, body.featured_order || 0, pubDate]
  );

  await logActivity(user.id, 'create', 'articles', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Artículo creado', id: result.insertId, slug }, 201);
};
