
import { ISolution, InputFile, Util, Vector2, Vec2, Compass, Dictionary } from '../shared';
import Graph from 'node-dijkstra';
import readlineSync from 'readline-sync';
const logger = Util.createLogger();

export class MazeSquare extends Vector2 {
   glyph: string = ''
   label: string = '';
   outer: boolean = false;

   constructor(x: number, y: number, glyph: string, label: string = '', outer: boolean = false) {
      super(x, y);
      this.glyph = glyph;
      this.label = label;
      this.outer = outer;
   }
}

export class Maze {
   board: Dictionary<MazeSquare> = {}
   graph: Graph = new Graph;
   portals: MazeSquare[] = [];
   extent1: Vec2 = { x: 0, y: 0 }
   extent2: Vec2 = { x: 0, y: 0 }

   squareFrom(sq: MazeSquare, d: Compass) : MazeSquare | null {
      return this.squareAt(sq.x, sq.y, d);
   }

   squareAt(x: number, y: number, d: Compass | null = null) : MazeSquare | null {
      if (d === Compass.East) x++;
      if (d === Compass.West) x--;
      if (d === Compass.North) y--;
      if (d === Compass.South) y++;

      const id = `${x},${y}`;
      return id in this.board ? this.board[id] : null;
   }

   glyphAt(x: number, y: number, d: Compass | null = null) : string {
      const sq = this.squareAt(x, y, d);
      return sq !== null ? sq.glyph : ' ';
   }

   static fromInput(input: string[]) : Maze {
      const result = new Maze();
      let ext1: Vec2 = { x: 0, y: 0 }
      let ext2: Vec2 = { x: 0, y: 0 }

      let jmin = 2, jmax = input.length - 2;
      let imin = 2, imax = input[0].length - 2;

      // squares
      for (let j = jmin; j < jmax; j++) {
         for (let i = jmin; i < imax; i++) {
            const ch = input[j][i];
            const glyph = ch === '#' || ch === '.' ? ch : ' ';
            const pos = { x: i - imin, y: j - jmin }
            ext1.x = Math.min(pos.x, ext1.x);
            ext1.y = Math.min(pos.y, ext1.y);
            ext2.x = Math.max(pos.x, ext2.x);
            ext2.y = Math.max(pos.y, ext2.y);

            const outer = i === imin || j === jmin || imax === i + 1 || jmax === j + 1;
            const sq = new MazeSquare(pos.x, pos.y, glyph, '', outer);

            // labels
            if (glyph === '.') {
               const left = input[j].substr(i - 2, 2);
               const right = input[j].substr(i + 1, 2);
               const up = input[j - 2][i] + input[j - 1][i];
               const down = input[j + 1][i] + input[j + 2][i];
               const label = /[A-Z][A-Z]/;
               if (left.match(label))
                  sq.label = left;
               else if (right.match(label))
                  sq.label = right;
               else if (up.match(label))
                  sq.label = up;
               else if (down.match(label))
                  sq.label = down;
            }
            if (sq.label !== '')
               result.portals.push(sq);
            result.board[sq.id()] = sq;
         }
      }
      result.extent1 = ext1
      result.extent2 = ext2
      return result;
   }

   buildGraph(level : number) {
      for (let y = this.extent1.y; y <= this.extent2.y; y++) {
         for (let x = this.extent1.x; x <= this.extent2.x; x++) {
            this.addNode(this.squareAt(x, y)!, level);
         }
      }
   }

   addNode(sq: MazeSquare, level: number) {
      type EdgeRef = { [id: string]: number };
      const squareId = sq.id();
      const levelId = ','+level;

      if (sq.glyph === '.') {
         const neighbours : (MazeSquare | null)[] = [
            this.squareAt(sq.x, sq.y, Compass.North),
            this.squareAt(sq.x, sq.y, Compass.South),
            this.squareAt(sq.x, sq.y, Compass.East),
            this.squareAt(sq.x, sq.y, Compass.West),
         ]

         // add the neighbours
         let edges : EdgeRef = {}
         for (const neighbour of neighbours.filter(k => k !== null && k.glyph === '.')) {
            edges[neighbour!.id() + levelId] = 1;
         }

         // add the linked squares
         if (sq.label !== '' && sq.label !== 'AA' && sq.label !== 'ZZ') {
            const portals = this.portals.filter(p => p.label === sq.label && p.id() != squareId);
            const edgeId = level >= 0 ? ',' + (sq.outer ? (level - 1) : (level + 1)) : levelId;
            edges[portals[0].id() + edgeId] = 1;
         }

         this.graph.addNode(sq.id() + levelId, edges);
      }
   }

   findMazePath(depth : number, topLevel: number) {
      Util.range(depth, topLevel).map(n => this.buildGraph(n));

      const startId = this.portals.filter(p => p.label === 'AA')[0].id()+','+topLevel;
      const finishId = this.portals.filter(p => p.label === 'ZZ')[0].id()+','+topLevel;

      return this.graph.path(startId, finishId, { cost: true }).cost;
   }

   print() : boolean {
      logger.info('');
      logger.write(this.extent1);
      logger.write(this.extent2);
      for (let j = this.extent1.y; j <= this.extent2.y; j++) {
         let row = '';
         for (let i = this.extent1.x; i <= this.extent2.x; i++) {
            row += this.glyphAt(i, j);
         }
         logger.info(row);
      }
      return readlineSync.keyInYNStrict('Continue?', { guide: true });
   }
}

class Solution implements ISolution {
   dayNumber : number = 20;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readLines();
      const maze = Maze.fromInput(input);
      return ''+maze.findMazePath(1, -1);
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readLines();
      const maze = Maze.fromInput(input);
      return ''+maze.findMazePath(50, 0);
   }
}

export default new Solution() as ISolution;
