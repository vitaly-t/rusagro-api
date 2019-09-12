import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class EmailsService {
  constructor(private db: DbService) {
  }

  private readonly table = 'emails_for_distribution';

  async findAll() {
    const query = `select * from ${this.table} where disabled = false`;
    return await this.db.find(query, []);
  }

  async findAllInArray() {
    const query = `select array(select (email) from ${this.table} where disabled = false)`;
    return await this.db.findOne(query, []);
  }

  async delete(emailId: number) {
    const query = `update ${this.table}
    set disabled = true where id = $1 returning id`;
    return await this.db.findOne(query, [emailId]);
  }

  async update(emailId: number, email: string) {
    const query = `update ${this.table} set email = $1 where id = $2 returning *`;
    return await this.db.findOne(query, [email, emailId]);
  }

  async create(email: string) {
    const query = `insert into ${this.table} (email) values ($1) returning *`;
    return await this.db.findOne(query, [email]);
  }
}
