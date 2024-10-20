import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { RegisterDto } from '../auth/dto/register.dto';
import { Helper } from '../utils/helper';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: RegisterDto) {
    const userExists = await this.databaseService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userExists) throw new NotFoundException('User already exists');

    const verificationToken = Helper.generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.mailerService.send({
      recipients: [createUserDto.email],
      subject: 'Verify your email',
      html: `<p>Click <a href="http://localhost:3000/auth/verify/${verificationToken}">here</a> to verify your email</p>`,
    });

    const user = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
        verificationToken,
        verificationTokenExpires,
      },
    });

    return Helper.exclude(user, [
      'password',
      'refreshToken',
      'resetPasswordToken',
      'resetPasswordExpires',
      'verificationTokenExpires',
      'verificationToken',
    ]);
  }

  async findAll() {
    const users = await this.databaseService.user.findMany();
    if (!users) throw new NotFoundException('No users found');

    for (const user of users) {
      delete user.password;
    }

    return users;
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // @todo: Implement email verification
    // if (!user.isVerified) throw new UnauthorizedException('User not verified');

    return Helper.exclude(user, ['password']);
  }

  update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
