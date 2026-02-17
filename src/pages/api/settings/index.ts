import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let data;
  if (category) {
    data = await query('SELECT * FROM site_settings WHERE category = ? ORDER BY setting_key', [category]);
  } else {
    data = await query('SELECT * FROM site_settings ORDER BY category, setting_key');
  }

  return jsonResponse({ data });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody<Record<string, any>>(request);
  if (!body) return errorResponse('Body inválido', 400);

  for (const [key, value] of Object.entries(body)) {
    await execute(
      'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
      [String(value ?? ''), key]
    );
  }

  await logActivity(user.id, 'update', 'site_settings', null, null, getClientIP(request));
  return jsonResponse({ message: 'Configuración actualizada' });
};
