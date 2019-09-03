import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DbModule,
    AnswersModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
