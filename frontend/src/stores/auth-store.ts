import { create } from 'zustand';
import { authApi, userApi } from '@/lib/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
  onboardingCompleted: boolean;
  avatar?: string;
  themePreference: string;
  languagePreference: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  completeOnboarding: (data: { accountType: string; companyName?: string }) => Promise<User>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const { data: user } = await userApi.getProfile();
    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (registerData: any) => {
    const { data } = await authApi.register(registerData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const { data: user } = await userApi.getProfile();
    set({ user, isAuthenticated: true });
    return user;
  },

  completeOnboarding: async (onboardingData) => {
    const { data: user } = await userApi.completeOnboarding(onboardingData);
    set({ user });
    return user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
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

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
}));
