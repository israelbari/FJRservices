import sharp from 'sharp';

export interface ProcessedImage {
  preview: any;
  thumbnail: any;
  width: number;
  height: number;
}

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  const preview = await sharp(buffer)
    .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbnail = await sharp(buffer)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  return { preview, thumbnail, width, height };
}

export function isImage(mimeType?: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
}
