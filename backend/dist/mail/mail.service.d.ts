import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendTeamInvitationEmail(to: string, token: string, context: {
        teamName: string;
        inviterName: string;
        role: string;
        isExistingUser: boolean;
    }): Promise<void>;
    sendResetPasswordEmail(to: string, token: string): Promise<void>;
}
