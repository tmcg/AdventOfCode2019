
import { ISolution, InputFile, Util } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';

export function phaseSequence(offset : number = 0) : number[][] {
   let n = 0;
   let seq : number[][] = [];
   while (n <= 3124) {
      let a = [...Util.padZero(+n.toString(5),5)];
      if (a.includes('0') && a.includes('1') && a.includes('2') && a.includes('3') && a.includes('4'))
         seq.push(a.map(x => +x + offset));
      n++;
   }
   return seq;
}

class Solution implements ISolution {
   dayNumber : number = 7;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const input = inputFile.readText();
      let bestOutput : number = 0;

      for (const phaseSet of phaseSequence()) {
         let ampOut : number = 0;
         let streams = Util.range(5).map(n => new BasicIntStream());
         let amps = Util.range(5).map(n => IntComputer.fromInput(input, streams[n]));

         for (const a of Util.range(amps.length)) {
            streams[a].pipe([phaseSet[a],ampOut])
            amps[a].runToPause();
            ampOut = streams[a].output[0];
         }

         if (ampOut > bestOutput)
            bestOutput = ampOut;
      }

      return ''+bestOutput;
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const input = inputFile.readText();
      let bestOutput : number = 0;

      for (const phaseSet of phaseSequence(5)) {
         let ampOut : number = 0;
         let streams = Util.range(5).map(n => new BasicIntStream());
         let amps = Util.range(5).map(n => IntComputer.fromInput(input, streams[n]));

         for (const a of Util.range(amps.length)) {
            streams[a].pipe([phaseSet[a]]);
         }

         while (!amps[amps.length - 1].halt) {
            for (const a of Util.range(amps.length)) {
               streams[a].pipe([ampOut]);
               amps[a].runToPause();
               ampOut = streams[a].output.slice(-1)[0];
            }
         }

         if (ampOut > bestOutput)
            bestOutput = ampOut;
      }

      return ''+bestOutput;
   }
}

export default new Solution() as ISolution;
