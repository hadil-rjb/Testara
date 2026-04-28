import { UsersService } from './users.service';
import { UpdateUserDto, OnboardingDto, ChangePasswordDto, SwitchAccountTypeDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<any>;
    completeOnboarding(req: any, onboardingDto: OnboardingDto): Promise<any>;
    switchAccountType(req: any, dto: SwitchAccountTypeDto): Promise<any>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<void>;
}
