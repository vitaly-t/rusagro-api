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
}
