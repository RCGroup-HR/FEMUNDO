import type { APIRoute } from 'astro';
import { queryOne, execute } from '../../../db/connection';
import {
  verifyPassword,
  generateToken,
  checkRateLimit,
  recordLoginAttempt,
  logActivity,
  getClientIP,
  jsonResponse,
  errorResponse,
} from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIP(request);

  // Rate limiting
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return errorResponse(
      `Demasiados intentos. Intente de nuevo en ${rateCheck.retryAfter} segundos.`,
      429
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body inválido', 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return errorResponse('Email/usuario y password son requeridos', 400);
  }

  // Buscar usuario por email o username
  const isEmail = email.includes('@');
  const user = await queryOne<any>(
    isEmail
      ? 'SELECT id, email, username, password_hash, full_name, role, is_active, allowed_modules FROM users WHERE email = ?'
      : 'SELECT id, email, username, password_hash, full_name, role, is_active, allowed_modules FROM users WHERE username = ?',
    [email]
  );

  if (!user) {
    recordLoginAttempt(ip, false);
    return errorResponse('Credenciales inválidas', 401);
  }

  if (!user.is_active) {
    recordLoginAttempt(ip, false);
    return errorResponse('Cuenta desactivada. Contacte al administrador.', 403);
  }

  // Verificar password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    recordLoginAttempt(ip, false);
    return errorResponse('Credenciales inválidas', 401);
  }

  // Login exitoso
  recordLoginAttempt(ip, true);

  // Actualizar último login
  await execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  // Generar token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });

  // Log de actividad
  await logActivity(user.id, 'login', 'users', user.id, null, ip);

  // Parsear allowed_modules (viene como string JSON de la BD)
  let allowedModules = null;
  try {
    allowedModules = user.allowed_modules ? (typeof user.allowed_modules === 'string' ? JSON.parse(user.allowed_modules) : user.allowed_modules) : null;
  } catch { allowedModules = null; }

  return jsonResponse({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      allowed_modules: allowedModules,
    },
  });
};
