import { create } from 'zustand';
import { authApi, userApi, type UpdateProfileData, type RegisterPayload, type SwitchAccountTypeData } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  completeOnboarding: (data: {
    accountType: string;
    companyName?: string;
  }) => Promise<User>;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  switchAccountType: (data: SwitchAccountTypeData) => Promise<User>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    const { data: user } = await userApi.getProfile();
    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (registerData) => {
    const { data } = await authApi.register(registerData);
    localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    const { data: user } = await userApi.getProfile();
    set({ user, isAuthenticated: true });
    return user;
  },

  completeOnboarding: async (onboardingData) => {
    const { data: user } = await userApi.completeOnboarding(onboardingData);
    set({ user });
    return user;
  },

  updateProfile: async (profileData) => {
    const { data: user } = await userApi.updateProfile(profileData);
    set({ user });
    return user;
  },

  switchAccountType: async (payload) => {
    const { data: user } = await userApi.switchAccountType(payload);
    set({ user });
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.accessToken);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data: user } = await userApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  },
}));
