import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { AnswersModule } from './answers/answers.module';
import { DepartmentsModule } from './departments/departments.module';
import { MachinesModule } from './machines/machines.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DbModule,
    AnswersModule,
    DepartmentsModule,
    MachinesModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
