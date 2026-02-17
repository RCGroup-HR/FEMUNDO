import type { APIRoute } from 'astro';
import { queryOne } from '../../../db/connection';
import { authMiddleware, jsonResponse, errorResponse } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);

  if (error || !user) {
    return errorResponse(error || 'No autenticado', 401);
  }

  // Obtener datos completos incluyendo allowed_modules
  const fullUser = await queryOne<any>(
    'SELECT id, email, username, full_name, role, avatar_url, allowed_modules FROM users WHERE id = ?',
    [user.id]
  );

  if (!fullUser) {
    return errorResponse('Usuario no encontrado', 404);
  }

  // Parsear allowed_modules
  let allowedModules = null;
  try {
    allowedModules = fullUser.allowed_modules
      ? (typeof fullUser.allowed_modules === 'string' ? JSON.parse(fullUser.allowed_modules) : fullUser.allowed_modules)
      : null;
  } catch { allowedModules = null; }

  return jsonResponse({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      username: fullUser.username,
      name: fullUser.full_name,
      full_name: fullUser.full_name,
      role: fullUser.role,
      avatar_url: fullUser.avatar_url,
      allowed_modules: allowedModules,
    },
  });
};
