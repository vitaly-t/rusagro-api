import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { MailModule } from '../core/mail/mail.module';
import { XlsModule } from '../core/xls/xls.module';

@Module({
  imports: [MailModule, XlsModule],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {
}
