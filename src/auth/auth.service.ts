import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { Response } from 'express';
import { TokenPayload } from '../interface/token-payload.interface';
import { exclude } from '../utils/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response, redirect = false) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS}ms`,
    });

    await this.userService.update(user.id, {
      refreshToken: await hash(refreshToken, 10),
    });

    response.cookie('Authentication', accessToken, {
      expires: expiresAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    response.cookie('Refresh', refreshToken, {
      expires: expiresRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    if (redirect) {
      response.redirect(process.env.AUTH_REDIRECT_URL || '/');
    }

    return {
      success: true,
      message: 'Login successful',
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // @todo: Implement email verification
    // if (!user.isVerified) {
    //   throw new UnauthorizedException('Email not verified');
    // }

    return exclude(user, ['password']);
  }

  async validateUserRefreshToken(refreshToken: string, userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !(await compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(registerDto: Prisma.UserCreateInput) {
    return this.userService.create(registerDto);
  }
}
