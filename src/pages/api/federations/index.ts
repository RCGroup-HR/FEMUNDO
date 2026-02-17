import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

// Map of emoji flags to ISO codes for auto-migration
const EMOJI_TO_CODE: Record<string, string> = {
  '🇦🇷': 'ar', '🇦🇼': 'aw', '🇧🇴': 'bo', '🇧🇷': 'br', '🇨🇱': 'cl',
  '🇨🇴': 'co', '🇨🇷': 'cr', '🇨🇺': 'cu', '🇨🇼': 'cw', '🇪🇨': 'ec',
  '🇸🇻': 'sv', '🇪🇸': 'es', '🇺🇸': 'us', '🇬🇹': 'gt', '🇭🇳': 'hn',
  '🇮🇹': 'it', '🇯🇲': 'jm', '🇲🇽': 'mx', '🇳🇮': 'ni', '🇵🇦': 'pa',
  '🇵🇾': 'py', '🇵🇪': 'pe', '🇵🇷': 'pr', '🇩🇴': 'do', '🇹🇹': 'tt',
  '🇺🇾': 'uy', '🇻🇪': 've', '🇩🇲': 'dm', '🇭🇹': 'ht', '🇧🇧': 'bb',
};

// Country name to ISO code mapping for auto-detection
const COUNTRY_TO_CODE: Record<string, string> = {
  'argentina': 'ar', 'aruba': 'aw', 'bolivia': 'bo', 'brasil': 'br', 'brazil': 'br',
  'chile': 'cl', 'colombia': 'co', 'costa rica': 'cr', 'cuba': 'cu', 'curazao': 'cw',
  'curaçao': 'cw', 'ecuador': 'ec', 'el salvador': 'sv', 'españa': 'es', 'spain': 'es',
  'estados unidos': 'us', 'united states': 'us', 'guatemala': 'gt', 'honduras': 'hn',
  'italia': 'it', 'italy': 'it', 'jamaica': 'jm', 'méxico': 'mx', 'mexico': 'mx',
  'nicaragua': 'ni', 'panamá': 'pa', 'panama': 'pa', 'paraguay': 'py', 'perú': 'pe',
  'peru': 'pe', 'puerto rico': 'pr', 'república dominicana': 'do', 'dominican republic': 'do',
  'trinidad y tobago': 'tt', 'trinidad and tobago': 'tt', 'uruguay': 'uy', 'venezuela': 've',
  'dominica': 'dm', 'haití': 'ht', 'haiti': 'ht', 'barbados': 'bb',
};

async function migrateEmojiFlags() {
  try {
    const feds = await query<any>('SELECT id, country, country_flag FROM federations');
    for (const fed of feds) {
      const flag = fed.country_flag;
      if (!flag) {
        // No flag at all — try to derive from country name
        const code = COUNTRY_TO_CODE[(fed.country || '').toLowerCase().trim()];
        if (code) {
          await execute('UPDATE federations SET country_flag = ? WHERE id = ?', [code, fed.id]);
        }
      } else if (/^[a-z]{2}$/i.test(flag.trim())) {
        // Already a 2-letter ISO code, skip
      } else if (EMOJI_TO_CODE[flag]) {
        // Emoji flag → convert to ISO code
        await execute('UPDATE federations SET country_flag = ? WHERE id = ?', [EMOJI_TO_CODE[flag], fed.id]);
      } else {
        // Unknown format — try to derive from country name
        const code = COUNTRY_TO_CODE[(fed.country || '').toLowerCase().trim()];
        if (code) {
          await execute('UPDATE federations SET country_flag = ? WHERE id = ?', [code, fed.id]);
        }
      }
    }
  } catch { /* ignore migration errors */ }
}

let migrated = false;

export const GET: APIRoute = async () => {
  // Auto-migrate emoji flags to ISO codes on first load
  if (!migrated) {
    await migrateEmojiFlags();
    migrated = true;
  }
  const federations = await query('SELECT * FROM federations ORDER BY display_order ASC');
  return jsonResponse({ data: federations });
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody(request);
  if (!body) return errorResponse('Body inválido', 400);

  const result = await execute(
    `INSERT INTO federations (country, country_flag, name_es, name_en, president, website_url, facebook_url, instagram_url, logo_url, description_es, description_en, is_active, display_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [body.country || '', body.country_flag || null, body.name_es || '', body.name_en || null,
     body.president || null, body.website_url || null, body.facebook_url || null, body.instagram_url || null,
     body.logo_url || null, body.description_es || null, body.description_en || null,
     body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1, body.display_order || 0]
  );

  await logActivity(user.id, 'create', 'federations', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Federación creada', id: result.insertId }, 201);
};
