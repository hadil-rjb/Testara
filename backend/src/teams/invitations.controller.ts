import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Public + authenticated endpoints keyed by invitation token.
 *
 * - GET /invitations/:token → public preview (team name, role, status, etc.)
 * - POST /invitations/:token/accept → requires auth, the logged-in user's
 *   email must match the invite.
 */
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get(':token')
  async preview(@Param('token') token: string) {
    const {
      invitation,
      teamName,
      inviterName,
      hasAccount,
      effectiveStatus,
    } = await this.teamsService.getInvitationByToken(token);
    return {
      _id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      status: effectiveStatus,
      expiresAt: invitation.expiresAt,
      teamId: invitation.team,
      teamName,
      inviterName,
      hasAccount,
    };
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  async accept(@Req() req, @Param('token') token: string) {
    const team = await this.teamsService.acceptInvitation(
      token,
      req.user.userId,
    );
    return { teamId: team._id, name: team.name };
  }
}
