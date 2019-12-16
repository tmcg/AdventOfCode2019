
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

function *patternGenerator(repeat: number) : IterableIterator<number> {
   const p = [0, 1, 0, -1];
   let px = 0;

   while (true) {
      for (let i = 0; i < repeat; i++) {
         yield p[px];
      }
      px = (px + 1) % p.length;
   }
}

class Solution implements ISolution {
   dayNumber : number = 16;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText().split('').map(n => +n);
      //const input = [1,2,3,4,5,1,2,3,4,5];

      let curr : number[] = input.slice();
      let next : number[] = [];

      for (let ph = 0; ph < 100; ph++) {
         for (let i = 0; i < input.length; i++) {
            let g = patternGenerator(i+1);
            g.next(); // discard first value

            const t1 = curr.map(c => c * g.next().value);
            const t2 = t1.reduce((a,c) => a + c);
            next.push(Math.abs(t2) % 10);
         }
         curr = next;
         next = [];
      }

      return ''+curr.join('').substring(0,8);
   }

   solvePart2() : string {
      const inputText = new InputFile(this.dayNumber).readText();
      let fullText = '';
      for (let x = 0; x < 10000; x++) {
         fullText += inputText;
      }

      /*
      There's a pattern in the second half of the numbers array:
         signal[N] is sum of N, N+1, N+2, N+3, etc to the end of the previous phase (mod 10)
      This means that as long as the message offset is past the halfway mark it's only
      necessary to calculate a running total from the end back to the message offset
      */
      const start = +inputText.substring(0,7);
      const input = fullText.substring(start).split('').map(n => +n).reverse();

      for (let ph = 0; ph < 100; ph++) {
         let total = 0;
         for (let i = 0; i < input.length; i++) {
            total += input[i];
            input[i] = total % 10;
         }
      }

      return input.reverse().join('').substr(0, 8);
   }
}

export default new Solution() as ISolution;