import { Model } from 'mongoose';
import { ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/project.dto';
export declare class ProjectsService {
    private projectModel;
    constructor(projectModel: Model<ProjectDocument>);
    create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectDocument>;
    findAllByUser(userId: string): Promise<ProjectDocument[]>;
    findById(id: string): Promise<ProjectDocument>;
    delete(id: string, userId: string): Promise<void>;
}
