import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, req: any): Promise<import("./schemas/project.schema").ProjectDocument>;
    findAll(req: any): Promise<import("./schemas/project.schema").ProjectDocument[]>;
    findOne(id: string): Promise<import("./schemas/project.schema").ProjectDocument>;
    remove(id: string, req: any): Promise<void>;
}
