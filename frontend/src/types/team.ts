export type TeamRole = 'tester' | 'viewer';

export interface TeamMemberUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface TeamMember {
  user: TeamMemberUser;
  role: TeamRole;
}

export interface TeamProjectRef {
  _id: string;
  name: string;
  url?: string;
  status?: string;
  environment?: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: TeamMember[];
  projects: TeamProjectRef[];
  pendingInvitationCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface InvitationInviter {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Invitation {
  _id: string;
  team: string;
  email: string;
  role: TeamRole;
  status: InvitationStatus;
  token?: string;
  expiresAt: string;
  invitedBy?: InvitationInviter;
  acceptedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationPreview {
  _id: string;
  email: string;
  role: TeamRole;
  status: InvitationStatus;
  expiresAt: string;
  teamId: string;
  teamName: string;
  inviterName: string;
  hasAccount: boolean;
}
