import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, OnboardingDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user.toObject();
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user.toObject();
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/onboarding')
  async completeOnboarding(@Req() req, @Body() onboardingDto: OnboardingDto) {
    const user = await this.usersService.completeOnboarding(req.user.userId, onboardingDto);
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user.toObject();
    return result;
  }
}
