
import { ISolution, InputFile, Util } from '../shared';
import { Compass, CompassTurn, IPosition } from '../shared';
import { IntComputer, IIntStream } from '../intcode';
//const logger = Util.createLogger();

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