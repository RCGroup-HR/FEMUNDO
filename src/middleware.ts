import { defineMiddleware } from 'astro:middleware';

// Orígenes permitidos para CORS
const ALLOWED_ORIGINS = [
  'https://femundo.org',
  'https://www.femundo.org',
  // IP del VPS para pruebas mientras el DNS no apunta al servidor
  'https://38.242.218.24',
  'http://38.242.218.24',
];

// En desarrollo también permitimos localhost
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:4321', 'http://127.0.0.1:4321');
}

// Headers de seguridad que se aplican a todas las respuestas
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const method = request.method.toUpperCase();
  const isApiRoute = url.pathname.startsWith('/api/');

  // ── CORS (solo rutas /api/) ──────────────────────────────────────────────
  if (isApiRoute) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin === '';

    // Responder preflight OPTIONS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    // Bloquear orígenes no permitidos en métodos que mutan estado
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && origin && !isAllowed) {
      return new Response(JSON.stringify({ error: 'Origen no permitido' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ── CSRF: verificar que POST/PUT/PATCH/DELETE vienen del mismo origen ────
  // Excepción: la ruta de login no requiere token previo
  if (
    isApiRoute &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
    !url.pathname.startsWith('/api/auth/login')
  ) {
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';
    const host = url.host;

    // Permitir si el origen/referer coincide con el host del servidor
    const originOk =
      origin === '' ||                          // petición server-side (sin origen)
      origin.includes(host) ||
      ALLOWED_ORIGINS.includes(origin);

    const refererOk =
      referer === '' ||
      referer.includes(host) ||
      ALLOWED_ORIGINS.some(o => referer.startsWith(o));

    if (!originOk && !refererOk) {
      return new Response(JSON.stringify({ error: 'Solicitud bloqueada: origen inválido (CSRF)' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Ejecutar la ruta normal ──────────────────────────────────────────────
  const response = await next();

  // ── Inyectar security headers en la respuesta ───────────────────────────
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!newHeaders.has(key)) {
      newHeaders.set(key, value);
    }
  }

  // CORS: agregar Allow-Origin en rutas API
  if (isApiRoute) {
    const origin = request.headers.get('Origin') || '';
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      newHeaders.set('Access-Control-Allow-Origin', origin);
      newHeaders.set('Vary', 'Origin');
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});
