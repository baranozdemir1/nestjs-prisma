import {
  Body,
  Controller,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UnauthorizedFilter } from '../unauthorized/unauthorized.filter';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseFilters(UnauthorizedFilter)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.login(user, response);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log('registerDto', registerDto);
    // return await this.authService.register(registerDto);
  }
}
