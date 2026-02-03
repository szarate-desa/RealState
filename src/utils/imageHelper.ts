import { API_BASE_URL, IMAGE_PLACEHOLDERS } from '../config/constants';

/**
 * Construye la URL completa para una imagen de propiedad
 * @param path - Ruta relativa de la imagen o URL completa
 * @returns URL completa de la imagen o placeholder si no hay imagen
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return IMAGE_PLACEHOLDERS.property;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
}

/**
 * Construye un array de URLs completas para múltiples imágenes
 * @param paths - Array de rutas de imágenes
 * @returns Array de URLs completas o un placeholder si no hay imágenes
 */
export function getImageUrls(paths: string[] | undefined | null): string[] {
  if (!paths || paths.length === 0) return [IMAGE_PLACEHOLDERS.property];
  return paths.map(getImageUrl);
}

/**
 * Construye la URL completa para un avatar de usuario
 * @param path - Ruta relativa del avatar o URL completa
 * @returns URL completa del avatar o placeholder si no hay avatar
 */
export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return IMAGE_PLACEHOLDERS.avatar;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
}
