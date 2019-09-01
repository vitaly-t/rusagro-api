import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
  }

  async sendMail(to: string, text: string): Promise<any> {
    return await this.mailerService.sendMail({
      from: 'ostinmail111@google.com',
      to,
      subject: 'rusagro checklists',
      text,
    });
  }
}
