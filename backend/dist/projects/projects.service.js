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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
function toObjectId(id) {
    if (!id)
        return null;
    if (id instanceof mongoose_2.Types.ObjectId)
        return id;
    const s = String(id);
    return mongoose_2.Types.ObjectId.isValid(s) ? new mongoose_2.Types.ObjectId(s) : null;
}
let ProjectsService = class ProjectsService {
    constructor(projectModel, teamModel) {
        this.projectModel = projectModel;
        this.teamModel = teamModel;
    }
    async create(createProjectDto, userId) {
        const ownerId = toObjectId(userId);
        const project = new this.projectModel({
            ...createProjectDto,
            owner: ownerId ?? userId,
            members: ownerId ? [ownerId] : [userId],
        });
        return project.save();
    }
    async findAllByUser(userId) {
        const uid = toObjectId(userId);
        if (!uid)
            return [];
        const teams = await this.teamModel
            .find({ 'members.user': uid })
            .select('name projects')
            .lean();
        const projectToTeam = new Map();
        for (const team of teams) {
            for (const pid of team.projects ?? []) {
                const key = String(pid);
                if (!projectToTeam.has(key)) {
                    projectToTeam.set(key, team.name);
                }
            }
        }
        const teamProjectIds = Array.from(projectToTeam.keys())
            .map((id) => toObjectId(id))
            .filter((v) => v !== null);
        const docs = await this.projectModel
            .find({
            $or: [
                { owner: uid },
                { members: uid },
                { _id: { $in: teamProjectIds } },
            ],
        })
            .populate('owner', 'firstName lastName email avatar')
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => {
            const json = doc.toJSON();
            const ownerField = json.owner;
            const ownerId = typeof ownerField === 'object' && ownerField !== null
                ? String(ownerField._id ?? '')
                : String(ownerField ?? '');
            const sharedViaTeam = projectToTeam.get(String(doc._id));
            let accessSource;
            if (ownerId === String(uid))
                accessSource = 'owner';
            else if (sharedViaTeam)
                accessSource = 'team';
            else
                accessSource = 'member';
            return {
                ...json,
                _id: String(doc._id),
                accessSource,
                sharedViaTeam: accessSource === 'team' ? sharedViaTeam : undefined,
            };
        });
    }
    async findById(id) {
        const oid = toObjectId(id);
        if (!oid)
            throw new common_1.NotFoundException('Projet non trouvé');
        const project = await this.projectModel
            .findById(oid)
            .populate('owner', 'firstName lastName avatar');
        if (!project)
            throw new common_1.NotFoundException('Projet non trouvé');
        return project;
    }
    async update(id, userId, updateProjectDto) {
        const oid = toObjectId(id);
        const uid = toObjectId(userId);
        if (!oid || !uid)
            throw new common_1.NotFoundException('Projet non trouvé');
        const project = await this.projectModel
            .findOneAndUpdate({ _id: oid, owner: uid }, { $set: updateProjectDto }, { new: true })
            .populate('owner', 'firstName lastName avatar');
        if (!project)
            throw new common_1.NotFoundException('Projet non trouvé');
        return project;
    }
    async delete(id, userId) {
        const oid = toObjectId(id);
        const uid = toObjectId(userId);
        if (!oid || !uid)
            throw new common_1.NotFoundException('Projet non trouvé');
        const project = await this.projectModel.findOneAndDelete({
            _id: oid,
            owner: uid,
        });
        if (!project)
            throw new common_1.NotFoundException('Projet non trouvé');
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(1, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map