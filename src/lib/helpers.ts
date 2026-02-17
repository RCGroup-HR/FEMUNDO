import { v4 as uuidv4 } from 'uuid';

// Generar slug a partir de un texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')    // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-')             // Múltiples guiones a uno
    .replace(/^-|-$/g, '');          // Quitar guiones al inicio/final
}

// Generar nombre de archivo único
export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const id = uuidv4().substring(0, 8);
  const timestamp = Date.now();
  return `${timestamp}-${id}.${ext}`;
}

// Validar tipo MIME de imagen
// NOTA: SVG eliminado — puede contener JavaScript embebido (XSS)
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

export function isAllowedDocumentType(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(mimeType);
}

export function isAllowedFileType(mimeType: string): boolean {
  return isAllowedImageType(mimeType) || isAllowedDocumentType(mimeType);
}

/**
 * Validación de firma de archivo (magic bytes).
 * Verifica que el contenido real del archivo coincida con su tipo MIME declarado.
 * Previene que archivos maliciosos pasen con extensión/Content-Type falso.
 */
export function validateFileMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  if (buffer.length < 4) return false;

  const b = buffer;

  switch (declaredMimeType) {
    case 'image/jpeg':
      // FF D8 FF
      return b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;

    case 'image/png':
      // 89 50 4E 47 0D 0A 1A 0A
      return (
        b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47
      );

    case 'image/gif':
      // GIF87a o GIF89a
      return (
        b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38
      );

    case 'image/webp':
      // RIFF....WEBP
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        buffer.length >= 12 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      );

    case 'application/pdf':
      // %PDF
      return (
        b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46
      );

    case 'application/msword':
      // D0 CF 11 E0 (formato antiguo .doc)
      return (
        b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0
      );

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      // ZIP (archivos Office modernos .docx/.xlsx son ZIPs): PK
      return b[0] === 0x50 && b[1] === 0x4B;

    default:
      // Tipo no reconocido: rechazar por defecto
      return false;
  }
}

// Sanitizar input de texto (prevenir XSS básico)
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Sanitizar HTML rico (para contenido de artículos)
// Implementación defensiva sin dependencias externas en el servidor.
// Elimina tags peligrosos, atributos de evento y URLs con javascript:.
// Tags seguros: p, br, strong, b, em, i, u, ul, ol, li, h1-h6,
// blockquote, a, img, span, div, table, thead, tbody, tr, th, td,
// pre, code, hr, sub, sup
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'form', 'style',
  'base', 'link', 'meta', 'noscript', 'template', 'applet',
];

export function sanitizeRichText(html: string): string {
  if (!html) return '';

  let result = html;

  // Eliminar tags peligrosos y su contenido
  for (const tag of DANGEROUS_TAGS) {
    // Tags con cierre (e.g. <script>...</script>)
    result = result.replace(
      new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi'),
      ''
    );
    // Tags auto-cerrantes o sin contenido (e.g. <embed ...>)
    result = result.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  }

  // Eliminar atributos de eventos (onclick, onload, onerror, etc.)
  result = result.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Eliminar javascript: en href, src, action, etc.
  result = result.replace(/\b(href|src|action|formaction|data)\s*=\s*["']?\s*javascript:/gi, 'data-blocked=');

  // Eliminar data URIs peligrosos (data:text/html, data:application)
  result = result.replace(/\b(href|src)\s*=\s*["']?\s*data:(text\/html|application\/)/gi, 'data-blocked=');

  // Eliminar vbscript:
  result = result.replace(/vbscript:/gi, '');

  return result;
}

// Validar email
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Paginar resultados
// IMPORTANTE: se usa Math.trunc() para garantizar que limit y offset sean
// enteros puros (number), ya que mysql2 + MySQL 8 rechaza strings en LIMIT/OFFSET.
export function getPaginationParams(url: URL): { page: number; limit: number; offset: number } {
  const page = Math.max(1, Math.trunc(parseInt(url.searchParams.get('page') || '1')));
  const limit = Math.min(100, Math.max(1, Math.trunc(parseInt(url.searchParams.get('limit') || '20'))));
  const offset = Math.trunc((page - 1) * limit);
  return { page, limit, offset };
}

// Construir respuesta paginada
export function paginatedResponse(data: any[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

// Formatear fecha para MySQL
export function toMySQLDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Parsear body de request como JSON seguro
export async function parseBody<T = any>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
