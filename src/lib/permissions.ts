// =============================================================
// Sistema de Permisos por Módulo - FEMUNDO Admin Panel
// =============================================================

export interface AdminModule {
  key: string;
  label: string;
  path: string;
  icon: string;
}

export const ADMIN_MODULES: AdminModule[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'fa-gauge-high' },
  { key: 'hero', label: 'Hero / Banner', path: '/admin/hero', icon: 'fa-image' },
  { key: 'carousel', label: 'Carrusel', path: '/admin/carousel', icon: 'fa-images' },
  { key: 'about', label: 'Acerca de', path: '/admin/about', icon: 'fa-info-circle' },
  { key: 'stats', label: 'Estadísticas', path: '/admin/stats', icon: 'fa-chart-bar' },
  { key: 'video', label: 'Video', path: '/admin/video', icon: 'fa-video' },
  { key: 'events', label: 'Eventos', path: '/admin/events', icon: 'fa-calendar' },
  { key: 'articles', label: 'Artículos', path: '/admin/articles', icon: 'fa-newspaper' },
  { key: 'team', label: 'Equipo', path: '/admin/team', icon: 'fa-users' },
  { key: 'gallery', label: 'Galería', path: '/admin/gallery', icon: 'fa-photo-film' },
  { key: 'federations', label: 'Federaciones', path: '/admin/federations', icon: 'fa-globe-americas' },
  { key: 'regulations', label: 'Reglamento', path: '/admin/regulations', icon: 'fa-gavel' },
  { key: 'announcement', label: 'Anuncio', path: '/admin/announcement', icon: 'fa-bullhorn' },
  { key: 'contact', label: 'Contacto', path: '/admin/contact', icon: 'fa-envelope' },
  { key: 'navigation', label: 'Navegación', path: '/admin/navigation', icon: 'fa-bars' },
  { key: 'footer', label: 'Footer', path: '/admin/footer', icon: 'fa-shoe-prints' },
  { key: 'translations', label: 'Traducciones', path: '/admin/translations', icon: 'fa-language' },
  { key: 'media', label: 'Archivos', path: '/admin/media', icon: 'fa-folder-open' },
  { key: 'users', label: 'Usuarios', path: '/admin/users', icon: 'fa-user-shield' },
  { key: 'settings', label: 'Configuración', path: '/admin/settings', icon: 'fa-gear' },
];

// Todas las claves de módulos
export const ALL_MODULE_KEYS = ADMIN_MODULES.map(m => m.key);

// Perfiles predefinidos de permisos
export interface PermissionProfile {
  label: string;
  description: string;
  modules: string[];
}

export const PERMISSION_PROFILES: Record<string, PermissionProfile> = {
  admin_completo: {
    label: 'Administrador Completo',
    description: 'Acceso a todos los módulos',
    modules: [...ALL_MODULE_KEYS],
  },
  editor_contenido: {
    label: 'Editor de Contenido',
    description: 'Artículos, galería, eventos y secciones de contenido',
    modules: ['dashboard', 'hero', 'carousel', 'about', 'stats', 'video', 'events', 'articles', 'gallery', 'announcement', 'media'],
  },
  editor_eventos: {
    label: 'Editor de Eventos',
    description: 'Solo eventos y galería',
    modules: ['dashboard', 'events', 'gallery', 'media'],
  },
  solo_lectura: {
    label: 'Solo Lectura',
    description: 'Solo puede ver el dashboard',
    modules: ['dashboard'],
  },
};

/**
 * Resuelve los módulos permitidos para un usuario.
 * - super_admin: SIEMPRE tiene acceso a todo
 * - Si tiene allowed_modules asignados: usa esos
 * - Si no: fallback según su rol
 */
export function resolveUserModules(role: string, allowedModules: string[] | null | undefined): string[] {
  // super_admin siempre tiene acceso total
  if (role === 'super_admin') return [...ALL_MODULE_KEYS];

  // Si tiene módulos asignados explícitamente
  if (allowedModules && allowedModules.length > 0) {
    return allowedModules;
  }

  // Fallback por rol (para usuarios existentes sin allowed_modules)
  if (role === 'admin') return [...PERMISSION_PROFILES.admin_completo.modules];
  if (role === 'editor') return [...PERMISSION_PROFILES.editor_contenido.modules];
  return [...PERMISSION_PROFILES.solo_lectura.modules];
}

/**
 * Verifica si un usuario puede acceder a un módulo específico
 */
export function canAccessModule(role: string, allowedModules: string[] | null | undefined, moduleKey: string): boolean {
  return resolveUserModules(role, allowedModules).includes(moduleKey);
}

/**
 * Detecta qué perfil predefinido coincide con un conjunto de módulos.
 * Retorna 'personalizado' si no coincide con ninguno.
 */
export function detectProfile(modules: string[]): string {
  const sorted = [...modules].sort().join(',');
  for (const [key, profile] of Object.entries(PERMISSION_PROFILES)) {
    if ([...profile.modules].sort().join(',') === sorted) {
      return key;
    }
  }
  return 'personalizado';
}
