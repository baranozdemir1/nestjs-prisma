import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, MailerService],
  exports: [UserService],
})
export class UserModule {}
