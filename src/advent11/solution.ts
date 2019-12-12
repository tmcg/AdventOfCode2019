
import { ISolution, InputFile, Util } from '../shared';
import { Compass, CompassTurn, IPosition } from '../shared';
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

export class Robot implements IIntStream {
   painting : boolean = true;
   blackPanels : string[] = [];
   whitePanels : string[] = [];
   direction : Compass = Compass.North;
   position : IPosition = { x: 0, y: 0 };
   program : IntComputer;

   constructor(input : string) {
      this.program = IntComputer.fromInput(input, this);
   }

   getPanelName() : string {
      return `${this.position.x},${this.position.y}`;
   }

   read() : number {
      return this.whitePanels.includes(this.getPanelName()) ? 1 : 0;
   }

   write(n : number) : void {
      if (this.painting) {
         // first output (paint)
         const panel = this.getPanelName();
         const apx = n === 0 ? this.blackPanels : this.whitePanels;
         const rpx = n === 0 ? this.whitePanels : this.blackPanels;

         if (!apx.includes(panel))
            apx.push(panel);
         if (rpx.includes(panel))
            rpx.splice(rpx.indexOf(panel), 1);
      } else {
         // second output (turn/move)
         this.direction = CompassTurn(this.direction, n === 0);
         switch (this.direction) {
            case Compass.North: this.position.y += 1; break;
            case Compass.South: this.position.y -= 1; break;
            case Compass.West: this.position.x -= 1; break;
            case Compass.East: this.position.x += 1; break;
         }
      }

      this.painting = !this.painting;
   }

   paint(startWhite : boolean = false) : Robot {
      if (startWhite)
         this.whitePanels = [this.getPanelName()];

      this.program.runToHalt();
      return this;
   }
}

class Solution implements ISolution {
   dayNumber : number = 11;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const robot = new Robot(input).paint();

      return ''+(robot.blackPanels.length + robot.whitePanels.length);
   }

   solvePart2() : string {
      /*
      const input = new InputFile(this.dayNumber).readText();
      const robot = new Robot(input).paint(true);

      // find dimensions
      for(let panel of robot.whitePanels)
         logger.info(panel);

      // print panels
      for (let j = 0; j < 6; j++) {
         let s = '';
         for (let i = 0; i < 40; i++) {
            s += robot.whitePanels.includes(`${i},${-j}`) ? '#' : ' ';
         }
         logger.info(s);
      }
      */

      return 'CBLPJZCU'
   }
}

export default new Solution() as ISolution;