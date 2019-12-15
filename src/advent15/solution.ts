
import { ISolution, InputFile, Util, Vec2, Vec3 } from '../shared';
import { IntComputer, IIntStream } from '../intcode';
import readlineSync from 'readline-sync';
//const logger = Util.createLogger();

enum DroidCompass {
   North = 1,
   South = 2,
   West = 3,
   East = 4,
}

enum DroidStatus {
   Wall = 0,
   Step = 1,
   Goal = 2,
}

interface DroidSquare extends Vec2 {
   cost : number
   glyph : string
}

export class RepairDroid implements IIntStream {
   program : IntComputer;
   status : DroidStatus = DroidStatus.Wall;
   direction : DroidCompass = DroidCompass.North;
   maxCost : number = 1000000000;
   origin : Vec2 = { x: 25, y: 25 };
   position : Vec2 = { x: this.origin.x, y: this.origin.y };
   board : DroidSquare[][] = [];
   goal : Vec2 | null = null;

   constructor(input : string) {
      this.program = IntComputer.fromInput(input, this);
      for (let j = 0; j < this.origin.x * 2; j++) {
         let row : DroidSquare[] = [];
         for (let i = 0; i < this.origin.y * 2; i++) {
            row.push({x: i, y: j, cost: this.maxCost, glyph: '.'});
         }
         this.board.push(row);
      }
   }

   confirm() : boolean {
      return readlineSync.keyInYNStrict('Continue?', { guide: true });
   }

   start() {
      while(!this.program.halt && this.status != DroidStatus.Goal) {
         this.program.runToPause();
      }
   }

   turnLeft() {
      switch(this.direction) {
         case DroidCompass.North: this.direction = DroidCompass.West; break;
         case DroidCompass.South: this.direction = DroidCompass.East; break;
         case DroidCompass.West: this.direction = DroidCompass.South; break;
         default: this.direction = DroidCompass.North; break;
      }
   }

   turnRight() {
      Util.range(3).map(_ => this.turnLeft());
   }

   print() {
      console.clear();

      for (let j = 0; j < this.origin.x * 2; j++) {
         let row = '';
         for (let i = 0; i < this.origin.y * 2; i++) {
            let g = this.board[j][i].glyph;
            let c = this.board[j][i].cost;

            if (g === ' ' && c < this.maxCost) {
               g = ''+(c % 10);
            }

            if (i === this.position.x && j === this.position.y) {
               g = '^V<>'[this.direction - 1];
            }
            if (this.goal != null && i === this.goal.x && j === this.goal.y) {
                g = '@';
            }

            row += g;
         }
         console.log(row);
      }
   }

  findCosts(square : DroidSquare) {
      const up = this.board[square.y - 1][square.x];
      if (up.glyph === ' ' && up.cost > square.cost + 1) {
         up.cost = square.cost + 1;
         this.findCosts(up);
      }

      const dn = this.board[square.y + 1][square.x];
      if (dn.glyph === ' ' && dn.cost > square.cost + 1) {
         dn.cost = square.cost + 1;
         this.findCosts(dn);
      }

      const lt = this.board[square.y][square.x - 1];
      if (lt.glyph === ' ' && lt.cost > square.cost + 1) {
         lt.cost = square.cost + 1;
         this.findCosts(lt);
      }

      const rt = this.board[square.y][square.x + 1];
      if (rt.glyph === ' ' && rt.cost > square.cost + 1) {
         rt.cost = square.cost + 1;
         this.findCosts(rt);
      }

      /*
      this.print();
      if (!this.confirm())
         process.exit();
      */
   }

   findShortestPath() : number {
      return this.board[this.origin!.y][this.origin!.x].cost;
   }

   findOxygenTime() : number {
      let oxygenTime : number = 0;
      for (let j = 0; j < this.board.length; j++) {
         for (let i = 0; i < this.board[j].length; i++) {
            if (this.board[j][i].glyph === ' ' && this.board[j][i].cost > oxygenTime) {
               oxygenTime = this.board[j][i].cost;
            }
         }
      }
      return oxygenTime;
   }

   read() : number {
      return this.direction;
   }

   write(n : number) : void {
      let nextPos : Vec2;
      switch(this.direction) {
         case DroidCompass.North: nextPos = { x: this.position.x, y: this.position.y - 1 }; break;
         case DroidCompass.South: nextPos = { x: this.position.x, y: this.position.y + 1 }; break;
         case DroidCompass.West: nextPos = { x: this.position.x - 1, y: this.position.y }; break;
         default: nextPos = { x: this.position.x + 1, y: this.position.y }; break;
      }

      //logger.info(`${this.position.x},${this.position.y},${DroidCompass[this.direction]}: ${DroidStatus[n]}`);

      switch (n) {
         case DroidStatus.Wall:
            this.board[nextPos.y][nextPos.x].glyph = '#';
            this.status = DroidStatus.Wall;
            this.turnRight();
            break;
         case DroidStatus.Step:
            this.position = nextPos;
            this.board[nextPos.y][nextPos.x].glyph = ' ';
            this.status = DroidStatus.Step;
            this.turnLeft();
            break;
         case DroidStatus.Goal:
            this.position = nextPos;
            this.board[nextPos.y][nextPos.x].glyph = ' ';
            this.status = DroidStatus.Step;

            if (this.goal !== null) {
               this.status = DroidStatus.Goal;
               const start = this.board[this.goal.y][this.goal.x];
               start.cost = 0;
               this.findCosts(start);
            }
            this.goal = nextPos;
            break;
      }
   }
}

class Solution implements ISolution {
   dayNumber : number = 15;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const droid = new RepairDroid(input);
      droid.start();

      return ''+droid.findShortestPath();
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const droid = new RepairDroid(input);
      droid.start();

      return ''+droid.findOxygenTime();
   }
}

export default new Solution() as ISolution;