import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendTeamInvitationEmail(
    to: string,
    token: string,
    context: {
      teamName: string;
      inviterName: string;
      role: string;
      isExistingUser: boolean;
    },
  ): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/fr/invite/${token}`;
    const { teamName, inviterName, role, isExistingUser } = context;
    const action = isExistingUser
      ? 'Connectez-vous pour accepter l\'invitation'
      : 'Créez votre compte Testara pour rejoindre l\'équipe';

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to,
      subject: `Testara - Invitation à rejoindre l'équipe "${teamName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6C63FF;">Vous êtes invité à rejoindre ${teamName}</h2>
          <p><strong>${inviterName}</strong> vous invite à rejoindre l'équipe
          <strong>${teamName}</strong> sur Testara en tant que <strong>${role}</strong>.</p>
          <p>${action} :</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Accepter l'invitation
          </a>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 7 jours.</p>
          <p style="color: #666; font-size: 14px;">Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
        </div>
      `,
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to,
      subject: 'Testara - Réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6C63FF;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure.</p>
          <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `,
    });
  }
}
