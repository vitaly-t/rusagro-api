import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class EmailsService {
  constructor(private db: DbService) {
  }

  async findAll() {
    const query = 'select * from emails where disabled = false';
    return await this.db.findOne(query, []);
  }

  async findAllInArray() {
    const query = 'select array(select (email) from emails_for_distribution where disabled = false)';
    return await this.db.findOne(query, []);
  }
}
