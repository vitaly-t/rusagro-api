import { Injectable } from '@nestjs/common';
import { AnswersService } from '../answers/answers.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly answersService: AnswersService) {
  }

  async getCommonAnalytics() {
    const answers = await this.answersService.findAllInDateRange();

    const obj = {
      ans: {
        min: { date: '', count: Number.POSITIVE_INFINITY },
        max: { date: '', count: Number.NEGATIVE_INFINITY },
        avg: 0,
        total: 0,
        byDepartments: {},
        byType: {},
        byUser: {},
      },
      wrongAns: {
        min: { date: '', count: Number.POSITIVE_INFINITY },
        max: { date: '', count: Number.NEGATIVE_INFINITY },
        avg: 0,
        total: 0,
        byDepartments: {},
        byGroup: {},
        byType: {},
        byUser: {},
      },
      createdByUser: {
        min: { date: '', count: Number.POSITIVE_INFINITY },
        max: { date: '', count: Number.NEGATIVE_INFINITY },
        avg: 0,
        total: 0,
      },
      top10WrongAns: {},
      byDate: {},
    };

    answers.forEach(ans => {
      const date = new Date(ans.date).toLocaleDateString('ru', {
          day: '2-digit',
          month: '2-digit',
        },
      ).split('-').reverse().join('.');

      // init groupings
      obj.ans.byDepartments[ans.department] = obj.ans.byDepartments[ans.department] || 0;
      obj.ans.byType[ans.type] = obj.ans.byType[ans.type] || 0;
      obj.ans.byUser[ans.username] = obj.ans.byUser[ans.username] || {
        user: ans.firstName + ' ' + ans.lastName,
        count: 0,
      };
      obj.byDate[date] = obj.byDate[date] || { countAns: 0, countWrongAns: 0, uniqueUsers: [] };

      obj.wrongAns.byDepartments[ans.department] = obj.wrongAns.byDepartments[ans.department] || 0;
      obj.wrongAns.byType[ans.type] = obj.wrongAns.byType[ans.type] || 0;
      obj.wrongAns.byUser[ans.username] = obj.wrongAns.byUser[ans.username] || {
        user: ans.firstName + ' ' + ans.lastName,
        count: 0,
      };
      obj.top10WrongAns[ans.type] = obj.top10WrongAns[ans.type] || {};

      // answers counting
      obj.ans.byDepartments[ans.department]++;
      obj.ans.byType[ans.type]++;
      obj.ans.byUser[ans.username].count++;
      obj.byDate[date].countAns++;
      if (!obj.byDate[date].uniqueUsers.includes(ans.username)) {
        obj.byDate[date].uniqueUsers.push(ans.username);

        obj.createdByUser.total++;
      }

      obj.ans.total++;

      // wrong answers counting
      Object.keys(ans.answer).forEach(zone => {
        obj.wrongAns.byGroup[zone] = obj.wrongAns.byGroup[zone] || {
          count: 0,
          name: ans.answer[zone].title,
        };

        ans.answer[zone].panels.forEach(panel => {
          let mainQKey = Object.keys(panel.questions).find(key => {
            return /q\d+c\d+/.test(key);
          });
          if (!mainQKey && zone === 'pin') {
            mainQKey = 'qp0c1';
          }

          if (mainQKey) {
            const q = panel.questions[mainQKey];
            if (
              !q.a ||
              (q.t === 'radiogroup' && q.a === '0') ||
              (q.t === 'file' && q.a.length === 0)
            ) {
              obj.wrongAns.total++;
              obj.wrongAns.byGroup[zone].count++;
              obj.wrongAns.byUser[ans.username].count++;
              obj.wrongAns.byDepartments[ans.department]++;
              obj.wrongAns.byType[ans.type]++;
              obj.byDate[date].countWrongAns++;

              obj.top10WrongAns[ans.type][q.q] = obj.top10WrongAns[ans.type][q.q] || 0;
              obj.top10WrongAns[ans.type][q.q]++;
            }
          }
        });
      });
    });

    const groupedByDateKeys = Object.keys(obj.byDate);
    groupedByDateKeys.forEach(date => {
      if (obj.byDate[date].countAns > obj.ans.max.count) {
        obj.ans.max.date = date;
        obj.ans.max.count = obj.byDate[date].countAns;
      }
      if (obj.byDate[date].countAns < obj.ans.min.count) {
        obj.ans.min.date = date;
        obj.ans.min.count = obj.byDate[date].countAns;
      }
      if (obj.byDate[date].countWrongAns > obj.wrongAns.max.count) {
        obj.wrongAns.max.date = date;
        obj.wrongAns.max.count = obj.byDate[date].countWrongAns;
      }
      if (obj.byDate[date].countWrongAns < obj.wrongAns.min.count) {
        obj.wrongAns.min.date = date;
        obj.wrongAns.min.count = obj.byDate[date].countWrongAns;
      }
      if (obj.byDate[date].uniqueUsers.length > obj.createdByUser.max.count) {
        obj.createdByUser.max.date = date;
        obj.createdByUser.max.count = obj.byDate[date].uniqueUsers.length;
      }
      if (obj.byDate[date].uniqueUsers.length < obj.createdByUser.min.count) {
        obj.createdByUser.min.date = date;
        obj.createdByUser.min.count = obj.byDate[date].uniqueUsers.length;
      }
    });
    obj.ans.avg = Math.floor(obj.ans.total / groupedByDateKeys.length);
    obj.createdByUser.avg = Math.floor(obj.createdByUser.total / groupedByDateKeys.length);
    obj.wrongAns.avg = Math.floor(obj.wrongAns.total / groupedByDateKeys.length);

    return obj;
  }
}
