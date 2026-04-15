/**
 * Barrel for the API layer.
 *
 * Usage:
 *   import { authApi, userApi, projectApi, api } from '@/lib/api';
 */

export { api } from './client';

export { authApi } from './auth';
export type { LoginPayload, RegisterPayload } from './auth';

export { userApi } from './users';
export type {
  UpdateProfileData,
  ChangePasswordData,
  CompleteOnboardingData,
} from './users';

export { projectApi } from './projects';
export type { CreateProjectData, UpdateProjectData } from './projects';

// default export kept for backward compatibility with `import api from '@/lib/api'`
import { api } from './client';
export default api;
