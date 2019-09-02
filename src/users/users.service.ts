import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {
  }

  async findOne(id: string) {
    const q = `select id, username, first_name as "firstName",
    last_name as "lastName", email, phone
    from users where id = $1 and disabled = false`;
    return await this.db.findOne(q, [id]);
  }

  async findAll() {
    return await this.db.find('select * from users where disabled = false', []);
  }

  async findOneFull(username: string) {
    return await this.db.findOne('select * from users where username = $1 and disabled = false', [username]);
  }
}
