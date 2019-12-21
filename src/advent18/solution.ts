
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
   isKey() : boolean { return (this.glyph >= 'a' && this.glyph <= 'z') || this.glyph === '@'; }
}

export class VaultMaze {
   board: VaultSquare[][] = [];
   keys: Dictionary<VaultSquare> = {};
   doors: Dictionary<VaultSquare> = {};
   costs: Dictionary<number> = {};
   //origin: VaultSquare = new VaultSquare(0, 0, '@');
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
            maze.board[y].push(sq);
         }
      }

      for (let y = 1; y < maze.board.length - 1; y++) {
         for (let x = 1; x < maze.board[y].length - 1; x++) {
            maze.addNode(maze.squareAt(x, y));
         }
      }

      // Pre-calculate key costs
      /*
      let costNames = maze.keyNames();
      for (let j = 0; j < costNames.length; j++) {
         for (let i = 0; i < costNames.length; i++) {
            if (costNames[i] < costNames[j]) {
               const from = maze.keys[costNames[i]]
               const to = maze.keys[costNames[j]];

               const cost = maze.graph.path(from.id(), to.id(), { cost: true }).cost;
               console.log(`saving cost ${costNames[i]}${costNames[j]} = ${cost}`)
               maze.costs[`${costNames[i]}${costNames[j]}`] = cost;
               maze.costs[`${costNames[j]}${costNames[i]}`] = cost;
            }
         }
      }
      */

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
      this.graph.addNode(sq.id(), edges);
   }

   pathToKey(from: VaultSquare, keyName: string, collected: string) : PathCost {
      const isLocked = (name: string) => !collected.includes(name.toLowerCase());
      const lockedDoors = this.doorNames().filter(isLocked).map(d => this.doors[d].id())
      return this.graph.path(from.id(), this.keyId(keyName), { avoid: lockedDoors, cost: true })
   }

   availableKeys(from: VaultSquare, collected: string) : VaultWalk[] {
      return this.keyNames()
         .filter(k => !collected.includes(k))
         .map(k => { return <VaultWalk>{ glyph: k, walk: this.pathToKey(from, k, collected) } })
         .filter(p => p.walk.path != null);
   }

   shortestPathToKeys() : number {
      const minCost = this.collectNextKey(this.keys['@'], '@', 0);

      /*
      const allCosts = Object.keys(this.costs)
         .filter(k => k.length === this.keyNames().length)
         .map(k => this.costs[k]);

      const minCost = Math.min(...allCosts);
      */

      console.log(`\nRESULT >> cost = ${minCost}`);
      return minCost;
   }

   findCostToKey(from: string, to: string) : number {
      return this.graph.path(this.keys[from].id(), this.keys[to].id(), { cost: true }).cost;
   }

   collectNextKey(pos: VaultSquare, collected: string, sunkCost: number): number {

      const available = this.availableKeys(pos, collected);
      let bestCost : number = 1000000000;

      if (available.length === 0) {
         return sunkCost;
      }

      //console.log(`\nCOLLECT NEXT (${pos.id()} = "${pos.glyph}")  Collected: "${collected}"`);
      //console.log(`>> AVAILABLE: [${available.map(a => a.glyph).join(',')}]`);

      for (let k of available) {
         const collectedPath = collected + k.glyph;
         const nextPath = `${pos.glyph}${k.glyph}`;
         console.log(collectedPath);

         if (!Object.keys(this.costs).includes(nextPath)) {
            //console.log(`calculating cost...`)
            const nextCost = this.findCostToKey(pos.glyph, k.glyph);
            this.costs[nextPath] = nextCost

            //console.log(`next ${nextCost} calc ${calcCost}`)
            //console.log(`saving cost for ${collectedPath} (${calcCost})`)
            //this.costs[collectedPath] = sunkCost + nextCost;

            //console.log(this.costs);
         }

         const fullCost = this.collectNextKey(this.keys[k.glyph], collectedPath, sunkCost + this.costs[nextPath]);

         if (fullCost < bestCost) {
            bestCost = fullCost;
         }
      }
      return bestCost;
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