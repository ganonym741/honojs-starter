export interface CreateProfileDTO {
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
}

export interface UpdateProfileDTO {
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  dateOfBirth: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
