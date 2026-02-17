import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let sql = 'SELECT * FROM translations';
  const params: any[] = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY category, translation_key';
  const data = await query(sql, params);

  // También devolver como objeto anidado para uso fácil
  const nested: Record<string, Record<string, { es: string; en: string }>> = {};
  for (const row of data as any[]) {
    const [cat, ...keyParts] = row.translation_key.split('.');
    const key = keyParts.join('.');
    if (!nested[cat]) nested[cat] = {};
    nested[cat][key] = { es: row.value_es, en: row.value_en || '' };
  }

  return jsonResponse({ data: { translations: data, nested } });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const rawBody = await parseBody<any>(request);
  // Accept both array directly or { translations: [...] } format
  const body = Array.isArray(rawBody) ? rawBody : (rawBody?.translations && Array.isArray(rawBody.translations) ? rawBody.translations : null);
  if (!body) return errorResponse('Se espera un array de traducciones', 400);

  for (const item of body) {
    if (item.id) {
      await execute(
        'UPDATE translations SET value_es = ?, value_en = ? WHERE id = ?',
        [item.value_es || null, item.value_en || null, item.id]
      );
    } else if (item.translation_key) {
      await execute(
        'INSERT INTO translations (translation_key, value_es, value_en, category) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE value_es=VALUES(value_es), value_en=VALUES(value_en)',
        [item.translation_key, item.value_es || null, item.value_en || null, item.category || 'general']
      );
    }
  }

  await logActivity(user.id, 'update', 'translations', null, null, getClientIP(request));
  return jsonResponse({ message: 'Traducciones actualizadas' });
};
