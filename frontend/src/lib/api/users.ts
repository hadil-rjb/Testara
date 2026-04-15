import { api } from './client';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  themePreference?: 'light' | 'dark';
  languagePreference?: 'fr' | 'en';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CompleteOnboardingData {
  accountType: string;
  companyName?: string;
}

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: UpdateProfileData) => api.put('/users/me', data),
  changePassword: (data: ChangePasswordData) =>
    api.post('/users/me/change-password', data),
  completeOnboarding: (data: CompleteOnboardingData) =>
    api.put('/users/me/onboarding', data),
};
