import { Module } from '@nestjs/common';
import { MailerModule } from '@nest-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'ostinmail111@gmail.com',
          pass: 'mailmailmail',
        },
      },
      defaults: {
        from: 'ostinmail111@google.com',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
}
