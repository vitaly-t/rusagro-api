import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { User } from './user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {
  }

  async findOne(id: number): Promise<User> {
    return await this.db.getUserById(id);
  }

  async findAll() {
    return await this.db.find('select * from users where disabled = false', []);
  }

  async findOneFull(username: string) {
    return await this.db.findOne('select * from users where username = $1 and disabled = false', [username]);
  }
}
