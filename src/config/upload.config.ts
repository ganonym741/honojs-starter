import { UPLOAD_CONFIG } from './upload.js';

export const multerConfig = {
  storage: './uploads',
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: UPLOAD_CONFIG.maxFiles,
  },
  fileFilter: (
    _req: any,
    file: { mimetype: string },
    cb: (arg0: Error | null, arg1: boolean) => void
  ) => {
    if (!UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
      cb(
        new Error(`Invalid file type. Only ${UPLOAD_CONFIG.allowedTypes.join(', ')} are allowed`),
        false
      );
    } else {
      cb(null, true);
    }
  },
};
