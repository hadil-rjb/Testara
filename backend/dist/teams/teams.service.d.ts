import { Model } from 'mongoose';
import { TeamDocument, TeamRole } from './schemas/team.schema';
import { InvitationDocument, InvitationStatus } from './schemas/invitation.schema';
import { CreateTeamDto, InviteMemberDto, SetProjectAccessDto, UpdateMemberRoleDto, UpdateTeamDto } from './dto/team.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { ProjectDocument } from '../projects/schemas/project.schema';
import { MailService } from '../mail/mail.service';
export declare class TeamsService {
    private readonly teamModel;
    private readonly userModel;
    private readonly projectModel;
    private readonly invitationModel;
    private readonly mailService;
    constructor(teamModel: Model<TeamDocument>, userModel: Model<UserDocument>, projectModel: Model<ProjectDocument>, invitationModel: Model<InvitationDocument>, mailService: MailService);
    private assertEnterprise;
    private loadOwnedTeam;
    create(userId: string, dto: CreateTeamDto): Promise<TeamDocument>;
    findAllByOwner(userId: string): Promise<Record<string, unknown>[]>;
    findOne(teamId: string, userId: string): Promise<TeamDocument>;
    update(teamId: string, userId: string, dto: UpdateTeamDto): Promise<TeamDocument>;
    remove(teamId: string, userId: string): Promise<void>;
    updateMemberRole(teamId: string, userId: string, memberId: string, dto: UpdateMemberRoleDto): Promise<TeamDocument>;
    removeMember(teamId: string, userId: string, memberId: string): Promise<TeamDocument>;
    inviteMember(teamId: string, userId: string, dto: InviteMemberDto): Promise<InvitationDocument>;
    listInvitations(teamId: string, userId: string): Promise<InvitationDocument[]>;
    revokeInvitation(teamId: string, userId: string, invitationId: string): Promise<void>;
    resendInvitation(teamId: string, userId: string, invitationId: string): Promise<InvitationDocument>;
    getInvitationByToken(token: string): Promise<{
        invitation: InvitationDocument;
        teamName: string;
        inviterName: string;
        hasAccount: boolean;
        effectiveStatus: InvitationStatus;
    }>;
    acceptInvitation(token: string, userId: string): Promise<TeamDocument>;
    setProjectAccess(teamId: string, userId: string, dto: SetProjectAccessDto): Promise<TeamDocument>;
    getRoleFor(team: TeamDocument, userId: string): TeamRole | null;
}
