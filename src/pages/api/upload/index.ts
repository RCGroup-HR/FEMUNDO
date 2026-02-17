import type { APIRoute } from 'astro';
import { execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { uploadFile } from '../../../lib/upload';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('FormData inválido', 400);
  }

  const file = formData.get('file') as File;
  if (!file) return errorResponse('No se encontró archivo', 400);

  const category = (formData.get('category') as string) || 'images';
  const altEs = formData.get('alt_text_es') as string;
  const altEn = formData.get('alt_text_en') as string;

  const result = await uploadFile(file, category);

  if (!result.success) {
    return errorResponse(result.error || 'Error al subir archivo', 400);
  }

  // Guardar en tabla media
  await execute(
    `INSERT INTO media (filename, original_name, mime_type, file_size, file_path, thumbnail_path, alt_text_es, alt_text_en, uploaded_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [result.fileName, result.originalName, result.mimeType, result.fileSize,
     result.filePath, result.thumbnailPath || null, altEs || null, altEn || null, user.id]
  );

  await logActivity(user.id, 'upload', 'media', null, { file: result.fileName }, getClientIP(request));

  return jsonResponse({
    message: 'Archivo subido correctamente',
    file_url: result.filePath,
    url: result.filePath,
    thumbnail_url: result.thumbnailPath,
    fileName: result.fileName,
    originalName: result.originalName,
    mimeType: result.mimeType,
    fileSize: result.fileSize,
  }, 201);
};
