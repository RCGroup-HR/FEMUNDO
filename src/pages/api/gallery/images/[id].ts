import type { APIRoute } from 'astro';
import { query, execute } from '../../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../../lib/auth';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const imageId = params.id;
  if (!imageId) return errorResponse('ID de imagen requerido', 400);

  // Verificar que la imagen existe
  const image = await query<any>('SELECT * FROM gallery_images WHERE id = ?', [imageId]);
  if (!image || (image as any[]).length === 0) {
    return errorResponse('Imagen no encontrada', 404);
  }

  // Eliminar la imagen de la base de datos
  await execute('DELETE FROM gallery_images WHERE id = ?', [imageId]);

  await logActivity(user.id, 'delete', 'gallery_images', parseInt(imageId), null, getClientIP(request));
  return jsonResponse({ message: 'Imagen eliminada' });
};
