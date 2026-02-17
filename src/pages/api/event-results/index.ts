import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const eventId = url.searchParams.get('event_id');
  if (eventId) {
    const results = await query('SELECT * FROM event_results WHERE event_id = ? ORDER BY category_es ASC, position ASC, display_order ASC', [eventId]);
    return jsonResponse({ data: results });
  }
  const results = await query('SELECT er.*, e.name_es as event_name_es FROM event_results er JOIN events e ON er.event_id = e.id ORDER BY er.event_id DESC, er.category_es ASC, er.position ASC');
  return jsonResponse({ data: results });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const result = await execute(
    `INSERT INTO event_results (event_id, category_es, category_en, position, player_name, team_name, country, country_flag, prize, notes, display_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [body.event_id, body.category_es || null, body.category_en || null, body.position || null,
     body.player_name || null, body.team_name || null, body.country || null, body.country_flag || null,
     body.prize || null, body.notes || null, body.display_order || 0]
  );

  await logActivity(user.id, 'create', 'event_results', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Resultado creado', id: result.insertId }, 201);
};
