import type { APIRoute } from 'astro';
import { execute } from '../../../db/connection';
import {
  authMiddleware,
  verifyPassword,
  hashPassword,
  logActivity,
  getClientIP,
  jsonResponse,
  errorResponse,
} from '../../../lib/auth';
import { queryOne } from '../../../db/connection';

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) {
    return errorResponse(error || 'No autenticado', 401);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body inválido', 400);
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return errorResponse('Password actual y nuevo son requeridos', 400);
  }

  // Validación de contraseña
  if (newPassword.length < 8) {
    return errorResponse('El nuevo password debe tener al menos 8 caracteres', 400);
  }
  if (!/[A-Za-z]/.test(newPassword)) {
    return errorResponse('El password debe contener al menos una letra', 400);
  }
  if (!/[0-9]/.test(newPassword)) {
    return errorResponse('El password debe contener al menos un número', 400);
  }
  if (newPassword === currentPassword) {
    return errorResponse('El nuevo password debe ser diferente al actual', 400);
  }

  // Verificar password actual
  const dbUser = await queryOne<any>('SELECT password_hash FROM users WHERE id = ?', [user.id]);
  if (!dbUser) {
    return errorResponse('Usuario no encontrado', 404);
  }

  const isValid = await verifyPassword(currentPassword, dbUser.password_hash);
  if (!isValid) {
    return errorResponse('Password actual incorrecto', 401);
  }

  // Actualizar password
  const newHash = await hashPassword(newPassword);
  await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

  await logActivity(user.id, 'change_password', 'users', user.id, null, getClientIP(request));

  return jsonResponse({ message: 'Password actualizado correctamente' });
};
