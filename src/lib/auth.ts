import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '../db/connection';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = import.meta.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = parseInt(import.meta.env.BCRYPT_SALT_ROUNDS || '12');

export interface UserPayload {
  id: number;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  full_name: string;
}

export interface AuthResult {
  user: UserPayload | null;
  error: string | null;
}

// --- Password Hashing ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- JWT ---

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    return null;
  }
}

// --- Middleware ---

export async function authMiddleware(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Token no proporcionado' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { user: null, error: 'Token inválido o expirado' };
  }

  // Verificar que el usuario sigue activo en la BD
  const user = await queryOne<any>(
    'SELECT id, email, role, full_name, is_active FROM users WHERE id = ?',
    [decoded.id]
  );

  if (!user || !user.is_active) {
    return { user: null, error: 'Usuario no encontrado o desactivado' };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    error: null,
  };
}

// --- Role Checking ---

type Role = 'super_admin' | 'admin' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function requireRole(user: UserPayload | null, ...allowedRoles: Role[]): string | null {
  if (!user) return 'No autenticado';
  if (!allowedRoles.includes(user.role) && !hasMinRole(user.role, 'super_admin')) {
    return 'No tiene permisos suficientes';
  }
  return null;
}

// --- Rate Limiting (in-memory, simple) ---

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  // Si ha pasado el tiempo de bloqueo, resetear
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((LOCKOUT_DURATION - (now - record.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  const record = loginAttempts.get(identifier);
  if (record) {
    record.count++;
    record.lastAttempt = Date.now();
  } else {
    loginAttempts.set(identifier, { count: 1, lastAttempt: Date.now() });
  }
}

// --- Activity Log ---

export async function logActivity(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  details: any = null,
  ipAddress: string | null = null
): Promise<void> {
  try {
    await execute(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// --- Helper: extraer IP del request ---

export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// --- Helper: respuestas JSON estándar ---

export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}
