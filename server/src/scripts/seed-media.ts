import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { uploadFile } from '../services/minio.service';

const PUBLIC_DIR = path.resolve(__dirname, '../../../app/public');

interface ImageSeed {
  file: string;
  folder: string;
}

const IMAGES: ImageSeed[] = [
  { file: 'hero-yacht.jpg', folder: 'Hero' },
  { file: 'about-sunset.jpg', folder: 'Hero' },
  { file: 'about-welcome-1.jpg', folder: 'Hero' },
  { file: 'about-welcome-2.jpg', folder: 'Hero' },
  { file: 'contact-marina.jpg', folder: 'Hero' },
  { file: 'service-fuel-tank.jpg', folder: 'Servicios' },
  { file: 'service-inboard-engine.jpg', folder: 'Servicios' },
  { file: 'service-insulation.jpg', folder: 'Servicios' },
  { file: 'service-prop-shaft.jpg', folder: 'Servicios' },
  { file: 'service-refrigeration.jpg', folder: 'Servicios' },
  { file: 'service-underwater.jpg', folder: 'Servicios' },
  { file: 'gallery-1.jpg', folder: 'Galeria' },
  { file: 'gallery-2.jpg', folder: 'Galeria' },
  { file: 'gallery-3.jpg', folder: 'Galeria' },
  { file: 'gallery-4.jpg', folder: 'Galeria' },
  { file: 'gallery-5.jpg', folder: 'Galeria' },
  { file: 'gallery-6.jpg', folder: 'Galeria' },
  { file: 'gallery-7.jpg', folder: 'Galeria' },
  { file: 'gallery-8.jpg', folder: 'Galeria' },
  { file: 'maintenance-before.jpg', folder: 'Galeria' },
  { file: 'maintenance-after.jpg', folder: 'Galeria' },
  { file: 'FJRServices.png', folder: 'Marcas' },
  { file: 'LOGOFJRSERVICES.jpg', folder: 'Marcas' },
];

function extToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

async function main() {
  console.log('Seeding media to MinIO + PostgreSQL...');

  for (const item of IMAGES) {
    const filePath = path.join(PUBLIC_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (not found): ${item.file}`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const sizeBytes = buffer.length;
    const sizeKb = Math.round(sizeBytes / 1024);
    const ext = path.extname(item.file).slice(1);
    const id = uuidv4();
    const objectName = `${id}.${ext}`;
    const mimeType = extToMime(ext);

    try {
      await uploadFile('media', objectName, buffer, sizeBytes, mimeType);

      await prisma.media.create({
        data: {
          id,
          name: item.file,
          src: `media/${objectName}`,
          folder: item.folder,
          dimensions: '',
          size: `${sizeKb} KB`,
          mimeType,
        },
      });

      console.log(`  OK: ${item.file} → media/${objectName} (${sizeKb} KB)`);
    } catch (err) {
      console.error(`  FAIL: ${item.file}`, err);
    }
  }

  const count = await prisma.media.count();
  console.log(`\nDone. Total media records: ${count}`);
  process.exit(0);
}

main();
