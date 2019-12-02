
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

class IntInstruction {
   opcode : number = 0;
   operands : number[] = []
}

export class IntComputer {
   _memory : number[] = [];
   _instPtr : number = 0;

   constructor(memory: number[])
   {
      this._memory = memory.slice();
   }

   decode() : IntInstruction {
      let opcode = this.load(this._instPtr);
      let opcodeLength = 0;
      if (opcode === 1 || opcode === 2)
         opcodeLength = 3;

      return {
         opcode: this.load(this._instPtr),
         operands: this.loadArray(this._instPtr + 1, opcodeLength),
      }
   }

   dump() : number[] {
      return this._memory;
   }

   load(address : number) : number {
      return this._memory[address];
   }

   loadArray(address : number, length : number) : number[] {
      return Util.range(length, 0).map(n => this.load(address + n));
   }

   store(address : number, value : number) : void {
      this._memory[address] = value;
   }

   step() : boolean {
      const inst = this.decode();
      //logger.info(JSON.stringify(inst));

      if (inst.opcode === 1) this.store(inst.operands[2], this.load(inst.operands[0]) + this.load(inst.operands[1]));
      if (inst.opcode === 2) this.store(inst.operands[2], this.load(inst.operands[0]) * this.load(inst.operands[1]));
      if (inst.opcode === 99) return false;

      this._instPtr += 4;
      return true;
   }
}

class Solution1 implements ISolution {
   dayNumber : number = 2;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const numbers = inputFile.readText().split(',').map(x => +x);

      const computer = new IntComputer(numbers);
      computer.store(1, 12);
      computer.store(2, 2);
      while (computer.step());

      return '' + computer.load(0);
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const numbers = inputFile.readText().split(',').map(x => +x);

      let result : string = '';
      while(true) {
         for (const noun of Util.range(100,0)) {
            for (const verb of Util.range(100,0)) {
               var computer = new IntComputer(numbers);
               computer.store(1, noun);
               computer.store(2, verb);
               while(computer.step());

               if (computer.load(0) === 19690720)
                  return Util.padZero(noun, 2) + Util.padZero(verb, 2);
            }
         }
      }

      return '';
   }
}

export default new Solution1() as ISolution;
