"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsController = void 0;
const common_1 = require("@nestjs/common");
const teams_service_1 = require("./teams.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InvitationsController = class InvitationsController {
    constructor(teamsService) {
        this.teamsService = teamsService;
    }
    async preview(token) {
        const { invitation, teamName, inviterName, hasAccount, effectiveStatus, } = await this.teamsService.getInvitationByToken(token);
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
    async accept(req, token) {
        const team = await this.teamsService.acceptInvitation(token, req.user.userId);
        return { teamId: team._id, name: team.name };
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(':token/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "accept", null);
exports.InvitationsController = InvitationsController = __decorate([
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [teams_service_1.TeamsService])
], InvitationsController);
//# sourceMappingURL=invitations.controller.js.map