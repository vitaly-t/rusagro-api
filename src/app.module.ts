import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { AnswersModule } from './answers/answers.module';
import { DepartmentsModule } from './departments/departments.module';
import { MachinesModule } from './machines/machines.module';
import { HistoryModule } from './history/history.module';
import { ImagesModule } from './images/images.module';
import { EmailsModule } from './emails/emails.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DbModule,
    AnswersModule,
    DepartmentsModule,
    MachinesModule,
    HistoryModule,
    ImagesModule,
    EmailsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
