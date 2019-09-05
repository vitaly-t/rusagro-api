import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class HistoryService {
  constructor(private readonly db: DbService) {
  }

  async findOne(brandId: number) {
    const query = `select mb.brand, m2.inventory_number, m2.plate_number,
    array_agg(
      json_build_object(
        'answerId', a.id, 'answer', a.answer, 'dateCreated', a.date_created
        )
    ) as "answers"
    from answers a
    join machines m2 on a.machine_id = m2.id
    join machine_brands mb on m2.brand_id = mb.id
    where mb.id = 1
    group by brand, inventory_number, plate_number`;
    return await this.db.findOne(query, [brandId]);
  }
}
