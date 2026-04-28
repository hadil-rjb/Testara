import { Document, Types } from 'mongoose';
import { TeamRole } from './team.schema';
export type InvitationDocument = Invitation & Document;
export declare enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REVOKED = "revoked",
    EXPIRED = "expired"
}
export declare class Invitation {
    team: Types.ObjectId;
    email: string;
    role: TeamRole;
    status: InvitationStatus;
    token: string;
    invitedBy: Types.ObjectId;
    expiresAt: Date;
    acceptedAt?: Date;
    acceptedBy?: Types.ObjectId;
}
export declare const InvitationSchema: import("mongoose").Schema<Invitation, import("mongoose").Model<Invitation, any, any, any, Document<unknown, any, Invitation, any, {}> & Invitation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invitation, Document<unknown, {}, import("mongoose").FlatRecord<Invitation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Invitation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
