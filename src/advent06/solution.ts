
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

interface Orbit {
   bodyName : string;
   satelliteName : string;
}

interface OrbitPath {
   body: SpaceBody;
   path: string[];
}

export class SpaceBody {
   name : string;
   satellites : SpaceBody[] = [];

   constructor(name : string) {
      this.name = name;
   }

   static fromInput(input : string[]) : SpaceBody {
      const centerOfMass = new SpaceBody('COM');
      const inputOrbits = input.map(x => {
         const s = x.split(')');
         return <Orbit>{ bodyName: s[0], satelliteName: s[1]};
      });

      return centerOfMass.createOrbits(inputOrbits);
   }

   createOrbits(orbits : Orbit[]) : SpaceBody {
      for (const orbit of orbits.filter(o => o.bodyName === this.name)) {
         this.satellites.push(new SpaceBody(orbit.satelliteName).createOrbits(orbits));
      }
      return this;
   }

   findTotalOrbits(depth : number) : number {
      let totalOrbits = depth;
      for (const satellite of this.satellites) {
         totalOrbits += satellite.findTotalOrbits(depth + 1);
      }

      return totalOrbits;
   }

   *findOrbitPaths() : IterableIterator<OrbitPath> {
      yield { body: this, path: [] };

      for (let satellite of this.satellites) {
         for (let s of satellite.findOrbitPaths()) {
            yield { body: s.body, path: [this.name, ...s.path] };
         }
      }
   }
}

class Solution implements ISolution {
   dayNumber : number = 6;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const system = SpaceBody.fromInput(inputFile.readLines());

      return ''+system.findTotalOrbits(0);
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const system = SpaceBody.fromInput(inputFile.readLines());

      const orbitPaths = [...system.findOrbitPaths()];
      const san = orbitPaths.filter(p => p.body.name === 'SAN')[0];
      const you = orbitPaths.filter(p => p.body.name === 'YOU')[0];

      const commonPath = san.path.filter(p => you.path.includes(p));
      return ''+(san.path.length + you.path.length - (commonPath.length * 2));
   }
}

export default new Solution() as ISolution;
