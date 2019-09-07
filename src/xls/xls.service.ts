import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class XlsService {
    buildXLS (answer) {
        let blankWB = XLSX.readFile('.\\blanks\\blank_new.xls');
        const ws = blankWB.Sheets[blankWB.SheetNames[0]];
        const date = new Date(answer.dateCreated);
        // header 
        ws['A1'] = { t: 's', v: answer.quiz };
        ws['D3'] = { t: 's', v: answer.brand };
        ws['D4'] = { t: 's', v: answer.plateNumber };
        ws['D5'] = { t: 's', v: answer.inventoryNumber };
        ws['D6'] = { t: 's', v: date.toLocaleDateString('ru-RU') };

        let curRowNum = 8; // number of header rows
        
        Object.keys(answer).forEach(key => {
            const curZone = answer[key];
            ws['A' + curRowNum] = curZone.title;
            curZone.panels.forEach(curPanel => {
                if (typeof curPanel.questions === 'object' && Object.keys(curPanel.questions).length) {
                    curRowNum++;
                }
                const mainQKey = Object.keys(curPanel.questions).find(key => {
                    return /q\d+c\d+/.test(key);
                });
                Object.keys(curPanel.questions).forEach(questionId => {
                    const curQuestion = curPanel.questions[questionId];
                    if (questionId === mainQKey) { // main question
                        ws['A' + curRowNum] = { t: 's', v: curQuestion.q };
                        if (curQuestion.t === 'radiogroup') {
                            const aField = (curQuestion.a === '0' ? 'D' : 'F') + curRowNum;
                            ws[aField] = { t: 's', v: 'x' };
                        } else if (curQuestion.t === 'text') {
                            ws['D' + curRowNum] = { t: 's', v: curQuestion.a };
                        }
                    } else if (curQuestion.t === 'foto' || !curQuestion.t) {
                        return;
                    } else { // comment
                        const curStr = curQuestion.q + ': ' + curQuestion.a;
                        if (!ws['H' + curRowNum]) {
                            ws['H' + curRowNum] = { t: 's', v: curStr };
                        } else {
                            ws['H' + curRowNum].v = ws['H' + curRowNum].v + ', ' + curStr;
                        }
                    }
                });
                
            });
        });
        ws['!ref'] = 'A1:K' + (curRowNum); // set active sheet area
    //   ws['!cols'] = [
    //     { wpx: 80 }, { wpx: 80 }, { wpx: 180 }, { wpx: 300 }, { wpx: 160 }, { wpx: 160 }, { wpx: 160 }, { wpx: 80 }
    //   ];
    
      return blankWB;
    }
}
