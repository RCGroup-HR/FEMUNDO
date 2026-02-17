import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { getPaginationParams, paginatedResponse } from '../../../lib/helpers';
import { deleteFile } from '../../../lib/upload';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);

  const url = new URL(request.url);
  const { page, limit, offset } = getPaginationParams(url);
  const type = url.searchParams.get('type'); // image, document

  let countSql = 'SELECT COUNT(*) as total FROM media';
  let sql = 'SELECT * FROM media';
  const params: any[] = [];

  if (type === 'image') {
    const where = " WHERE mime_type LIKE 'image/%'";
    countSql += where;
    sql += where;
  } else if (type === 'document') {
    const where = " WHERE mime_type NOT LIKE 'image/%'";
    countSql += where;
    sql += where;
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [countResult] = await query<any>(countSql);
  const data = await query(sql, params);

  return jsonResponse({ data: paginatedResponse(data, countResult?.total || 0, page, limit) });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('ID requerido', 400);

  // Obtener el archivo para eliminarlo del disco
  const media = await query<any>('SELECT file_path FROM media WHERE id = ?', [id]);
  if (media.length > 0) {
    await deleteFile(media[0].file_path);
  }

  await execute('DELETE FROM media WHERE id = ?', [id]);
  await logActivity(user.id, 'delete', 'media', parseInt(id), null, getClientIP(request));
  return jsonResponse({ message: 'Archivo eliminado' });
};
