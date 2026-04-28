import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, OnboardingDto, ChangePasswordDto, SwitchAccountTypeDto } from './dto/create-user.dto';
import { AccountType } from './schemas/user.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }): Promise<UserDocument> {
    let user = await this.userModel.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await this.userModel.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.googleId;
        user.isGoogleUser = true;
        if (profile.avatar) user.avatar = profile.avatar;
        await user.save();
      } else {
        user = await this.userModel.create({
          ...profile,
          isGoogleUser: true,
        });
      }
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    // If email is being changed, ensure it is not already in use by another account
    if (updateUserDto.email) {
      const normalized = updateUserDto.email.toLowerCase();
      const existing = await this.userModel.findOne({ email: normalized });
      if (existing && String(existing._id) !== String(id)) {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }
      updateUserDto.email = normalized;
    }
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.isGoogleUser && !user.password) {
      throw new BadRequestException(
        'Les comptes Google ne peuvent pas modifier leur mot de passe ici',
      );
    }
    const valid = user.password
      ? await bcrypt.compare(dto.currentPassword, user.password)
      : false;
    if (!valid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    user.password = await bcrypt.hash(dto.newPassword, 12);
    await user.save();
  }

  async switchAccountType(id: string, dto: SwitchAccountTypeDto): Promise<UserDocument> {
    if (dto.accountType === AccountType.ENTERPRISE && !dto.companyName?.trim()) {
      throw new BadRequestException(
        "Le nom de l'entreprise est requis pour un compte entreprise",
      );
    }

    // Downgrading to Individual: permanently delete all teams owned by this user.
    // This matches the confirmation shown in the frontend before the call is made.
    if (dto.accountType === AccountType.INDIVIDUAL) {
      await this.teamModel.deleteMany({ owner: id });
    }

    const update: Partial<User> = {
      accountType: dto.accountType,
      companyName:
        dto.accountType === AccountType.ENTERPRISE
          ? dto.companyName?.trim()
          : undefined,
    };
    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async completeOnboarding(id: string, onboardingDto: OnboardingDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        accountType: onboardingDto.accountType,
        companyName: onboardingDto.accountType === AccountType.ENTERPRISE ? onboardingDto.companyName : undefined,
        onboardingCompleted: true,
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new NotFoundException('Token invalide ou expiré');

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
