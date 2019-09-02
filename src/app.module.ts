import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DbModule,
  ],
  controllers: [AppController],
})
export class AppModule {
}
