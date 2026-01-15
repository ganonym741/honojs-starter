export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountDTO {
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
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
  } | null;
}
