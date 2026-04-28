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
  SwitchAccountTypeData,
} from './users';

export { projectApi } from './projects';
export type { CreateProjectData, UpdateProjectData } from './projects';

export { teamApi, invitationApi } from './teams';
export type {
  CreateTeamData,
  UpdateTeamData,
  AddMemberData,
  InviteMemberData,
  UpdateMemberRoleData,
  SetProjectAccessData,
} from './teams';

export { notificationApi } from './notifications';
export type { NotificationItem, NotificationType } from './notifications';

// default export kept for backward compatibility with `import api from '@/lib/api'`
import { api } from './client';
export default api;
