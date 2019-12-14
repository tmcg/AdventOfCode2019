
import { ISolution, InputFile, Util, Vec2, Vec3 } from '../shared';
import readlineSync from 'readline-sync';
//const logger = Util.createLogger();

interface IInstruction {
   opcode : number;
   operands : number[];
   modes : number[];
}

interface IIntStream {
   read() : number;
   write(n : number) : void;
}

export class IntComputer {
   _memory : number[] = [];
   _instPtr : number = 0;
   _basePtr : number = 0;
   _iostream : IIntStream;
   halt : boolean = false;

   constructor(memory: number[], io : IIntStream)
   {
      this._memory = memory.slice();
      this._iostream = io;
   }

   static fromInput(input : string, io : IIntStream) : IntComputer {
      return new IntComputer(input.split(',').map(s => +s), io);
   }

   instructionModes(rawCode : number, count : number) : number[] {
      let paddedCode = ('00000'+rawCode).slice(`${rawCode}`.length);
      return Util.range(count).map(n => +paddedCode.substr(2 - n, 1)).slice(0, count);
   }

   instructionLength(opcode : number) : number {
      if (opcode >= 1 && opcode <= 2) return 4;
      if (opcode >= 3 && opcode <= 4) return 2;
      if (opcode >= 5 && opcode <= 6) return 3;
      if (opcode >= 7 && opcode <= 8) return 4;
      if (opcode === 9) return 2;
      return 1;
   }

   decode(fromPtr : number) : IInstruction {
      const rawInst = this.load(fromPtr);
      const opcode = rawInst % 100;
      const length = this.instructionLength(opcode);
      const modes = this.instructionModes(rawInst, length - 1);
      const operands = this.loadArray(fromPtr + 1, length - 1);

      return {
         opcode: opcode,
         operands: operands,
         modes: modes,
      }
   }

   dump() : number[] {
      return this._memory;
   }

   load(address : number) : number {
      const result = this._memory[address];
      return typeof result === 'undefined' ? 0 : result;
   }

   loadArray(address : number, length : number) : number[] {
      return Util.range(length, 0).map(n => this.load(address + n));
   }

   store(address : number, value : number) : void {
      this._memory[address] = value;
   }

   step(untilCodes : number[]) : boolean {
      const inst = this.decode(this._instPtr);
      const offset = (n : number) => { return inst.modes[n] === 2 ? this._basePtr : 0; }
      const deref = (n : number) => { return inst.modes[n] === 1 ? inst.operands[n] : this.load(inst.operands[n] + offset(n)); }
      let nextInstPtr = this._instPtr + this.instructionLength(inst.opcode);

      //logger.info(`ip=${this._instPtr} :: ${JSON.stringify(inst)}`);

      switch(inst.opcode) {
         case 1: this.store(inst.operands[2] + offset(2), deref(0) + deref(1)); break;
         case 2: this.store(inst.operands[2] + offset(2), deref(0) * deref(1)); break;
         case 3: this.store(inst.operands[0] + offset(0), this._iostream.read()); break;
         case 4: this._iostream.write(deref(0)); break;
         case 5: nextInstPtr = deref(0) === 0 ? nextInstPtr : deref(1); break;
         case 6: nextInstPtr = deref(0) === 0 ? deref(1) : nextInstPtr; break;
         case 7: this.store(inst.operands[2] + offset(2), deref(0) < deref(1) ? 1 : 0); break;
         case 8: this.store(inst.operands[2] + offset(2), deref(0) === deref(1) ? 1 : 0); break;
         case 9: this._basePtr += deref(0); break;
         case 99: this.halt = true; nextInstPtr = this._instPtr; break;
         default: throw new Error(`Invalid instruction: ${inst.opcode}`);
      }

      this._instPtr = nextInstPtr;
      return !untilCodes.includes(inst.opcode);
   }

   runToPause() : IntComputer {
      while(this.step([99,4]));
      return this;
   }

   runToHalt() : IntComputer {
      while(this.step([99]));
      return this;
   }
}

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