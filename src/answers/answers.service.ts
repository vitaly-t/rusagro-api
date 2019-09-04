import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnswersService {
  constructor(private readonly db: DbService) {
  }

  private getAnsCountTotal(answer): number {
    let res = 0;
    Object.keys(answer).forEach(zone => {
      answer[zone].panels.forEach(panel => {
        if (Object.values(panel.questions).find((q: any) => q.t === 'radiogroup')) {
          res++;
        }
      });
    });
    return res;
  }

  private getQCountTotal(question): number {
    let res = 0;
    question.pages.forEach(zone => {
      zone.elements.forEach(panel => {
        if (Object.values(panel.elements).find((q: any) => q.type === 'radiogroup')) {
          res++;
        }
      });
    });
    return res;
  }

  private getQCountByZone(question) {
    const res = {};
    question.pages.forEach(zone => {
      res[zone.name] = zone.elements.length;
    });
    return res;
  }

  private getCorrAnsCountByZone(answer) {
    const res = {};
    Object.keys(answer).forEach(zone => {
      let count = 0;
      answer[zone].panels.forEach(panel => {
        if (Object.values(panel.questions).find((q: any) => q.t === 'radiogroup' && (q.a === '1' || q.a === '2'))) {
          count++;
        }
      });
      res[zone] = count;
    });
    return res;
  }

  async findAll(userId: number) {
    const query = `select
    a.id               as "answerId",
    m.id               as "machineId",
    m.inventory_number as "inventoryNumber",
    m2.brand, t.type,
    date_created       as "dateCreated",
    a.answer, q.question
    from answers a
    join machines m on m.id = a.machine_id
    join machine_brands m2 on m.brand_id = m2.id
    join machine_types t on m.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    where user_id = $1`;
    const dbres = await this.db.find(query, [userId]);
    dbres.forEach((row: any) => {
      row.ansCount = this.getAnsCountTotal(row.answer);
      row.qCount = this.getQCountTotal(row.question);
      row.qCountByZone = this.getQCountByZone(row.question);
      row.corrCountByZone = this.getCorrAnsCountByZone(row.answer);
      row.corrCount = Object.values(this.getCorrAnsCountByZone(row.answer)).reduce((ac: any, v: any) => ac + v, 0);
      delete row.answer;
      delete row.question;
    });
    return dbres;
  }

  async createAnswer(userId: number, machineId: number, files: any[]) {
    return await this.db.createAsnwer(userId, machineId, files);
  }
}
