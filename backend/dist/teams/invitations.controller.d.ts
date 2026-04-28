import { TeamsService } from './teams.service';
export declare class InvitationsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    preview(token: string): Promise<{
        _id: import("mongoose").Types.ObjectId;
        email: string;
        role: import("./schemas/team.schema").TeamRole;
        status: import("./schemas/invitation.schema").InvitationStatus;
        expiresAt: Date;
        teamId: import("mongoose").Types.ObjectId;
        teamName: string;
        inviterName: string;
        hasAccount: boolean;
    }>;
    accept(req: any, token: string): Promise<{
        teamId: import("mongoose").Types.ObjectId;
        name: string;
    }>;
}
