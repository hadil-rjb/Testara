import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, req: any): Promise<import("./schemas/project.schema").ProjectDocument>;
    findAll(req: any): Promise<Record<string, unknown>[]>;
    findOne(id: string): Promise<import("./schemas/project.schema").ProjectDocument>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<import("./schemas/project.schema").ProjectDocument>;
    remove(id: string, req: any): Promise<void>;
}
