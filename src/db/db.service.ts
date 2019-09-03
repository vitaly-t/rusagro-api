import { Injectable } from '@nestjs/common';
import * as pgPromise from 'pg-promise';
import { User } from '../users/user.interface';

@Injectable()
export class DbService {
  private readonly pgp = pgPromise();
  private readonly connection = 'postgres://qxelholmaeucta:1e52fa294d8130cfdeb98c5619dfb8235280c683ef859f2d3090da2b555ddfb7@ec2-54-246-121-32.eu-west-1.compute.amazonaws.com:5432/d3h6k1kepkg9hd?ssl=true';
  private readonly db = this.pgp(this.connection);

  async findOne(query: string, values: any[]) {
    return await this.db.one(query, values);
  }

  async find(query: string, values: any[]) {
    return await this.db.any(query, values);
  }

  async getUserById(id: number): Promise<User> {
    const query = `select id, username, first_name as "firstName",
    last_name as "lastName", email, phone
    from users where id = $1 and disabled = false`;
    return await this.db.one(query, [id]);
  }
}
