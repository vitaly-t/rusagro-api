import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class EmailsService {
  constructor(private db: DbService) {
  }

  async findAll() {
    const query = 'select * from emails_for_distribution where disabled = false';
    return await this.db.find(query, []);
  }

  async findAllInArray() {
    const query = 'select array(select (email) from emails_for_distribution where disabled = false)';
    return await this.db.findOne(query, []);
  }

  async delete(emailId: number) {
    const query = `update emails_for_distribution
    set disabled = true where id = $1 returning id`;
    return await this.db.findOne(query, [emailId]);
  }
}
