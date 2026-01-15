import { z } from 'zod';

export const uploadFileSchema = z.object({
  file: z.any({
    required_error: 'File is required',
  }),
});

export const uploadMultipleFilesSchema = z.object({
  files: z.any({
    required_error: 'Files are required',
  }),
});

export const deleteFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});
