import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerDto } from './dto/mailer.dto';

@Injectable()
export class MailerService {
  emailTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(mailerDto: MailerDto) {
    const transport = this.emailTransport();
    const options: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM,
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
