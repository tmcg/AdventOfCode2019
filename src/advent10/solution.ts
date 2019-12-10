
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

interface CartesianCoord { x : number, y : number }
interface PolarCoord { r : number, t : number }
interface Asteroid { p : PolarCoord, c : CartesianCoord }

export function toPolar(x : number, y : number) : PolarCoord {
   return {
      r: Math.sqrt((x * x) + (y * y)),
      t: Math.atan2(y, x),
   };
}

export function polarScan(input : string[][], fromX : number, fromY : number) : Asteroid[] {
   let result : Asteroid[] = [];
   for (let j = 0; j < input.length; j++) {
      for (let i = 0; i < input[0].length; i++) {
         if (i === fromX && j === fromY) continue;
         if (input[j][i] !== '#') continue;

         result.push({
            p: toPolar(i - fromX, j - fromY),
            c: { x: i, y: j }
         });
      }
   }

   // polar co-ordinate transform to make the origin pointing up for part 2...
   const TwoPi = Math.PI * 2;
   const HalfPi = Math.PI * 0.5;
   for (const item of result) {
      item.p.t += item.p.t < 0 ? TwoPi + HalfPi : HalfPi;
      item.p.t %= TwoPi;
   }

   return result;
}

class Solution implements ISolution {
   dayNumber : number = 10;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const input = inputFile.readLines().map(y => y.split(''));

      let bestCount = 0;
      //let bestSite : CartesianCoord | null = null;

      for (let j = 0; j < input.length; j++) {
         for (let i = 0; i < input[0].length; i++) {
            if (input[j][i] !== '#') continue;

            const scan = polarScan(input, i, j);
            const visible = [...new Set(scan.map(x => x.p.t))];

            if (visible.length > bestCount) {
               bestCount = visible.length;
               //bestSite = { x: i, y: j };
            }
         }
      }

      //logger.info(`bestSite = (${bestSite!.x},${bestSite!.y})`)

      return ''+bestCount;
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const input = inputFile.readLines().map(y => y.split(''));
      const sortNumber = (a: number, b: number) => a > b ? 1 : -1;

      const siteX = 17, siteY = 23;
      let zapCount = 0;

      let scan = polarScan(input, siteX, siteY);
      while (scan.length > 0) {
         const visible = [...new Set(scan.map(x => x.p.t))].sort(sortNumber);

         for (var theta of visible) {
            const zap = scan
               .filter((a) => a.p.t === theta)
               .sort((a,b) => sortNumber(a.p.r, b.p.r))[0];

            input[zap.c.y][zap.c.x] = '.';
            zapCount++;

            //logger.info(`Zapped ${zapCount} (${zap.c.x},${zap.c.y})  R=${zap.p.r}, T=${zap.p.t}`);
            if (zapCount === 200)
               return ''+(zap.c.x * 100 + zap.c.y);
         }

         scan = polarScan(input, siteX, siteY);
      }

      throw new Error('Zapped less than 200...');
   }
}

export default new Solution() as ISolution;
