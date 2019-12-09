
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

interface IInstruction {
   opcode : number;
   operands : number[];
   modes : number[];
}

export class IntComputer {
   _memory : number[] = [];
   _instPtr : number = 0;
   _basePtr : number = 0;
   halt : boolean = false;
   stdin : number[] = [];
   stdout : number[] = [];

   constructor(memory: number[])
   {
      this._memory = memory.slice();
   }

   static fromInput(input : string) {
      return new IntComputer(input.split(',').map(s => +s));
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

   step() : boolean {
      const inst = this.decode(this._instPtr);
      const offset = (n : number) => { return inst.modes[n] === 2 ? this._basePtr : 0; }
      const deref = (n : number) => { return inst.modes[n] === 1 ? inst.operands[n] : this.load(inst.operands[n] + offset(n)); }
      let nextInstPtr = this._instPtr + this.instructionLength(inst.opcode);

      //logger.info(`ip=${this._instPtr} :: ${JSON.stringify(inst)}`);

      if (inst.opcode === 3 && this.stdin.length === 0)
         throw new Error(`No input available!`);

      switch(inst.opcode) {
         case 1: this.store(inst.operands[2] + offset(2), deref(0) + deref(1)); break;
         case 2: this.store(inst.operands[2] + offset(2), deref(0) * deref(1)); break;
         case 3: this.store(inst.operands[0] + offset(0), this.stdin[0]); this.stdin = this.stdin.slice(1); break;
         case 4: this.stdout.push(deref(0)); break;
         case 5: nextInstPtr = deref(0) === 0 ? nextInstPtr : deref(1); break;
         case 6: nextInstPtr = deref(0) === 0 ? deref(1) : nextInstPtr; break;
         case 7: this.store(inst.operands[2] + offset(2), deref(0) < deref(1) ? 1 : 0); break;
         case 8: this.store(inst.operands[2] + offset(2), deref(0) === deref(1) ? 1 : 0); break;
         case 9: this._basePtr += deref(0); break;
         case 99: this.halt = true; return false;
         default: throw new Error(`Invalid instruction: ${inst.opcode}`);
      }

      this._instPtr = nextInstPtr;
      if (inst.opcode === 4)
         return false;
      return true;
   }

   run() : number[] {
      while(this.step());
      return this.stdout;
   }

   runToHalt() : number[] {
      while(!this.halt)
         this.step();
      return this.stdout;
   }

   pipe(stdin: number[]) : IntComputer {
      this.stdin = this.stdin.concat(stdin);
      return this
   }
}

class Solution implements ISolution {
   dayNumber : number = 9;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const comp = IntComputer.fromInput(input).pipe([1])

      return ''+comp.runToHalt().join(',');
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const comp = IntComputer.fromInput(input).pipe([2])

      return ''+comp.runToHalt().join(',');
   }
}

export default new Solution() as ISolution;
