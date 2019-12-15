
import { ISolution, InputFile, Util } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';

class Solution implements ISolution {
   dayNumber : number = 9;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const io = new BasicIntStream().pipe([1]);
      IntComputer.fromInput(input,io).runToHalt();

      return ''+io.output.join(',');
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const io = new BasicIntStream().pipe([2]);
      IntComputer.fromInput(input, io).runToHalt();

      return ''+io.output.join(',');
   }
}

export default new Solution() as ISolution;
