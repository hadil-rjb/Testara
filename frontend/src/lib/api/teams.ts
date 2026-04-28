import { api } from './client';
import type { TeamRole } from '@/types';

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface AddMemberData {
  email: string;
  role: TeamRole;
}

export interface InviteMemberData {
  email: string;
  role: TeamRole;
}

export interface UpdateMemberRoleData {
  role: TeamRole;
}

export interface SetProjectAccessData {
  projectIds: string[];
}

export const teamApi = {
  getAll: () => api.get('/teams'),
  getById: (id: string) => api.get(`/teams/${id}`),
  create: (data: CreateTeamData) => api.post('/teams', data),
  update: (id: string, data: UpdateTeamData) => api.patch(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),

  updateMemberRole: (
    teamId: string,
    memberId: string,
    data: UpdateMemberRoleData,
  ) => api.patch(`/teams/${teamId}/members/${memberId}`, data),
  removeMember: (teamId: string, memberId: string) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),

  // Invitations
  listInvitations: (teamId: string) =>
    api.get(`/teams/${teamId}/invitations`),
  invite: (teamId: string, data: InviteMemberData) =>
    api.post(`/teams/${teamId}/invitations`, data),
  revokeInvitation: (teamId: string, invitationId: string) =>
    api.delete(`/teams/${teamId}/invitations/${invitationId}`),
  resendInvitation: (teamId: string, invitationId: string) =>
    api.post(`/teams/${teamId}/invitations/${invitationId}/resend`),

  setProjectAccess: (teamId: string, data: SetProjectAccessData) =>
    api.put(`/teams/${teamId}/projects`, data),
};

export const invitationApi = {
  preview: (token: string) => api.get(`/invitations/${token}`),
  accept: (token: string) => api.post(`/invitations/${token}/accept`),
};
