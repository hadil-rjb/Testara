import { Document, Types } from 'mongoose';
export type TeamDocument = Team & Document;
export declare enum TeamRole {
    TESTER = "tester",
    VIEWER = "viewer"
}
export declare class TeamMember {
    user: Types.ObjectId;
    role: TeamRole;
}
export declare const TeamMemberSchema: import("mongoose").Schema<TeamMember, import("mongoose").Model<TeamMember, any, any, any, Document<unknown, any, TeamMember, any, {}> & TeamMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TeamMember, Document<unknown, {}, import("mongoose").FlatRecord<TeamMember>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TeamMember> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Team {
    name: string;
    description?: string;
    owner: Types.ObjectId;
    members: TeamMember[];
    projects: Types.ObjectId[];
}
export declare const TeamSchema: import("mongoose").Schema<Team, import("mongoose").Model<Team, any, any, any, Document<unknown, any, Team, any, {}> & Team & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Team, Document<unknown, {}, import("mongoose").FlatRecord<Team>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Team> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
