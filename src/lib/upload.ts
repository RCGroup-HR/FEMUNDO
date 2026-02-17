import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { generateUniqueFilename, isAllowedFileType, validateFileMagicBytes } from './helpers';

const MAX_FILE_SIZE = parseInt(import.meta.env.MAX_FILE_SIZE || '10485760'); // 10MB
const UPLOAD_BASE = import.meta.env.UPLOAD_DIR || './public/uploads';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  thumbnailPath?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  error?: string;
}

// Determinar subdirectorio según tipo
function getUploadSubdir(category: string): string {
  const dirs: Record<string, string> = {
    images: 'images',
    gallery: 'gallery',
    team: 'team',
    events: 'events',
    articles: 'articles',
    carousel: 'carousel',
    hero: 'hero',
    about: 'about',
    general: 'general',
    documents: 'documents',
  };
  return dirs[category] || 'images';
}

// Subir un archivo desde FormData
export async function uploadFile(
  file: File,
  category: string = 'images'
): Promise<UploadResult> {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Archivo demasiado grande. Máximo: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
    };
  }

  // Validar tipo MIME declarado
  if (!isAllowedFileType(file.type)) {
    return {
      success: false,
      error: `Tipo de archivo no permitido: ${file.type}`,
    };
  }

  const subdir = getUploadSubdir(category);
  const uploadDir = path.join(UPLOAD_BASE, subdir);

  // Crear directorio si no existe
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const fileName = generateUniqueFilename(file.name);
  const filePath = path.join(uploadDir, fileName);

  try {
    // Leer el archivo como buffer y escribirlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validar firma real del archivo (magic bytes) — previene archivos maliciosos con MIME falso
    if (!validateFileMagicBytes(buffer, file.type)) {
      return {
        success: false,
        error: 'El contenido del archivo no coincide con su tipo declarado. Archivo rechazado.',
      };
    }

    await writeFile(filePath, buffer);

    // Generar thumbnail si es imagen
    let thumbnailPath: string | undefined;
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        const sharp = (await import('sharp')).default;
        const thumbDir = path.join(uploadDir, 'thumbs');
        if (!existsSync(thumbDir)) {
          await mkdir(thumbDir, { recursive: true });
        }
        const thumbPath = path.join(thumbDir, fileName);
        await sharp(buffer)
          .resize(300, 300, { fit: 'cover', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
        thumbnailPath = `/uploads/${subdir}/thumbs/${fileName}`;
      } catch (thumbError) {
        console.error('Error generating thumbnail:', thumbError);
      }
    }

    return {
      success: true,
      filePath: `/uploads/${subdir}/${fileName}`,
      thumbnailPath,
      fileName,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'Error al guardar el archivo',
    };
  }
}

// Eliminar un archivo
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join('./public', filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    // Intentar eliminar thumbnail también
    const dir = path.dirname(fullPath);
    const filename = path.basename(fullPath);
    const thumbPath = path.join(dir, 'thumbs', filename);
    if (existsSync(thumbPath)) {
      await unlink(thumbPath);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
