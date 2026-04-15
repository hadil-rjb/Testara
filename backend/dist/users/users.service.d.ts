import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, OnboardingDto } from './dto/create-user.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
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
    completeOnboarding(id: string, onboardingDto: OnboardingDto): Promise<UserDocument>;
    setResetToken(email: string, token: string, expires: Date): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
