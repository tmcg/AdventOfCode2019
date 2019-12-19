
import { ISolution, InputFile, Util, Compass, Vector2, Dictionary } from '../shared';
import Graph from 'node-dijkstra';
//const logger = Util.createLogger();

interface PathCost {
   path: string[],
   cost: number
}

interface VaultWalk {
   glyph: string;
   walk: PathCost;
}

export class VaultSquare extends Vector2 {
   _id: string = '';
   glyph: string = '';

   constructor(x: number, y: number, glyph: string) {
      super(x, y);
      this.glyph = glyph;
   }

   id() : string {
      if (this._id === '')
         this._id = `${this.x},${this.y}`;
      return this._id;
   }

   isDoor() : boolean { return this.glyph >= 'A' && this.glyph <= 'Z'; }
   isKey() : boolean { return this.glyph >= 'a' && this.glyph <= 'z'; }
}

export class VaultMaze {
   board: VaultSquare[][] = [];
   keys: Dictionary<VaultSquare> = {};
   doors: Dictionary<VaultSquare> = {};
   origin: VaultSquare = new VaultSquare(0, 0, '@');
   graph: Graph = new Graph;

   doorNames = () => Object.keys(this.doors);
   keyNames = () => Object.keys(this.keys);
   doorId = (name: string) => this.doors[name].id();
   keyId = (name: string) => this.keys[name].id();
   width = () => this.board[0].length;
   height = () => this.board.length;

   static fromInput(input: string[]) : VaultMaze {
      const maze = new VaultMaze();

      // build board
      for (let y = 0; y < input.length; y++) {
         maze.board.push([]);
         for (let x = 0; x < input[y].length; x++) {
            const glyph = input[y][x];
            const sq = new VaultSquare(x, y, glyph);

            if (sq.isDoor()) { maze.doors[glyph] = sq; }
            if (sq.isKey()) { maze.keys[glyph] = sq; }
            if (glyph === '@') {
               maze.origin = sq;
            }
            maze.board[y].push(sq);
         }
      }

      for (let y = 1; y < maze.board.length - 1; y++) {
         for (let x = 1; x < maze.board[y].length - 1; x++) {
            maze.addNode(maze.squareAt(x, y));
         }
      }

      //TODO: simplify corridors & dead ends?
      return maze;
   }

   squareAt(x: number, y: number, d: Compass | null = null) {
      if (d === Compass.East) x++;
      if (d === Compass.West) x--;
      if (d === Compass.North) y--;
      if (d === Compass.South) y++;
      if (x < 0 || x >= this.width() || y < 0 || y >= this.height())
         throw new Error(`Invalid vault square: ${x},${y}`);
      return this.board[y][x];
   }

   addNode(sq: VaultSquare) {
      type EdgeRef = { [id: string]: number };

      const n = this.squareAt(sq.x, sq.y, Compass.North);
      const s = this.squareAt(sq.x, sq.y, Compass.South);
      const e = this.squareAt(sq.x, sq.y, Compass.East);
      const w = this.squareAt(sq.x, sq.y, Compass.West);

      let edges : EdgeRef = {}
      for (const neighbour of [n,s,e,w].filter(k => k.glyph !== '#')) {
         edges[neighbour.id()] = 1;
      }

      //this.nodesToAdd.push( { id: sq.id(), edges });
      this.graph.addNode(sq.id(), edges);
   }

   pathToKey(from: VaultSquare, keyName: string, collected: string[]) : PathCost {
      const isLocked = (name: string) => !collected.includes(name.toLowerCase());
      const lockedDoors = this.doorNames().filter(isLocked).map(d => this.doors[d].id())
      const found = this.graph.path(from.id(), this.keyId(keyName), { avoid: lockedDoors, cost: true })


      //const pathx = found.path !== null ? found.path.join('  ') : '(null)';
      //console.log(`>> path to ${keyName} = ${pathx}`);
      return found;
   }

   availableKeys(from: VaultSquare, collected: string[]) : VaultWalk[] {
      return this.keyNames()
         .filter(k => !collected.includes(k))
         .map(k => { return <VaultWalk>{ glyph: k, walk: this.pathToKey(from, k, collected) } })
         .filter(p => p.walk.path != null);
   }

   logWalksCost(prefix: string, vw: VaultWalk[]) {
      console.log(`${prefix}${vw.map(w => w.glyph+'('+w.walk.cost+')').join(', ')}`);
   }

   totalCost(walks : VaultWalk[]) {
      return walks.map(w => w.walk.cost).reduce((a, c) => a + c);
   }

   shortestPathToKeys() : number {
      const walks = this.collectNextKey(this.origin, [], []);
      const cost = this.totalCost(walks);
      this.logWalksCost(`\nRESULT >> cost = ${cost}; path = `, walks);
      return cost;
   }

   collectNextKey(pos: VaultSquare, collected: string[], walks: VaultWalk[]): VaultWalk[] {

      // TODO:PRECOMPUTE KEY to KEY PATH COSTS!!!

      //console.log(`\nCOLLECT NEXT (${pos.id()} = "${pos.glyph}")  Collected: [${collected.join(',')}]`);
      const available = this.availableKeys(pos, collected);
      let bestWalk : VaultWalk[] = [];
      let bestCost : number = 1000000000;

      if (available.length === 0) {
         return walks;
      }

      //console.log(`>> Available: [${available.map(a => a.glyph).join(',')}]`);

      for (let k of available) {
         //console.log(`    >> Move To "${k.glyph}"`);

         // pick up any stray keys
         let nextPath = k.walk.path;
         let nextWalks = walks.concat(k);
         let nextCollected = collected.slice();
         for (let kn of this.keyNames()) {
            const kp = this.keys[kn].id();
            if (nextPath.includes(kp) && !collected.includes(kn)) {
               nextCollected.concat(kn);
            }
         }

         const fullWalk = this.collectNextKey(this.keys[k.glyph], nextCollected.concat(k.glyph), nextWalks);

         if (fullWalk.length > 0) {
            const fullCost = this.totalCost(fullWalk);
            //this.logWalksCost(`Walk: ${k.glyph} cost=${fullCost} >> `,fullWalk);

            if (fullWalk.length > 0 && fullCost < bestCost) {
               bestWalk = fullWalk;
               bestCost = fullCost;
            }
         }
      }
      return bestWalk;
   }
}

class Solution implements ISolution {
   dayNumber : number = 18;

   solvePart1() : string {
      //const input = new InputFile(this.dayNumber).readLines();
      //const maze = VaultMaze.fromInput(input);
      return '';//+maze.shortestPathToKeys();
   }

   solvePart2() : string {
      //const input = new InputFile(this.dayNumber).readLines();

      return '';
   }
}

export default new Solution() as ISolution;