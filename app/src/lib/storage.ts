// Storage URL helper - works in dev and production
// In production, nginx proxies /storage/ to MinIO
// In dev, we connect directly to localhost:9000

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:9000';

export function getStorageUrl(src?: string | null): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return src;
  // src is like "media/uuid.jpg" or "media/videos/uuid.mp4"
  return `${STORAGE_URL}/${src}`;
}
