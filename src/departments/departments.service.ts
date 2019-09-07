import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly db: DbService) {
  }

  async findAll() {
    const query = `select * from production_departments`;
    return await this.db.find(query);
  }
}
