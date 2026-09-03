import { injectable } from 'inversify';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MediaStorage, SignedUploadUrl } from './media-storage';

const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'catalogue-media';
const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
const UPLOAD_URL_TTL_SECONDS = Number(process.env.STORAGE_UPLOAD_URL_TTL_SECONDS ?? 900);

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
}
