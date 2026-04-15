import { AccountType } from '../schemas/user.schema';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountType?: AccountType;
    companyName?: string;
}
export declare class OnboardingDto {
    accountType: AccountType;
    companyName?: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    themePreference?: string;
    languagePreference?: string;
    avatar?: string;
}
