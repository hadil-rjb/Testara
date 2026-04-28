import { TeamsService } from './teams.service';
import { CreateTeamDto, InviteMemberDto, SetProjectAccessDto, UpdateMemberRoleDto, UpdateTeamDto } from './dto/team.dto';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(req: any, dto: CreateTeamDto): Promise<import("./schemas/team.schema").TeamDocument>;
    findAll(req: any): Promise<Record<string, unknown>[]>;
    findOne(req: any, id: string): Promise<import("./schemas/team.schema").TeamDocument>;
    update(req: any, id: string, dto: UpdateTeamDto): Promise<import("./schemas/team.schema").TeamDocument>;
    remove(req: any, id: string): Promise<void>;
    updateMemberRole(req: any, id: string, memberId: string, dto: UpdateMemberRoleDto): Promise<import("./schemas/team.schema").TeamDocument>;
    removeMember(req: any, id: string, memberId: string): Promise<import("./schemas/team.schema").TeamDocument>;
    invite(req: any, id: string, dto: InviteMemberDto): Promise<import("./schemas/invitation.schema").InvitationDocument>;
    listInvitations(req: any, id: string): Promise<import("./schemas/invitation.schema").InvitationDocument[]>;
    revokeInvitation(req: any, id: string, invitationId: string): Promise<void>;
    resendInvitation(req: any, id: string, invitationId: string): Promise<import("./schemas/invitation.schema").InvitationDocument>;
    setProjectAccess(req: any, id: string, dto: SetProjectAccessDto): Promise<import("./schemas/team.schema").TeamDocument>;
}
