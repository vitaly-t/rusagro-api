import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { MailModule } from '../core/mail/mail.module';
import { XlsModule } from '../core/xls/xls.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [MailModule, XlsModule, EmailsModule],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {
}
