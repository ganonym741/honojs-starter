import { z } from 'zod';

export const createProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  postalCode: z.string().regex(/^\d{4,10}$/, 'Invalid postal code format').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  postalCode: z.string().regex(/^\d{4,10}$/, 'Invalid postal code format').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});
