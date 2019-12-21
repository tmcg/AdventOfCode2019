
import { ISolution, InputFile } from '../shared';
import { IntComputer, BasicIntStream } from '../intcode';

export class SpringDroid extends BasicIntStream {
   program : IntComputer;

   constructor(input : string) {
      super();
      this.program = IntComputer.fromInput(input, this);
   }

   command(value: string) {
      this.pipe((value+'\n').split('').map(c => c.charCodeAt(0)));
   }

   survey(speed : 'WALK' | 'RUN') {
      this.command(speed);
      this.program.runToHalt();

      const damage = this.output.filter(n => n >= 256);
      if (damage.length > 0) {
         return damage[0];
      }

      let debug = '';
      for (let n of this.output) {
         debug += n < 256 ? String.fromCharCode(n) : ''+n;
      }
      console.log(debug);
      return 0;
   }
}

class Solution implements ISolution {
   dayNumber : number = 21;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const droid = new SpringDroid(input);

      droid.command('NOT C J');
      droid.command('NOT J J');
      droid.command('NOT B T');
      droid.command('NOT T T');
      droid.command('AND T J');
      droid.command('NOT J J');
      droid.command('NOT D T');
      droid.command('NOT T T');
      droid.command('AND T J');
      droid.command('NOT A T');
      droid.command('OR T J');

      return ''+droid.survey('WALK');
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const droid = new SpringDroid(input);

      // not working...
      droid.command('NOT C J');
      droid.command('NOT J J');
      droid.command('NOT B T');
      droid.command('NOT T T');
      droid.command('AND T J');
      droid.command('NOT J J');
      droid.command('NOT D T');
      droid.command('NOT T T');
      droid.command('AND T J');
      droid.command('NOT A T');
      droid.command('OR T J');

      return ''+droid.survey('RUN');
   }
}

export default new Solution() as ISolution;