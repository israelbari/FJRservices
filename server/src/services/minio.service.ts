import * as Minio from 'minio';
import { env } from '../utils/env';

const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

const BUCKETS = [env.MINIO_BUCKET_MEDIA, env.MINIO_BUCKET_CLIENTS];

export async function ensureBuckets(): Promise<void> {
  for (const bucket of BUCKETS) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket);
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    }
  }
}

export async function uploadFile(
  bucket: string,
  objectName: string,
  buffer: Buffer,
  size: number,
  mimeType: string
): Promise<void> {
  await minioClient.putObject(bucket, objectName, buffer, size, {
    'Content-Type': mimeType,
  });
}

export async function getPresignedUrl(bucket: string, objectName: string, expirySeconds = 900): Promise<string> {
  return minioClient.presignedGetObject(bucket, objectName, expirySeconds);
}

export async function deleteFile(bucket: string, objectName: string): Promise<void> {
  await minioClient.removeObject(bucket, objectName);
}

export function getPublicUrl(bucket: string, objectName: string): string {
  return `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${bucket}/${objectName}`;
}

export { minioClient };
