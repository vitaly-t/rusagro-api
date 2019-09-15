import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly db: DbService) {
  }

  async getAll() {
    const query = 'select * from quizzes';
    return await this.db.find(query, []);
  }
}
