import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,15}$/, 'Invalid phone format')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
