import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    // try {
    //   LoginSchema.parse({ email, password });
    // } catch (error) {
    //   console.log('LocalStrategy.validate.error', error);
    //   if (error instanceof ZodError) {
    //     throw new BadRequestException({
    //       message: error.errors.map((err) => err.message),
    //       error: 'Bad Request',
    //       statusCode: 400,
    //     });
    //   }
    //   throw error;
    // }

    return this.authService.verify(email, password);
  }
}
