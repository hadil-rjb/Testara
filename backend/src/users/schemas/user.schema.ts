import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum AccountType {
  INDIVIDUAL = 'individual',
  ENTERPRISE = 'enterprise',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ enum: AccountType, default: AccountType.INDIVIDUAL })
  accountType: AccountType;

  @Prop()
  companyName?: string;

  @Prop({ default: false })
  isGoogleUser: boolean;

  @Prop()
  googleId?: string;

  @Prop()
  avatar?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: 'light' })
  themePreference: string;

  @Prop({ default: 'fr' })
  languagePreference: string;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
