import { TeamRole } from '../schemas/team.schema';
export declare class CreateTeamDto {
    name: string;
    description?: string;
}
export declare class UpdateTeamDto {
    name?: string;
    description?: string;
}
export declare class AddMemberDto {
    email: string;
    role: TeamRole;
}
export declare class UpdateMemberRoleDto {
    role: TeamRole;
}
export declare class SetProjectAccessDto {
    projectIds: string[];
}
export declare class InviteMemberDto {
    email: string;
    role: TeamRole;
}
