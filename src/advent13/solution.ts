
import { ISolution, InputFile, Util, Vec2, Vec3 } from '../shared';
import { IntComputer, IIntStream } from '../intcode';
import readlineSync from 'readline-sync';

enum Tile {
   Empty = 0,
   Wall = 1,
   Block = 2,
   Paddle = 3,
   Ball = 4,
}

enum Joystick {
   Left = -1,
   Neutral = 0,
   Right = 1,
}

enum PlayMode {
   InsertCoin,
   Interactive,
   Automatic,
}

export class Cabinet implements IIntStream {
   program : IntComputer;
   mode : PlayMode = PlayMode.InsertCoin;
   board : Tile[][] = [];
   size : Vec2 = { x: 0, y: 0 }
   output : Vec3 = { x: 0, y: 0, z: 0 }
   score : number = 0;
   ballX : number = 0;
   paddleX : number = 0;

   constructor(input : string, mode : PlayMode = PlayMode.InsertCoin) {
      this.program = IntComputer.fromInput(input, this);
      if (mode !== PlayMode.InsertCoin) {
         this.program.store(0, 2);
      }

      this.mode = mode;
      this.board = Util.range(50).map(j => Util.range(50).map(i => Tile.Empty));
      this.program.runToHalt();
      this.print();
   }

   totalBlocks() {
      return this.board.map((r) => r.filter(t => t === Tile.Block).length).reduce((a,c) => a + c);
   }

   print() {
      if (this.mode !== PlayMode.Interactive)
         return;

      const tileChar = (c : Tile) => {
         if (c === Tile.Ball) return 'o';
         if (c === Tile.Block) return 'x';
         if (c === Tile.Paddle) return '=';
         if (c === Tile.Wall) return '#';
         return ' ';
      }

      console.clear();
      for(let j = 0; j <= this.size.y; j++) {
         let row = '';
         for(let i = 0; i <= this.size.x; i++) {
            row += tileChar(this.board[j][i]);
         }
         console.log(row);
      }
      console.log();
      console.log('Score: '+this.score);
      console.log('Use 1,2,3 keys to play...');
   }

   read() : number {
      let input = Joystick.Neutral;

      if (this.mode === PlayMode.Interactive) {
         this.print();

         const opts = {hideEchoBack: true, mask: '', limit: '123'};
         return (+readlineSync.keyIn('', opts)) - 2;
      }

      if (this.mode === PlayMode.Automatic) {
         if (this.paddleX < this.ballX) {
            input = Joystick.Right;
         }
         if (this.paddleX > this.ballX) {
            input = Joystick.Left;
         }

         return input;
      }

      return input;
   }

   write(n : number) : void {
      switch(this.output.z) {
         case 0:
            this.output.x = n
            this.size.x = Math.max(this.size.x, n);
            break;
         case 1:
            this.output.y = n;
            this.size.y = Math.max(this.size.y, n);
            break;
         case 2:
            if (this.output.x >= 0 && this.output.y >= 0) {
               this.board[this.output.y][this.output.x] = n;

               // Track the ball and paddle for automatic play
               if (n === Tile.Ball)
                  this.ballX = this.output.x;
               if (n === Tile.Paddle) {
                  this.paddleX = this.output.x;
               }
            }

            if (this.output.x < 0) {
               this.score = n;
            }
            break;
      }
      this.output.z = (this.output.z + 1) % 3;
   }
}

class Solution implements ISolution {
   dayNumber : number = 13;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const cabinet = new Cabinet(input);
      return ''+cabinet.totalBlocks();
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      //const cabinet = new Cabinet(input,PlayMode.Interactive);
      const cabinet = new Cabinet(input, PlayMode.Automatic);

      return ''+cabinet.score;
   }
}

export default new Solution() as ISolution;