import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class LogService {
  constructor(private readonly db: DbService) {
  }

  async sendLog(log) {
    const query = 'insert into logs (log) values ($1)';
    return await this.db.none(query, [log]);
  }
}
