import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { JwtPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectPinoLogger(JwtStrategy.name)
    private readonly logger: PinoLogger,
    configService: ConfigService,
  ) {
    const secret = configService.getOrThrow<string>('JWT_SECRET');
    logger.info(
      { secretPrefix: secret.substring(0, 10) },
      'JwtStrategy initializing',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    this.logger.info({ payload }, 'JwtStrategy validating payload');
    if (!payload || !payload.sub) {
      this.logger.error({ payload }, 'Invalid JWT payload - missing sub');
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
