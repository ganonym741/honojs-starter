export const UPLOAD_CONFIG = {
  directory: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  maxFiles: 10,
  filenamePrefix: 'file_',
  urlPrefix: process.env.FILE_URL_PREFIX || '/uploads',
};

export function validateUploadConfig(): void {
  if (UPLOAD_CONFIG.maxFileSize > 10485760) {
    console.warn('MAX_FILE_SIZE is very large. Consider reducing it for security.');
  }

  if (UPLOAD_CONFIG.allowedTypes.length === 0) {
    throw new Error('ALLOWED_FILE_TYPES must be configured');
  }
}
