import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { TokenPayload } from '../../interface/token-payload.interface';
import { UserService } from '../../user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    return this.userService.findOne(payload.userId);
  }
}
