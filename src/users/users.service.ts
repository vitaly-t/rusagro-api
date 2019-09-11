import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { User } from './user.interface';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {
  }

  private getHash(pw) {
    const salt = crypto.randomBytes(64).toString('base64');
    const passHash = crypto.pbkdf2Sync(pw, salt, 1, 64, 'sha1').toString('base64');
    return salt + passHash;
  }

  async findOne(id: number): Promise<User> {
    return await this.db.getUserById(id);
  }

  async findAll() {
    return await this.db.find(
      `select id, username, email, first_name as "firstName", last_name as "lastName", phone from users where disabled = false`,
      []
    );
  }

  async findOneFull(username: string) {
    const query = `select id, username, password, first_name as "firstName",
    last_name as "lastName", email, phone
    from users where username = $1 and disabled = false`;
    return await this.db.findOne(query, [username]);
  }

  createUser(userObj) {
    const query = `insert into users 
    (username, password, email, first_name, last_name, phone) 
    values ($1, $2, $3, $4, $5, $6) 
    returning id, username, email, first_name as "firstName", last_name as "lastName", phone`;
    return this.db.findOne(query,
      [userObj.username, this.getHash(userObj.newPassword), userObj.email, userObj.firstName, userObj.lastName, userObj.phone]
    );
  }

  async updateUser(userObj, id) {
    await this.db.none(`update users set 
      username = $1, 
      email = $2, 
      first_name = $3, 
      last_name = $4, 
      phone = $5
      WHERE id = $6`, 
      [userObj.username, userObj.email, userObj.firstName, userObj.lastName, userObj.email, id]
    );
    const newPassword = userObj.newPassword;
    if (newPassword) {
      await this.db.none(`UPDATE users SET "password" = $1 WHERE id = $2`, [this.getHash(newPassword), id]);
    }
  }

  disableUser(id) {
    // TODO: throw error if no rows affected
    const query = `update users set disabled = true where id = $1`;
    return this.db.none(query, [id]);
  }
}
