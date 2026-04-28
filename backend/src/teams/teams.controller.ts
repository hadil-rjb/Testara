import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  CreateTeamDto,
  InviteMemberDto,
  SetProjectAccessDto,
  UpdateMemberRoleDto,
  UpdateTeamDto,
} from './dto/team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.teamsService.findAllByOwner(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.teamsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.teamsService.remove(id, req.user.userId);
  }

  // Members (post-acceptance management)
  @Patch(':id/members/:memberId')
  updateMemberRole(
    @Req() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(id, req.user.userId, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Req() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeMember(id, req.user.userId, memberId);
  }

  // Invitations
  @Post(':id/invitations')
  invite(@Req() req, @Param('id') id: string, @Body() dto: InviteMemberDto) {
    return this.teamsService.inviteMember(id, req.user.userId, dto);
  }

  @Get(':id/invitations')
  listInvitations(@Req() req, @Param('id') id: string) {
    return this.teamsService.listInvitations(id, req.user.userId);
  }

  @Delete(':id/invitations/:invitationId')
  revokeInvitation(
    @Req() req,
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.teamsService.revokeInvitation(id, req.user.userId, invitationId);
  }

  @Post(':id/invitations/:invitationId/resend')
  resendInvitation(
    @Req() req,
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.teamsService.resendInvitation(id, req.user.userId, invitationId);
  }

  // Project access
  @Put(':id/projects')
  setProjectAccess(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: SetProjectAccessDto,
  ) {
    return this.teamsService.setProjectAccess(id, req.user.userId, dto);
  }
}
