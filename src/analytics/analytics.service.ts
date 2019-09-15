import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DbService) {
  }

  findQuizzes() {
    const query = `
    with selected as (select
          q.id,
          q.quiz,
          q.description,
          count(a.id)       as "quiz_count",
          max(a.date_updated) as "latestUpdated"
        from quizzes q
          left join sss s on s.type_id = q.machine_type_id
          left join answers a on a.sss_id = s.id
        group by q.id, q.description)
    select
    selected.*,
    date_created as "latestCreated"
    from answers a
    join selected on selected."latestUpdated" = a.date_updated;`;
    return this.db.find(query);
  }

  async findQuiz (id) {
    const answerData = await this.db.find(`
    select a.id, users.first_name||' '||users.last_name as user, date_updated, s.brand, s.plate_number, s.inventory_number, answer
    from answers a
    left join users on users.id = a.user_id
    left join sss s on a.sss_id = s.id
    where sss_id = $1`, [id]);
    const quizData = await this.db.findOne(`with quiz_zones  as (
      SELECT json_array_elements(question -> 'pages') as quiz_zone
      from quiz
      where id = $1
    ),
    quiz_counts as (
      select quiz_zone ->> 'name' as name, (
        select sum(q_count) from (
          select count (*) as q_count from json_array_elements(quiz_zone -> 'elements')
        ) as foo
      ) as cnt
      from quiz_zones
    )
    -- , quiz_md as (
      select
      -- (select json_object from json_object((select ARRAY_AGG(name) from answ_counts), (select ARRAY_AGG(cnt::text) from answ_counts))) as answer_count,
        (select json_object from json_object((select ARRAY_AGG(name) from quiz_counts), (select ARRAY_AGG(cnt::text) from quiz_counts))) as quest_count,
        (select json_object from json_object((select ARRAY_AGG(quiz_zone ->> 'name') from quiz_zones), (select ARRAY_AGG(quiz_zone ->> 'title') from quiz_zones))) as zone_names
        
      from quiz
      where quiz.id = $1`, [id]);

    answerData.forEach(answ => {
      if (typeof answ.answer === 'object') {
        answ.answerCount = {};
        Object.keys(answ.answer).forEach(zoneName => {
          answ.answerCount[zoneName] = 0;
          const curZone = answ.answer[zoneName];
          curZone.panels.forEach(panel => {
            if (Object.values(panel.questions).find((q: any) => q.t === 'radiogroup' && (q.a === '1' || q.a === '2'))) {
              answ.answerCount[zoneName] = answ.answerCount[zoneName] + 1;
            }
          });
        });
        delete answ.answer;
      }
    });
    // TODO: can be simplified (i promise)
    const obj = { answerData, quizData };
    const arr = [];
    const temp1 = obj.quizData;
    let quizCountTotal = 0;
    Object.keys(temp1.quest_count).forEach(key => {
      temp1.quest_count[key] = +temp1.quest_count[key];
      quizCountTotal += temp1.quest_count[key];
    });

    obj.answerData.forEach(row => {
      let answerCountTotal = 0;
      Object.keys(row.answerCount).forEach(key => {
        answerCountTotal += row.answerCount[key];
      });

      const obj1 = {
        id: row.id,
        user: row.user,
        dateUpdated: row.date_updated,
        shop: row.shop,
        answerCount: row.answerCount,
        answerCountTotal: answerCountTotal,
        zoneNames: temp1.zone_names,
        quizCount: temp1.quest_count,
        quizCountTotal: quizCountTotal
      };

      arr.push(obj1);
    });
  }
}
