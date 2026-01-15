import { Context } from 'hono';
import { UploadService } from './upload.service.js';
import { uploadFileSchema, uploadMultipleFilesSchema, deleteFileSchema } from '../../validators/upload.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export class UploadHandler {
  constructor() {}

  async handleUploadFile(c: Context) {
    try {
      const uploadService = c.get('uploadService') as UploadService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const file = (await c.req.formData()).get('file');

      if (!file || !(file instanceof File)) {
        return c.json(
          errorResponse('No file uploaded'),
          400
        );
      }

      const validationResult = uploadFileSchema.safeParse({ file });

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      const result = await uploadService.uploadFile(file);

      return c.json(successResponse(result), 201);
    } catch (error) {
      logger.error('File upload error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to upload file'),
        500
      );
    }
  }

  async handleUploadMultipleFiles(c: Context) {
    try {
      const uploadService = c.get('uploadService') as UploadService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const formData = await c.req.formData();
      const files: File[] = [];

      for (let i = 0; ; i++) {
        const file = formData.get(`files[${i}]`);
        if (file && file instanceof File) {
          files.push(file);
        }
      }

      if (files.length === 0) {
        return c.json(
          errorResponse('No files uploaded'),
          400
        );
      }

      const validationResult = uploadMultipleFilesSchema.safeParse({ files });

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error?.errors),
          400
        );
      }

      const result = await uploadService.uploadMultipleFiles(files);

      return c.json(successResponse(result), 201);
    } catch (error) {
      logger.error('Multiple files upload error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to upload files'),
        500
      );
    }
  }

  async handleDeleteFile(c: Context) {
    try {
      const uploadService = c.get('uploadService') as UploadService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const body = await c.req.json();

      const validationResult = deleteFileSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      await uploadService.deleteFile(validationResult.data.filename);

      return c.json(
        successResponse({ message: 'File deleted successfully' }),
        200
      );
    } catch (error) {
      logger.error('File deletion error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to delete file'),
        500
      );
    }
  }

  async handleGetFileInfo(c: Context) {
    try {
      const uploadService = c.get('uploadService') as UploadService;
      const filename = c.req.param('filename') as string;

      const fileInfo = await uploadService.getFileInfo(filename);

      if (!fileInfo) {
        return c.json(
          errorResponse('File not found'),
          404
        );
      }

      return c.json(successResponse(fileInfo), 200);
    } catch (error) {
      logger.error('Get file info error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get file info'),
        500
      );
    }
  }
}
