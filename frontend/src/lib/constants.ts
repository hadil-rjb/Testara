/**
 * Application-wide constants.
 * Keep values here instead of scattering magic numbers / strings across files.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** localStorage keys — one source of truth prevents typos. */
export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  theme: 'theme',
  recentProjectActivity: 'recentProjectActivity',
} as const;

/** App routes used from non-Link places (interceptors, redirects). */
export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  projects: '/dashboard/projects',
  settings: '/dashboard/settings',
} as const;

/** Avatar upload constraints. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/** Password policy (kept in sync with backend). */
export const PASSWORD_MIN_LENGTH = 8;

/** Pagination defaults for the projects grid. */
export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;
export const DEFAULT_PAGE_SIZE = 12;

/** Toast auto-dismiss duration (ms). */
export const TOAST_DURATION = 3500;
