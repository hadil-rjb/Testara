import { AccountType } from '../../users/schemas/user.schema';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountType?: AccountType;
    companyName?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
