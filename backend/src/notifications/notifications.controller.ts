import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { TeamsService } from '../teams/teams.service';

/**
 * All endpoints are scoped to the authenticated user — there is no way
 * to read or modify someone else's notifications.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly teamsService: TeamsService,
  ) {}

  @Get()
  async list(@Req() req, @Query('unreadOnly') unreadOnly?: string) {
    const items = await this.notificationsService.listForUser(req.user.userId, {
      unreadOnly: unreadOnly === '1' || unreadOnly === 'true',
    });
    return items.map((n) => {
      const json = n.toJSON() as Record<string, unknown>;
      return {
        ...json,
        _id: String(n._id),
        user: String(n.user),
      };
    });
  }

  @Get('unread-count')
  async unread(@Req() req) {
    const count = await this.notificationsService.unreadCount(req.user.userId);
    return { count };
  }

  @Patch('read-all')
  async readAll(@Req() req) {
    await this.notificationsService.markAllRead(req.user.userId);
    return { success: true };
  }

  @Delete()
  async clear(@Req() req) {
    await this.notificationsService.clearAll(req.user.userId);
    return { success: true };
  }

  @Patch(':id/read')
  async read(@Req() req, @Param('id') id: string) {
    await this.notificationsService.markRead(req.user.userId, id);
    return { success: true };
  }

  @Delete(':id')
  async dismiss(@Req() req, @Param('id') id: string) {
    await this.notificationsService.dismiss(req.user.userId, id);
    return { success: true };
  }

  /**
   * Accept the invitation referenced by an `invitation_received`
   * notification. Mirrors the public token-based accept flow but is
   * driven by notification id from inside the dashboard.
   */
  @Post(':id/accept')
  async accept(@Req() req, @Param('id') id: string) {
    const { invitationId } = await this.notificationsService.resolveInvitationNotification(
      req.user.userId,
      id,
    );
    const team = await this.teamsService.acceptInvitationById(
      invitationId,
      req.user.userId,
    );
    // Mark the originating notification as read so the badge clears.
    await this.notificationsService.markRead(req.user.userId, id);
    return { teamId: String(team._id), name: team.name };
  }

  @Post(':id/decline')
  async decline(@Req() req, @Param('id') id: string) {
    const { invitationId } = await this.notificationsService.resolveInvitationNotification(
      req.user.userId,
      id,
    );
    await this.teamsService.declineInvitationById(
      invitationId,
      req.user.userId,
    );
    await this.notificationsService.markRead(req.user.userId, id);
    return { success: true };
  }
}
