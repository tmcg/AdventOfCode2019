
import { ISolution, InputFile, Vec2, Compass } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';

export class ShipDrone extends BasicIntStream {
   program : IntComputer;
   intcode : string = '';

   constructor(input : string) {
      super();
      this.intcode = input;
      this.program = this.createProgram();
   }

   createProgram() : IntComputer {
      return IntComputer.fromInput(this.intcode, this);
   }

   probeAt(x: number, y: number) : string {
      this.program = this.createProgram();
      this.input = [x, y];
      this.output = [];
      this.program.runToPause();
      return this.output[0] > 0 ? '#' : '.';
   }

   probeLine(fromX: number, fromY: number, toFind: string) : number {
      let result: number = -1;
      for (let x = fromX; result < 0; x++) {
         if(this.probeAt(x, fromY) === toFind) {
            return x;
         }
      }
      throw new Error('unreachable');
   }

   findTractorSum() : number {
      let total = 0;
      for (let y = 0; y < 50; y++) {
         for (let x = 0; x < 50; x++) {
            if (this.probeAt(x, y) === '#')
               total++;
         }
      }
      return total;
   }

   findShipPosition() : number {
      // binary search y values to find a good start for y1
      for (let y1 = 1400; y1 < 1500; y1++) {
         const size = 100;
         const x1 = this.probeLine(0, y1, '#');
         const x3 = this.probeLine(x1, y1, '.');
         const x2 = this.probeLine(0, y1 + size - 1, '#');
         const result = x2 * 10000 + y1;

         //console.log(`Probing ${y1}:  ${x1},${x2},${x3} == ${x3 - x2}  (${result})`);
         if (x3 - x2 === 100)
            return result;
      }
      throw new Error('not found...');
   }
}

class Solution implements ISolution {
   dayNumber : number = 19;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const drone = new ShipDrone(input);

      return ''+drone.findTractorSum();
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const drone = new ShipDrone(input);

      return ''+drone.findShipPosition();
   }
}

export default new Solution() as ISolution;