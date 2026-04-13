import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AccountType } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsString()
  @IsOptional()
  companyName?: string;
}

export class OnboardingDto {
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  @IsOptional()
  companyName?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  themePreference?: string;

  @IsString()
  @IsOptional()
  languagePreference?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
