
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

export class Util4 {
   static isIncreasing(code : string) : boolean {
      let lastNum = 0;
      for (const thisChar of code) {
         const thisNum = +thisChar;
         if (thisNum < lastNum)
            return false;
         lastNum = thisNum;
      }
      return true;
   }

   static findRuns(code : string) : string[] {
      let result : string[] = [];
      let lastChar : string = '';
      let lastRun : string = '';
      for (const thisChar of code) {
         if (thisChar === lastChar) {
            lastRun += thisChar;
         } else {
            if (lastRun.length > 0)
               result.push(lastRun);
            lastRun = thisChar;
         }
         lastChar = thisChar;
      }

      result.push(lastRun);
      return result;
   }

   static meetsCriteriaPart1(code : string) : boolean {
      return Util4.isIncreasing(code) &&
         Util4.findRuns(code).filter(r => r.length >= 2).length > 0;
   }

   static meetsCriteriaPart2(code : string) : boolean {
      return Util4.isIncreasing(code) &&
         Util4.findRuns(code).filter(r => r.length === 2).length > 0;
   }
}

class Solution implements ISolution {
   dayNumber : number = 4;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const [n1, n2] = inputFile.readText().split('-').map(s => +s);

      let count = 0;
      for (let i = n1; i <= n2; i++) {
         if (Util4.meetsCriteriaPart1(''+i))
            count++;
      }

      return ''+count;
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const [n1, n2] = inputFile.readText().split('-').map(s => +s);

      let count = 0;
      for (let i = n1; i <= n2; i++) {
         if (Util4.meetsCriteriaPart2(''+i))
            count++;
      }

      return ''+count;
   }
}

export default new Solution() as ISolution;
