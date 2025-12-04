import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserResponseDto, LoginResponseDto } from '@repo/dtos';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy,
  ) {}

  async onModuleInit() {
    console.log('🔌 [AuthService] Connecting to RabbitMQ...');
    await this.emailClient.connect();
    console.log('✅ [AuthService] Connected to RabbitMQ successfully');
  }

  async onModuleDestroy() {
    console.log('🔌 [AuthService] Disconnecting from RabbitMQ...');
    await this.emailClient.close();
  }

  async login(user: any): Promise<LoginResponseDto> {
    const findUserByEmail = await this.usersService.findOne({
      email: user.email,
    });
    if (!findUserByEmail) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      findUserByEmail.id,
      findUserByEmail.email,
    );
    await this.updateRefreshToken(findUserByEmail.id, tokens.refreshToken);
    return new LoginResponseDto(
      new UserResponseDto(findUserByEmail),
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { currentRefreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne({ id: userId });
    if (!user || !user.currentRefreshToken)
      throw new ForbiddenException('Access Denied');

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    );
    if (!tokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { currentRefreshToken: hash });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
            '15m') as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: (this.configService.get<string>(
            'JWT_REFRESH_EXPIRES_IN',
          ) || '7d') as any,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    console.log(`🔍 [ForgotPassword] Searching for user with email: ${email}`);

    const user = await this.usersService.findOne({ email });

    // Don't reveal if user exists for security reasons
    if (!user) {
      console.log(`⚠️  [ForgotPassword] User not found with email: ${email}`);
      return;
    }

    console.log(
      `✅ [ForgotPassword] User found: ${user.username} (${user.id})`,
    );

    // Generate reset token
    const resetToken = randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log(`🔑 [ForgotPassword] Generated reset token: ${resetToken}`);
    console.log(
      `⏰ [ForgotPassword] Token expires at: ${resetTokenExpiry.toISOString()}`,
    );

    try {
      // Save token to database
      const updateResult = await this.usersService.update(user.id, {
        resetToken,
        resetTokenExpiry,
      });

      console.log(`💾 [ForgotPassword] Database update result:`, updateResult);

      // Emit event for email service
      this.emailClient.emit('password_reset_requested', {
        email: user.email,
        resetToken,
        username: user.username,
      });

      console.log(
        `📨 [ForgotPassword] Event emitted to RabbitMQ for email: ${email}`,
      );
      console.log(`🔑 Password reset requested for: ${email}`);
    } catch (error) {
      console.error(`❌ [ForgotPassword] Error during password reset:`, error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findOne({ resetToken: token });

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    console.log(`✅ Password reset successfully for user: ${user.email}`);
  }
}
