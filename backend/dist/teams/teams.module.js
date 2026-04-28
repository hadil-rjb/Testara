"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const teams_controller_1 = require("./teams.controller");
const invitations_controller_1 = require("./invitations.controller");
const teams_service_1 = require("./teams.service");
const team_schema_1 = require("./schemas/team.schema");
const invitation_schema_1 = require("./schemas/invitation.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const mail_module_1 = require("../mail/mail.module");
let TeamsModule = class TeamsModule {
};
exports.TeamsModule = TeamsModule;
exports.TeamsModule = TeamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: invitation_schema_1.Invitation.name, schema: invitation_schema_1.InvitationSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
            ]),
            mail_module_1.MailModule,
        ],
        controllers: [teams_controller_1.TeamsController, invitations_controller_1.InvitationsController],
        providers: [teams_service_1.TeamsService],
        exports: [teams_service_1.TeamsService],
    })
], TeamsModule);
//# sourceMappingURL=teams.module.js.map