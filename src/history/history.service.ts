import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class HistoryService {
  constructor(private readonly db: DbService) {
  }

  async findHistory(brandId: any) {
    const query = `select mb.brand, m2.inventory_number, m2.plate_number,
    array_agg(
      json_build_object(
        'answerId', a.id, 'answer', a.answer, 'dateCreated', a.date_created,
        'quiz', q.quiz, 'question', q.question
        )
    ) as "answers"
    from answers a
    join machines m2 on a.machine_id = m2.id
    join machine_brands mb on m2.brand_id = mb.id
    join machine_types t on m2.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    where mb.id = $1
    group by brand, inventory_number, plate_number`;
    const query1 = `select s.brand,
    s.inventory_number, s.plate_number,
    array_agg( json_build_object(
          'answerId', a.id, 'answer', a.answer, 'dateCreated', a.date_created,
          'quiz', q.quiz, 'question', q.question
      ) ) as "answers"
      from answers a
      join sss s on s.id = a.sss_id
      join machine_types t on s.type_id = t.id
      join quizzes q on t.id = q.machine_type_id
      where s.brand = $1
      group by brand, inventory_number, plate_number`;
    return await this.db.findOne(query1, [brandId]);
  }

  async findOne(answerId: number) {
    const query = `select a.id as "answerId", a.answer, mb.id as "brandId",
    a.date_created as "dateCreated", q.quiz, q.question, mb.brand,
    m2.plate_number as "plateNumber", m2.inventory_number as "inventoryNumber"
    from answers a
    join machines m2 on a.machine_id = m2.id
    join machine_types t on m2.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    join machine_brands mb on m2.brand_id = mb.id
    where a.id = $1`;
    const query1 = `select
    a.id                as "answerId",
    a.answer,
    a.date_created      as "dateCreated",
    q.quiz,
    q.question,
    s.brand,
    s.plate_number     as "plateNumber",
    s.inventory_number as "inventoryNumber"
    from answers a
    join sss s on s.id = a.sss_id
    join machine_types t on s.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    where a.id = $1`;
    return await this.db.findOne(query1, [answerId]);
  }
}
