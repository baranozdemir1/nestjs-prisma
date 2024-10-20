import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { RegisterDto } from '../auth/dto/register.dto';
import { exclude } from '../utils/helper';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: RegisterDto) {
    const user = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
      },
    });

    return exclude(user, ['password']);
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

    return exclude(user, ['password']);
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
