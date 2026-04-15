import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum AccountType {
    INDIVIDUAL = "individual",
    ENTERPRISE = "enterprise"
}
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    accountType: AccountType;
    companyName?: string;
    isGoogleUser: boolean;
    googleId?: string;
    avatar?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    themePreference: string;
    languagePreference: string;
    onboardingCompleted: boolean;
    isActive: boolean;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
