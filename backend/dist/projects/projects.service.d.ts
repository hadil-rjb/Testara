import { Model } from 'mongoose';
import { ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { TeamDocument } from '../teams/schemas/team.schema';
export declare class ProjectsService {
    private projectModel;
    private teamModel;
    constructor(projectModel: Model<ProjectDocument>, teamModel: Model<TeamDocument>);
    create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectDocument>;
    findAllByUser(userId: string): Promise<Record<string, unknown>[]>;
    findById(id: string): Promise<ProjectDocument>;
    update(id: string, userId: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument>;
    delete(id: string, userId: string): Promise<void>;
}
