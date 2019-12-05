
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
   stdin : string = '';
   stdout : string = '';

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
      return this._memory[address];
   }

   loadArray(address : number, length : number) : number[] {
      return Util.range(length, 0).map(n => this._memory[address + n]);
   }

   store(address : number, value : number) : void {
      this._memory[address] = value;
   }

   step() : boolean {
      const inst = this.decode(this._instPtr);
      const deref = (n : number) => inst.modes[n] ? inst.operands[n] : this.load(inst.operands[n]);
      let nextInstPtr = this._instPtr + this.instructionLength(inst.opcode);

      //logger.info(`ip=${this._instPtr} :: ${JSON.stringify(inst)}`);

      switch(inst.opcode) {
         case 1: this.store(inst.operands[2], deref(0) + deref(1)); break;
         case 2: this.store(inst.operands[2], deref(0) * deref(1)); break;
         case 3: this.store(inst.operands[0], +(this.stdin[0])); this.stdin = this.stdin.slice(1); break;
         case 4: this.stdout += deref(0); break;
         case 5: nextInstPtr = deref(0) === 0 ? nextInstPtr : deref(1); break;
         case 6: nextInstPtr = deref(0) === 0 ? deref(1) : nextInstPtr; break;
         case 7: this.store(inst.operands[2], deref(0) < deref(1) ? 1 : 0); break;
         case 8: this.store(inst.operands[2], deref(0) === deref(1) ? 1 : 0); break;
         case 99: return false;
         default: throw new Error(`Invalid instruction: ${inst.opcode}`);
      }

      this._instPtr = nextInstPtr;
      return true;
   }

   run(stdin : string) : string {
      this.stdin = stdin;
      while (this.step());
      return this.stdout;
   }
}

class Solution implements ISolution {
   dayNumber : number = 5;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const output = IntComputer.fromInput(inputFile.readText()).run('1');
      const outputGood = '000000000';

      if (output.startsWith(outputGood)) {
         return output.substring(outputGood.length);
      }
      return 'incorrect: '+output;
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      return IntComputer.fromInput(inputFile.readText()).run('5');
   }
}

export default new Solution() as ISolution;
