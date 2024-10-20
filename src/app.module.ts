import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailerService } from './mailer/mailer.service';

@Module({
  imports: [DatabaseModule, ProductModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, MailerService],
})
export class AppModule {}
