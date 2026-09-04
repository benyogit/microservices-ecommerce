import { injectable } from 'inversify';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MediaStorage, SignedUploadUrl } from './media-storage';

const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'catalogue-media';
const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
const UPLOAD_URL_TTL_SECONDS = Number(process.env.STORAGE_UPLOAD_URL_TTL_SECONDS ?? 900);
// Optional CDN domain in front of the bucket (e.g. CloudFront). Falls back
// to the bucket's own virtual-hosted S3 URL when unset.
const STORAGE_PUBLIC_BASE_URL =
  process.env.STORAGE_PUBLIC_BASE_URL ?? `https://${STORAGE_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

@injectable()
export class S3MediaStorage implements MediaStorage {
  private readonly client = new S3Client({ region: AWS_REGION });

  async getUploadUrl(key: string, contentType?: string): Promise<SignedUploadUrl> {
    const command = new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    });
    return { uploadUrl, key, expiresInSeconds: UPLOAD_URL_TTL_SECONDS };
  }

  getPublicUrl(key: string): string {
    return `${STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }
}
