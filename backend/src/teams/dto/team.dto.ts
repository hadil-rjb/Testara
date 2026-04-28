import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TeamRole } from '../schemas/team.schema';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(TeamRole)
  role: TeamRole;
}

export class UpdateMemberRoleDto {
  @IsEnum(TeamRole)
  role: TeamRole;
}

export class SetProjectAccessDto {
  @IsArray()
  @IsMongoId({ each: true })
  projectIds: string[];
}

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(TeamRole)
  role: TeamRole;
}
