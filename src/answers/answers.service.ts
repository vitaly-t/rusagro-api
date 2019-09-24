import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnswersService {
  constructor(private readonly db: DbService) {
  }

  private getAnsweredPins(answer) {
    const pinA = answer.pin;
    let res = 0;
    pinA.panels.forEach(panel => {
      let allAnswered = true;
      Object.values(panel.questions).forEach((q: any) => {
        if ((q.t === 'radiogroup' || q.t === 'text')) {
          allAnswered = allAnswered && !!q.a;
        }
      });
      if (allAnswered) {
        res++;
      }
    });
    return res - 1;
  }

  private getAnsCountByZone(answer) {
    const res = {};
    Object.keys(answer).forEach(zone => {
      res[zone] = 0;
      answer[zone].panels.forEach(panel => {
        let mainQKey = Object.keys(panel.questions).find(key => {
          return /q\d+c\d+/.test(key);
        });
        if (!mainQKey && zone === 'pin') {
          mainQKey = 'qp0c1';
        }
        if (mainQKey) {
          const q = panel.questions[mainQKey];
          if (zone === 'pin') {
            if (!!q.a || (typeof q.a === 'object' && q.a.length > 0)) {
              res[zone]++;
            }
          } else {
            if (!!q.a) {
              res[zone]++;
            }
            // if (q.t === 'radiogroup' && q.a === '1') {
            //   res[zone]++;
            // }
            // if (q.t === 'text' && q.a !== '') {
            //   res[zone]++;
            // }
            // if (q.t === 'file' && q.a.length > 0) {
            //   res[zone]++;
            // }
          }
        }
      });
    });
    return res;
  }

  private getQCountByZone(question, pin) {
    const res = {};
    question.pages.forEach(zone => {
      if (zone.name === 'pin') {
        res[zone.name] = 25;
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

  async findAllInDateRange(dateFrom: string, dateTo: string) {
    const query = `select u.username, u.first_name as "firstName",
    u.last_name as "lastName", answer, date(date_created), s.type,
    pd.name as "department"
      from answers_2 a2
    join users u on u.id = a2.user_id
    join sss s on s.id = a2.sss_id
    join production_departments pd on pd.id = s.department_id
      where
    date(date_created) >= $1 and date(date_created) <= $2`;
    return await this.db.find(query, [dateFrom, dateTo]);
  }

  async findAnalTableData(dateFrom: string, dateTo: string) {
    const query = `select u.last_name as "lastName", u.username, u.first_name as "firstName",
    s.type, s.plate_number, s.brand,
    pd.name as "department",
    answer, date_created as "dateCreated", date_updated as "dateUpdated",
    (select array_agg(row_to_json(t)) from (select id, image, original_name from images where answer_id = a2.id) t) as photos
      from answers a2
    join users u on u.id = a2.user_id
    join sss s on s.id = a2.sss_id
    join production_departments pd on pd.id = s.department_id
      where
    date(date_created) >= $1 and date(date_created) < $2;`;
    return await this.db.find(query, [dateFrom, dateTo]);
  }

  async findAllByUserId(userId: number) {
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
    const query1 = `select
    a.id               as "answerId",
    s.id               as "machineId",
    s.inventory_number as "inventoryNumber",
    s.plate_number     as "plateNumber",
    s.brand,
    mt.type,
    a.date_created       as "dateCreated",
    a.answer,
    q.question
    from answers a
    join sss s on a.sss_id = s.id
    join machine_types mt on s.type_id = mt.id
    join quizzes q on mt.id = q.machine_type_id
    where a.user_id = $1;`;
    const dbres = await this.db.find(query1, [userId]);
    dbres.forEach((row: any) => {
      const ansCountByZone = this.getAnsCountByZone(row.answer);
      row.ansCount = Object.values(ansCountByZone).reduce((ac: any, v: any) => ac + v, 0);
      row.qCountByZone = this.getQCountByZone(row.question, row.answer.pin);
      row.qCount = Object.values(row.qCountByZone).reduce((ac: any, v: any) => ac + v, 0);
      row.corrCountByZone = this.getCorrAnsCountByZone(row.answer);
      row.corrCount = Object.values(row.corrCountByZone).reduce((ac: any, v: any) => ac + v, 0);
      // row.pins = this.getAnsweredPins(row.answer);
      delete row.answer;
      delete row.question;
    });
    return dbres;
  }

  async findOne(answerId: number) {
    const query = `select a.id, a.answer, t.type, mb.brand, q.question,
    m2.inventory_number as "inventoryNumber",
    m2.plate_number as "plateNumber",
    q.quiz,
    a.date_created as "dateCreated",
    d2.name as "productionDepartment"
    from answers a
    join machines m2 on a.machine_id = m2.id
    join machine_types t on m2.type_id = t.id
    join quizzes q on t.id = q.machine_type_id
    join machine_brands mb on m2.brand_id = mb.id
    join production_departments d2 on m2.department_id = d2.id
    where a.id = $1`;
    const query1 = `select
    a.id, a.answer, mt.type, s.brand, s.tracker_id as "trackerId",
    q.question, s.inventory_number as "inventoryNumber",
    s.plate_number     as "plateNumber",
    q.quiz,
    a.date_created      as "dateCreated",
    pd.name             as "productionDepartment"
    from answers a
    join sss s on a.sss_id = s.id
    join machine_types mt on mt.id = s.type_id
    join quizzes q on mt.id = q.machine_type_id
    join production_departments pd on pd.id = s.department_id
    where a.id = $1`;
    const answer = await this.db.findOne(query1, [answerId]);
    answer.ansCount = this.getAnsCountByZone(answer.answer);
    answer.qCount = this.getQCountByZone(answer.question, answer.answer.pin);
    answer.corrCount = this.getCorrAnsCountByZone(answer.answer);
    answer.totalAnsCount = Object.values(answer.ansCount).reduce((ac: any, v: any) => ac + v, 0);
    answer.totalQCount = Object.values(answer.qCount).reduce((ac: any, v: any) => ac + v, 0);
    // answer.totalCorrCount = Object.values(answer.corrCount).reduce((ac: any, v: any) => ac + v, 0);
    return answer;
  }

  async createAnswer(userId: number, machineId: number, files: any[]) {
    return await this.db.createAsnwer(userId, machineId, files);
  }

  async saveAnswer(answerId: number, answer) {
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
    const query1 = `with updated as (
    update answers
    set answer = $1, date_updated = now()
    where id = $2
    returning id, answer, date_created, sss_id)
    select
    updated.id,
    updated.answer,
    updated.date_created as "dateCreated",
    mt.type,
    s.brand,
    q.question
    from updated
    join sss s on updated.sss_id = s.id
    join machine_types mt on mt.id = s.type_id
    join quizzes q on mt.id = q.machine_type_id;`;
    const dbres = await this.db.findOne(query1, [JSON.stringify(answer), answerId]);
    dbres.ansCount = this.getAnsCountByZone(dbres.answer);
    dbres.qCount = this.getQCountByZone(dbres.question, dbres.answer.pin);
    dbres.corrCount = this.getCorrAnsCountByZone(dbres.answer);
    dbres.totalAnsCount = Object.values(dbres.ansCount).reduce((ac: any, v: any) => ac + v, 0);
    dbres.totalQCount = Object.values(dbres.qCount).reduce((ac: any, v: any) => ac + v, 0);
    // dbres.pins = this.getAnsweredPins(dbres.answer);
    dbres.totalCorrCount = Object.values(dbres.corrCount).reduce((ac: any, v: any) => ac + v, 0);
    return dbres;
  }

  findPics(id) {
    const query = `select image from images where answer_id = $1`;
    return this.db.find(query, [id]);
  }
}
