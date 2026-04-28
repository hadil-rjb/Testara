import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Team, TeamDocument } from '../teams/schemas/team.schema';

/** Safely coerce a string / ObjectId to Types.ObjectId. */
function toObjectId(id: unknown): Types.ObjectId | null {
  if (!id) return null;
  if (id instanceof Types.ObjectId) return id;
  const s = String(id);
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const ownerId = toObjectId(userId);
    const project = new this.projectModel({
      ...createProjectDto,
      owner: ownerId ?? userId,
      members: ownerId ? [ownerId] : [userId],
    });
    return project.save();
  }

  /**
   * Returns every project the user can see with annotations describing HOW
   * they got access:
   *   - accessSource: 'owner' | 'team' | 'member'
   *   - sharedViaTeam?: string   // team name when accessSource === 'team'
   *
   * Projects the user owns are returned alongside projects shared with them
   * via any team they belong to.
   */
  async findAllByUser(userId: string): Promise<Record<string, unknown>[]> {
    const uid = toObjectId(userId);
    if (!uid) return [];

    // Build a map of projectId -> teamName for every team this user belongs to.
    const teams = await this.teamModel
      .find({ 'members.user': uid })
      .select('name projects')
      .lean();

    const projectToTeam = new Map<string, string>();
    for (const team of teams) {
      for (const pid of team.projects ?? []) {
        // First team wins if a project happens to be shared by multiple teams.
        const key = String(pid);
        if (!projectToTeam.has(key)) {
          projectToTeam.set(key, team.name);
        }
      }
    }
    const teamProjectIds = Array.from(projectToTeam.keys())
      .map((id) => toObjectId(id))
      .filter((v): v is Types.ObjectId => v !== null);

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
      const json = doc.toJSON() as Record<string, unknown>;
      const ownerField = json.owner as
        | { _id?: unknown; firstName?: string; lastName?: string }
        | string
        | undefined;
      const ownerId =
        typeof ownerField === 'object' && ownerField !== null
          ? String(ownerField._id ?? '')
          : String(ownerField ?? '');

      const sharedViaTeam = projectToTeam.get(String(doc._id));
      let accessSource: 'owner' | 'team' | 'member';
      if (ownerId === String(uid)) accessSource = 'owner';
      else if (sharedViaTeam) accessSource = 'team';
      else accessSource = 'member';

      return {
        ...json,
        _id: String(doc._id),
        accessSource,
        sharedViaTeam: accessSource === 'team' ? sharedViaTeam : undefined,
      };
    });
  }

  async findById(id: string): Promise<ProjectDocument> {
    const oid = toObjectId(id);
    if (!oid) throw new NotFoundException('Projet non trouvé');
    const project = await this.projectModel
      .findById(oid)
      .populate('owner', 'firstName lastName avatar');
    if (!project) throw new NotFoundException('Projet non trouvé');
    return project;
  }

  async update(
    id: string,
    userId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const oid = toObjectId(id);
    const uid = toObjectId(userId);
    if (!oid || !uid) throw new NotFoundException('Projet non trouvé');
    const project = await this.projectModel
      .findOneAndUpdate(
        { _id: oid, owner: uid },
        { $set: updateProjectDto },
        { new: true },
      )
      .populate('owner', 'firstName lastName avatar');
    if (!project) throw new NotFoundException('Projet non trouvé');
    return project;
  }

  async delete(id: string, userId: string): Promise<void> {
    const oid = toObjectId(id);
    const uid = toObjectId(userId);
    if (!oid || !uid) throw new NotFoundException('Projet non trouvé');
    const project = await this.projectModel.findOneAndDelete({
      _id: oid,
      owner: uid,
    });
    if (!project) throw new NotFoundException('Projet non trouvé');
  }
}
