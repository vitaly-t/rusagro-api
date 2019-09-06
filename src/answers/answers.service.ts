import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnswersService {
  constructor(private readonly db: DbService) {
  }

  private getAnsCountByZone(answer) {
    const res = {};
    Object.keys(answer).forEach(zone => {
      res[zone] = 0;
      answer[zone].panels.forEach(panel => {
        let cnt = 0;
        Object.keys(panel.questions).forEach(key => {
          cnt += ['0', '1', '2'].includes(panel.questions[key].a) ? 1 : 0;
        });
        if (cnt > 0) {
          res[zone]++;
        }
      });
    });
    return res;
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
      if (zone.name === 'pin') {
        try {
          res += zone.elements[1].elements.length;
        } catch {
          res += 0;
        }
      } else {
        res += zone.elements.length;
      }
      // zone.elements.forEach(panel => {
      //   if (Object.values(panel.elements).find((q: any) => q.type === 'radiogroup')) {
      //     res++;
      //   }
      // });
    });
    return res;
  }

  private getQCountByZone(question) {
    const res = {};
    question.pages.forEach(zone => {
      if (zone.name === 'pin') {
        try {
          res[zone.name] = zone.elements[1].elements.length;
        } catch {
          res[zone.name] = '?';
        }
      } else {
        res[zone.name] = zone.elements.length;
      }
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
    m.plate_number     as "plateNumber",
    m2.brand, t.type,
    m2.id              as "brandId",
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

  async findOne(answerId: number) {
    const query = `select a.id, a.answer, t.type, mb.brand, q.question
    from answers a
    join machines m2 on a.machine_id = m2.id
    join machine_types t on m2.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    join machine_brands mb on m2.brand_id = mb.id
    where a.id = $1`;
    const answer = await this.db.findOne(query, [answerId]);
    answer.ansCount = this.getAnsCountByZone(answer.answer);
    answer.qCount = this.getQCountByZone(answer.question);
    answer.corrCount = this.getCorrAnsCountByZone(answer.answer);
    answer.totalAnsCount = Object.values(answer.ansCount).reduce((ac: any, v: any) => ac + v, 0);
    answer.totalQCount = Object.values(answer.qCount).reduce((ac: any, v: any) => ac + v, 0);
    answer.totalCorrCount = Object.values(answer.corrCount).reduce((ac: any, v: any) => ac + v, 0);
    return answer;
  }

  async createAnswer(userId: number, machineId: number, files: any[]) {
    return await this.db.createAsnwer(userId, machineId, files);
  }

  async saveAnswer(answerId: number, answer: object) {
    const query = `with updated as (
    update answers
    set answer = $1, date_updated = now()
    where id = $2
    returning id, answer, date_created, machine_id)
    select updated.id, updated.answer, updated.date_created as "dateCreated",
    t.type, mb.brand, q.question
    from updated
    join machines m2 on updated.machine_id = m2.id
    join machine_types t on m2.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    join machine_brands mb on m2.brand_id = mb.id;`;
    const dbres = await this.db.findOne(query, [JSON.stringify(answer), answerId]);
    dbres.ansCount = this.getAnsCountByZone(dbres.answer);
    dbres.qCount = this.getQCountByZone(dbres.question);
    dbres.corrCount = this.getCorrAnsCountByZone(dbres.answer);
    dbres.totalAnsCount = Object.values(dbres.ansCount).reduce((ac: any, v: any) => ac + v, 0);
    dbres.totalQCount = Object.values(dbres.qCount).reduce((ac: any, v: any) => ac + v, 0);
    dbres.totalCorrCount = Object.values(dbres.corrCount).reduce((ac: any, v: any) => ac + v, 0);
    return dbres;
  }
}
