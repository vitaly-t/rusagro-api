import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { DbService } from '../../db/db.service';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService,
              private readonly db: DbService) {
  }

  async sendMail(to: string[], text: string, attachments?: any[]): Promise<any> {
    return await this.mailerService.sendMail({
      from: 'ostinmail111@google.com',
      to,
      subject: 'rusagro checklists',
      text,
      attachments,
    } as any);
  }

  async findAll() {
    const query = 'select array(select (email) from emails_for_distribution where disabled = false)';
    return await this.db.findOne(query, []);
  }
}
