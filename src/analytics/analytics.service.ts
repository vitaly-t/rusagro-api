import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DbService) {
  }

  findQuizzes() {
    const query = ``;
    return this.db.find(query);
  }
}
