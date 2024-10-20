import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { Response } from 'express';
import { TokenPayload } from '../interface/token-payload.interface';
import { Helper } from '../utils/helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(user: User, response: Response, redirect = false) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    await this.userService.update(user.id, {
      refreshToken: await hash(refreshToken, 10),
    });

    response.cookie('Authentication', accessToken, {
      expires: expiresAccessToken,
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });
    response.cookie('Refresh', refreshToken, {
      expires: expiresRefreshToken,
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    if (redirect) {
      response.redirect(
        this.configService.getOrThrow<string>('AUTH_REDIRECT_URL') || '/',
      );
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

    return Helper.exclude(user, ['password']);
  }

  async validateUserRefreshToken(refreshToken: string, userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !(await compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(registerDto: Prisma.UserCreateInput) {
    const user = await this.userService.create(registerDto);

    if (!user) throw new UnauthorizedException('User not created');

    return {
      success: true,
      message: 'User created successfully',
    };
  }
}
