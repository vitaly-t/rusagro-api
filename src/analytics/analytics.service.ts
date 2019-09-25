import { Injectable } from '@nestjs/common';
import { AnswersService } from '../answers/answers.service';
import piexif = require('piexifjs');

@Injectable()
export class AnalyticsService {
  constructor(private readonly answersService: AnswersService) {
  }

  async getCommonAnalytics(dateFrom, dateTo) {
    const dateF = dateFrom.split('.').reverse().join('.');
    const dateL = dateTo.split('.').reverse().join('.');
    const answers = await this.answersService.findAllInDateRange(dateF, dateL);

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
      top5WrongAns: {},
      byDate: {},
    };

    answers.forEach(ans => {
      const tempDate = new Date(ans.date);
      const month = tempDate.getMonth() + 1;
      const date = tempDate.getDate() + '.' + (month < 10 ? '0' + month : month);

      // init groupings
      obj.ans.byDepartments[ans.department] = obj.ans.byDepartments[ans.department] || {
        count: 0, percent: 0,
      };
      obj.ans.byType[ans.type] = obj.ans.byType[ans.type] || 0;
      obj.ans.byUser[ans.username] = obj.ans.byUser[ans.username] || {
        user: ans.firstName + ' ' + ans.lastName,
        count: 0, percent: 0,
      };
      obj.byDate[date] = obj.byDate[date] || { countAns: 0, countWrongAns: 0, uniqueUsers: [] };

      obj.wrongAns.byDepartments[ans.department] = obj.wrongAns.byDepartments[ans.department] || {
        count: 0, percent: 0,
      };
      obj.wrongAns.byType[ans.type] = obj.wrongAns.byType[ans.type] || 0;
      obj.wrongAns.byUser[ans.username] = obj.wrongAns.byUser[ans.username] || {
        user: ans.firstName + ' ' + ans.lastName,
        count: 0, percent: 0,
      };

      // answers counting
      obj.ans.byDepartments[ans.department].count++;
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
          count: 0, title: ans.answer[zone].title, percent: 0,
        };

        ans.answer[zone].panels.forEach(panel => {
          let mainQKey = Object.keys(panel.questions).find(key => {
            return /q\d+c\d+/.test(key);
          });
          if (!mainQKey && zone === 'pin') {
            mainQKey = 'qp0c1';
          }

          const q = panel.questions[mainQKey];

          if (mainQKey) {
            if (
              !q.a ||
              (q.t === 'radiogroup' && q.a === '0') ||
              (q.t === 'file' && q.a.length === 0)
            ) {
              obj.wrongAns.total++;
              obj.wrongAns.byGroup[zone].count++;
              obj.wrongAns.byUser[ans.username].count++;
              obj.wrongAns.byDepartments[ans.department].count++;
              obj.wrongAns.byType[ans.type]++;
              obj.byDate[date].countWrongAns++;

              obj.top5WrongAns[q.q] = obj.top5WrongAns[q.q] || { count: 0, percent: 0, types: [] };
              obj.top5WrongAns[q.q].count++;

              if (!obj.top5WrongAns[q.q].types.includes(ans.type)) {
                obj.top5WrongAns[q.q].types.push(ans.type);
              }
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

    // percents
    if (obj.ans.total > 0) {
      Object.keys(obj.ans.byDepartments).forEach(dep => {
        const field = obj.ans.byDepartments[dep];
        field.percent = Math.floor(field.count / obj.ans.total * 100);
      });

      Object.keys(obj.ans.byUser).forEach(username => {
        const field = obj.ans.byUser[username];
        field.percent = Math.floor(field.count / obj.ans.total * 100);
      });
    }
    if (obj.wrongAns.total > 0) {
      Object.keys(obj.wrongAns.byDepartments).forEach(dep => {
        const field = obj.wrongAns.byDepartments[dep];
        field.percent = Math.floor(field.count / obj.wrongAns.total * 100);
      });

      Object.keys(obj.wrongAns.byGroup).forEach(group => {
        const field = obj.wrongAns.byGroup[group];
        field.percent = Math.floor(field.count / obj.wrongAns.total * 100);
      });

      Object.keys(obj.wrongAns.byUser).forEach(username => {
        const field = obj.wrongAns.byUser[username];
        field.percent = Math.floor(field.count / obj.wrongAns.total * 100);
      });

      Object.keys(obj.top5WrongAns).forEach(q => {
        const field = obj.top5WrongAns[q];
        field.percent = Math.floor(field.count / obj.wrongAns.total * 100);
      });
    }

    // mapping
    const compFunc = (a, b) => {
      return b.count - a.count;
    };

    Object.keys(obj.byDate).forEach(date => {
      obj.byDate[date].uniqueUsers = obj.byDate[date].uniqueUsers.length;
    });

    ['ans', 'wrongAns'].forEach(field => {
      obj[field].byDepartments = Object.keys(obj[field].byDepartments)
        .map(dep => {
          return {
            title: dep,
            count: obj[field].byDepartments[dep].count,
            percent: obj[field].byDepartments[dep].percent,
          };
        }).sort(compFunc);

      obj[field].byType = Object.keys(obj[field].byType)
        .map(type => {
          return {
            type,
            count: obj[field].byType[type],
          };
        }).sort(compFunc);

      obj[field].byUser = Object.keys(obj[field].byUser)
        .map(username => {
          return {
            username,
            count: obj[field].byUser[username].count,
            user: obj[field].byUser[username].user,
            percent: obj[field].byUser[username].percent,
          };
        }).sort(compFunc);
    });

    obj.wrongAns.byGroup = Object.keys(obj.wrongAns.byGroup).map(group => {
      return {
        group,
        count: obj.wrongAns.byGroup[group].count,
        title: obj.wrongAns.byGroup[group].title,
        percent: obj.wrongAns.byGroup[group].percent,
      };
    }).sort(compFunc);

    obj.top5WrongAns = Object.keys(obj.top5WrongAns).map(q => {
      return {
        question: q,
        count: obj.top5WrongAns[q].count,
        percent: obj.top5WrongAns[q].percent,
        types: obj.top5WrongAns[q].types,
      };
    })
      .sort(compFunc).slice(0, 5);

    return obj;
  }

  async getAnswers(dateFrom, dateTo) {
    const dateF = dateFrom.split('.').reverse().join('.');
    const dateL = dateTo.split('.').reverse().join('.');
    const answers = await this.answersService.findAnalTableData(dateF, dateL);

    answers.forEach(ans => {
      // machine gps data stub
      ans.compliance = 'no-data';
      try {
        ans.status = !!Object.values(ans.answer.result.panels[0].questions)
          .find((el: any) => el.t === 'radiogroup' && el.a === '1');
      } catch {
        ans.status = false;
      }
      // wrong and counting
      ans.wrongAnsCount = 0;
      Object.keys(ans.answer).forEach(zone => {
        ans.answer[zone].panels.forEach(panel => {
          let mainQKey = Object.keys(panel.questions).find(key => {
            return /q\d+c\d+/.test(key);
          });
          if (!mainQKey && zone === 'pin') {
            mainQKey = 'qp0c1';
          }

          const q = panel.questions[mainQKey];

          if (mainQKey) {
            if (
              !q.a ||
              (q.t === 'radiogroup' && q.a === '0') ||
              (q.t === 'file' && q.a.length === 0)
            ) {
              ans.wrongAnsCount++;
            }
          }
        });
      });
      delete ans.answer;
      if (Array.isArray(ans.photos)) {
        ans.photos.forEach(phObj => {
          try {
            const { GPS } = piexif.load('data:image/jpeg;base64,' + phObj.image);
            if (GPS[1]) {
              phObj.lat = piexif.GPSHelper.dmsRationalToDeg(GPS[piexif.GPSIFD.GPSLatitude], GPS[piexif.GPSIFD.GPSLatitudeRef]);
              phObj.lon = piexif.GPSHelper.dmsRationalToDeg(GPS[piexif.GPSIFD.GPSLongitude], GPS[piexif.GPSIFD.GPSLongitudeRef]);
            }
          } catch (e) {
            console.log(e);
          }
          delete phObj.image;
        });
      }
    });
    return answers;
  }
}
