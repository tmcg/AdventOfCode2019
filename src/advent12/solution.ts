
import { ISolution, InputFile, Util, Vec3 } from '../shared';
import { lcm } from 'mathjs';
//const logger = Util.createLogger();

class Moon {
   position: Vec3;
   velocity: Vec3;

   constructor(p: Vec3, v: Vec3) {
      this.position = p;
      this.velocity = v;
   }

   applyGravity(other : Moon) {
      let dx = this.position.x - other.position.x;
      let dy = this.position.y - other.position.y;
      let dz = this.position.z - other.position.z;
      if (dx !== 0) {
         dx = dx/Math.abs(dx);
         this.velocity.x -= dx;
         other.velocity.x += dx;
      }
      if (dy !== 0) {
         dy = dy/Math.abs(dy);
         this.velocity.y -= dy;
         other.velocity.y += dy;
      }
      if (dz !== 0) {
         dz = dz/Math.abs(dz);
         this.velocity.z -= dz;
         other.velocity.z += dz;
      }
   }

   applyVelocity() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.position.z += this.velocity.z;
   }

   calculateEnergy(v : Vec3) : number {
      return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
   }

   potentialEnergy() : number {
      return this.calculateEnergy(this.position);
   }

   kineticEnergy() : number {
      return this.calculateEnergy(this.velocity);
   }
}

class Solution implements ISolution {
   dayNumber : number = 12;

   readInput() : Moon[] {
      const inputFile = new InputFile(this.dayNumber);

      return inputFile.readLines().map(m => {
         const rv = /<x=(.*), y=(.*), z=(.*)>/.exec(m)!;
         const mp = <Vec3>{ x: +rv[1], y: +rv[2], z: +rv[3] };
         const mv = <Vec3>{ x: 0, y: 0, z: 0 };
         return new Moon(mp, mv);
      });
   }

   timeStep(moons: Moon[]) {

      /*
      logger.info(`step: ${t}`);
      for (const moon of moons) {
         const p = moon.position;
         const v = moon.velocity;
         logger.info(`pos=(${p.x},${p.y},${p.z})  vel=(${v.x},${v.y},${v.z})`);
      }
      */

      for (let j = 0; j < moons.length; j++) {
         for (let i = 0; i < moons.length; i++) {
            if (j > i)
               moons[i].applyGravity(moons[j]);
         }
      }

      for (const moon of moons) {
         moon.applyVelocity();
      }
   }

   solvePart1() : string {
      const moons = this.readInput();
      for (let t = 0; t < 1000; t++)
         this.timeStep(moons);

      return ''+moons.map(m => m.potentialEnergy() * m.kineticEnergy()).reduce((a,b) => a + b, 0);
   }

   solvePart2() : string {
      const moons = this.readInput();

      let cycle = 0;
      let foundX = -1;
      let foundY = -1;
      let foundZ = -1;
      let setX = new Set();
      let setY = new Set();
      let setZ = new Set();

      const cycleState = (mx : Moon[], cf: (v : Vec3) => number) =>
         mx.map(m => `${cf(m.position)}+${cf(m.velocity)}`).join('|');

      while (foundX < 0 || foundY < 0 || foundZ < 0) {
         this.timeStep(moons);
         if (foundX < 0) {
            let pv = cycleState(moons, (v) => v.x);
            if (setX.has(pv))
               foundX = cycle;
            setX.add(pv);
         }
         if (foundY < 0) {
            let pv = cycleState(moons, (v) => v.y);
            if (setY.has(pv))
               foundY = cycle;
            setY.add(pv);
         }
         if (foundZ < 0) {
            let pv = cycleState(moons, (v) => v.z);
            if (setZ.has(pv))
               foundZ = cycle;
            setZ.add(pv);
         }
         cycle++;
      }

      //logger.info(`${foundX},${foundY},${foundZ}`);
      return ''+lcm(foundX, lcm(foundY, foundZ));
   }
}

export default new Solution() as ISolution;