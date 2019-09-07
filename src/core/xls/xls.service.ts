import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class XlsService {
    buildXLS(answer) {
        const blankWB = XLSX.readFile('src/core/xls/blanks/blank_new.xls');
        const ws = blankWB.Sheets[blankWB.SheetNames[0]];
        const date = new Date(answer.dateCreated);
        // header 
        ws.A1 = { t: 's', v: answer.quiz };
        ws.D2 = { t: 's', v: answer.productionDepartment };
        ws.D3 = { t: 's', v: answer.brand };
        ws.D4 = { t: 's', v: answer.plateNumber };
        ws.D5 = { t: 's', v: answer.inventoryNumber };
        ws.D6 = { t: 's', v: date.toLocaleDateString('ru-RU') };

        let curRowNum = 8; // number of header rows

        Object.keys(answer.answer).forEach(key => {
            const curZone = answer.answer[key];
            ws['A' + (++curRowNum)] = { t: 's', v: curZone.title };
            curZone.panels.forEach(curPanel => {
                if (typeof curPanel.questions === 'object' && Object.keys(curPanel.questions).length) {
                    curRowNum++;
                }
                const mainQKey = Object.keys(curPanel.questions).find(qKey => {
                  return /q\d+c\d+/.test(qKey);
                });
                Object.keys(curPanel.questions).forEach(questionId => {
                    const curQuestion = curPanel.questions[questionId];
                    if (questionId === mainQKey) { // main question
                        ws['A' + curRowNum] = { t: 's', v: curQuestion.q };
                        if (curQuestion.t === 'radiogroup') {
                            const aField = (curQuestion.a === '0' ? 'D' : 'E') + curRowNum;
                            ws[aField] = { t: 's', v: 'x' };
                        } else if (curQuestion.t === 'text') {
                            ws['D' + curRowNum] = { t: 's', v: curQuestion.a };
                        }
                    } else if (questionId === 'qp0c1') { // тип распиновки
                        ws['A' + curRowNum] = { t: 's', v: curQuestion.q };
                        // TODO: unhardcode me
                        const text = curQuestion.a === 0 ? 'GalileoSky v1.Х.Х; v2. Х.Х.' : 'GalileoSky v5.Х.';
                        // try {
                        //     text = answer.question.pages.find(el => el.name === 'pin').elements[0].choices
                        //         .find(el => el.value === curQuestion.a).text;
                        // } catch {
                        //     text = curQuestion.a;
                        // }
                        ws['D' + curRowNum] = { t: 's', v: text };
                    } else if (curQuestion.t === 'file' || !curQuestion.t) {
                        return;
                    } else { // comment
                        const curStr = curQuestion.q + ': ' + curQuestion.a;
                        if (!ws['F' + curRowNum]) {
                            ws['F' + curRowNum] = { t: 's', v: curStr };
                        } else {
                            ws['F' + curRowNum].v = ws['F' + curRowNum].v + ', ' + curStr;
                        }
                    }
                });
                
            });
        });
        ws['!ref'] = 'A1:F' + (curRowNum); // set active sheet area
    //   ws['!cols'] = [
    //     { wpx: 80 }, { wpx: 80 }, { wpx: 180 }, { wpx: 300 }, { wpx: 160 }, { wpx: 160 }, { wpx: 160 }, { wpx: 80 }
    //   ];
    
    return XLSX.write(blankWB, { type: 'buffer', bookType: 'xls', bookSST: false });
    }
}
