
import { ISolution, InputFile, Util } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';

class Solution implements ISolution {
   dayNumber : number = 5;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const stream = new BasicIntStream().pipe([1]);
      IntComputer.fromInput(inputFile.readText(), stream).runToHalt();

      if (stream.output.length < 10 || stream.output.slice(0,9).reduce((a,c) => a + c) !== 0) {
         return 'incorrect: '+stream.output.join(',');
      }

      return ''+stream.output[stream.output.length - 1];
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const stream = new BasicIntStream().pipe([5]);
      IntComputer.fromInput(inputFile.readText(), stream).runToHalt();

      return ''+stream.output[0];
   }
}

export default new Solution() as ISolution;
