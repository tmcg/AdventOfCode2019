
import { ISolution, InputFile } from '../shared';

class Solution1 implements ISolution {
   dayNumber : number = 1;

   calculateFuel(mass : number) : number {
      const fuel = Math.floor(mass / 3) - 2
      return fuel >= 0 ? fuel : 0;
   }

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const numbers = inputFile.readLines().map(x => +x);

      return '' + numbers.map(x => {
         return this.calculateFuel(x);
      }).reduce((a,b) => a + b, 0);
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const numbers = inputFile.readLines().map(x => +x);

      return '' + numbers.map(x => {
         let totalFuel = 0;
         let newFuel = this.calculateFuel(x);
         while(newFuel > 0) {
            totalFuel += newFuel;
            newFuel = this.calculateFuel(newFuel);
         }

         return totalFuel;
      }).reduce((a, b) => a + b, 0);
   }
}

export default new Solution1() as ISolution;
