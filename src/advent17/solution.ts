
import { ISolution, InputFile, Vec2, Compass } from '../shared';
import { IntComputer, IIntStream } from '../intcode';

export class VacuumRobot implements IIntStream {
   program : IntComputer;
   board : string[] = [''];
   path : string = '';
   buffer : string = '';
   dustCount : number = 0;

   constructor(input : string) {
      this.program = IntComputer.fromInput(input, this);
   }

   print() {
      console.log('');
      for (let i = 0; i < this.board.length; i++) {
         console.log(this.board[i]);
      }
   }

   width() {
      return this.board[0].length;
   }

   height() {
      return this.board.length;
   }

   charAt(x: number, y: number, d: Compass | null = null) {
      if (d === Compass.East) x++;
      if (d === Compass.West) x--;
      if (d === Compass.North) y--;
      if (d === Compass.South) y++;
      if (x < 0 || x >= this.width() || y < 0 || y >= this.height())
         return '.';
      return this.board[y].substr(x, 1);
   }

   findIntersections() : number {
      this.program.runToHalt();
      //this.print();

      let results: Vec2[] = [];
      for(let j = 1; j < this.height() - 2; j++) {
         for (let i = 1; i < this.width() - 2; i++) {
            if (this.charAt(i, j) === '#' &&
               this.charAt(i, j, Compass.North) === '#' &&
               this.charAt(i, j, Compass.South) === '#' &&
               this.charAt(i, j, Compass.West) === '#' &&
               this.charAt(i, j, Compass.East) === '#') {
               let v: Vec2 = {x: i, y: j};
               results.push(v);
            }
         }
      }
      return results.map(v => v.x * v.y).reduce((a,c) => a + c);
   }

   collectDust(path : string) : number {
      this.program.store(0, 2);
      this.path = path;

      this.program.runToHalt();
      return this.dustCount;
   }

   read() : number {

      let c = this.path.charCodeAt(0);
      this.path = this.path.slice(1);
      return c;
   }

   write(n : number) : void {
      if (this.program.load(0) === 1) {
         let c : string = String.fromCharCode(n);
         if (c === '\n') {
            this.board.push('');
         } else {
            this.board[this.height() - 1] += c;
         }
      } else {
         if (n > 255) {
            this.dustCount = n;
            return;
         }

         /*
         let c : string = String.fromCharCode(n);
         if (c === '\n') {
            console.log(this.buffer);
            this.buffer = '';
         } else {
            this.buffer += c;
         }
         */
      }
   }
}

class Solution implements ISolution {
   dayNumber : number = 17;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const robot = new VacuumRobot(input);

      return ''+robot.findIntersections();
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const robot = new VacuumRobot(input);

      return ''+robot.collectDust('A,B,A,C,B,C,B,A,C,B\nL,10,L,6,R,10\nR,6,R,8,R,8,L,6,R,8\nL,10,R,8,R,8,L,10\nn\n');
   }
}

export default new Solution() as ISolution;