import { promises as fs } from 'fs';
import path from 'path';
import logger from '../../utils/logger.js';
import { UploadResponse, MultipleUploadResponse } from './upload.interface.js';
import { Dependency } from 'hono-simple-di';
import { UPLOAD_CONFIG } from '@/config/upload.js';

export class UploadService {
  constructor() {}
  
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filepath = path.join(UPLOAD_CONFIG.directory, filename);

      await fs.writeFile(filepath, Buffer.from(await file.arrayBuffer()));

      const url = `${UPLOAD_CONFIG.urlPrefix}/${filename}`;

      logger.info('File uploaded successfully', { filename, size: file.size });

      return {
        success: true,
        data: {
          filename,
          url,
          size: file.size,
          mimetype: file.type,
        },
      };
    } catch (error) {
      logger.error('File upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const uploadedFiles = [];

      for (const file of files) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filepath = path.join(UPLOAD_CONFIG.directory, filename);

        await fs.writeFile(filepath, Buffer.from(await file.arrayBuffer()));

        const url = `${UPLOAD_CONFIG.urlPrefix}/${filename}`;

        uploadedFiles.push({
          filename,
          url,
          size: file.size,
          mimetype: file.type,
        });
      }

      logger.info('Files uploaded successfully', { count: files.length });

      return {
        success: true,
        data: uploadedFiles,
      };
    } catch (error) {
      logger.error('Multiple file upload failed:', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filepath = path.join(UPLOAD_CONFIG.directory, filename);

      // Check if file exists
      await fs.access(filepath);

      // Delete file
      await fs.unlink(filepath);

      logger.info('File deleted successfully', { filename });
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw error;
    }
  }

  async getFileInfo(filename: string): Promise<{ exists: boolean; size: number } | null> {
    try {
      const filepath = path.join(UPLOAD_CONFIG.directory, filename);

      const stats = await fs.stat(filepath);

      return {
        exists: true,
        size: stats.size,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { exists: false, size: 0 };
      }
      throw error;
    }
  }
}

export const uploadServiceDep = new Dependency(() => new UploadService());
