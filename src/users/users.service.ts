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
    const query = `select id, username, password, first_name as "firstName",
    last_name as "lastName", email, phone
    from users where id = $1 and disabled = false`;
    return await this.db.findOne(query, [username]);
  }
}
