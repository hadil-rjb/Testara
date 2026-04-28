import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, OnboardingDto, ChangePasswordDto, SwitchAccountTypeDto } from './dto/create-user.dto';
import { TeamDocument } from '../teams/schemas/team.schema';
export declare class UsersService {
    private userModel;
    private teamModel;
    constructor(userModel: Model<UserDocument>, teamModel: Model<TeamDocument>);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument>;
    findOrCreateGoogleUser(profile: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    }): Promise<UserDocument>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>;
    changePassword(id: string, dto: ChangePasswordDto): Promise<void>;
    switchAccountType(id: string, dto: SwitchAccountTypeDto): Promise<UserDocument>;
    completeOnboarding(id: string, onboardingDto: OnboardingDto): Promise<UserDocument>;
    setResetToken(email: string, token: string, expires: Date): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
