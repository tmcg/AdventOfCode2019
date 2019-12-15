
import { ISolution, InputFile, Util } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';


class Solution1 implements ISolution {
   dayNumber : number = 2;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();

      const computer = IntComputer.fromInput(input, new BasicIntStream());
      computer.store(1, 12);
      computer.store(2, 2);
      computer.runToHalt();

      return '' + computer.load(0);
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();

      let result : string = '';
      while(true) {
         for (const noun of Util.range(100,0)) {
            for (const verb of Util.range(100,0)) {
               let computer = IntComputer.fromInput(input, new BasicIntStream());
               computer.store(1, noun);
               computer.store(2, verb);
               computer.runToHalt();

               if (computer.load(0) === 19690720)
                  return Util.padZero(noun, 2) + Util.padZero(verb, 2);
            }
         }
      }

      return '';
   }
}

export default new Solution1() as ISolution;
