
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