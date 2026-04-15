import { Document, Types } from 'mongoose';
export type ProjectDocument = Project & Document;
export declare enum ProjectStatus {
    CRAWL = "crawl",
    TESTING = "testing",
    COMPLETED = "completed"
}
export declare class Project {
    name: string;
    url: string;
    owner: Types.ObjectId;
    status: ProjectStatus;
    environment?: string;
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    duration?: string;
    members: Types.ObjectId[];
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any, {}> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Project> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
