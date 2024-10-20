import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerDto } from './dto/mailer.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(private configService: ConfigService) {}

  emailTransport() {
    return nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.getOrThrow<number>('SMTP_PORT'),
      secure: this.configService.getOrThrow<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async send(mailerDto: MailerDto) {
    const transport = this.emailTransport();
    const options: nodemailer.SendMailOptions = {
      from: this.configService.getOrThrow<string>('SMTP_FROM'),
      to: mailerDto.recipients.join(', '),
      subject: mailerDto.subject,
      html: mailerDto.html,
    };

    if (mailerDto.text) {
      options.text = mailerDto.text;
    }

    const sent = await transport.sendMail(options);
    if (!sent) {
      throw new Error('Error sending email');
    }
    return true;
  }
}
