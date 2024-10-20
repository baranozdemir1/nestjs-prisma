import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { Response } from 'express';
import { TokenPayload } from '../interface/token-payload.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS}ms`,
    });

    response.cookie('Authentication', accessToken, {
      expires: expiresAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    const updatedUser = await this.userService.update(user.id, {
      lastLogin: new Date(),
    });

    delete updatedUser.password;
    return updatedUser;
  }

  async verify(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return user;
  }

  async register(registerDto: Prisma.UserCreateInput) {
    return this.userService.create(registerDto);
  }
}
