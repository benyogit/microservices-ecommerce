export interface SignedUploadUrl {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}

export interface MediaStorage {
  getUploadUrl(key: string, contentType?: string): Promise<SignedUploadUrl>;
  getPublicUrl(key: string): string;
}
