
import { ISolution, InputFile, Util, Vector2, Vec2, Compass, Dictionary } from '../shared';
import Graph from 'node-dijkstra';
import readlineSync from 'readline-sync';
const logger = Util.createLogger();

export class MazeSquare extends Vector2 {
   glyph: string = ''
   label: string = '';

   constructor(x: number, y: number, glyph: string, label: string = '') {
      super(x, y);
      this.glyph = glyph;
      this.label = label;
   }
}

export class Maze {
   board: Dictionary<MazeSquare> = {}
   graph: Graph = new Graph;
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

      // squares
      for (let j = 2; j < input.length - 2; j++) {
         for (let i = 2; i < input[j].length - 2; i++) {
            const ch = input[j][i];
            const glyph = ch === '#' || ch === '.' ? ch : ' ';
            const pos = { x: i - 2, y: j - 2 }
            ext1.x = Math.min(pos.x, ext1.x);
            ext1.y = Math.min(pos.y, ext1.y);
            ext2.x = Math.max(pos.x, ext2.x);
            ext2.y = Math.max(pos.y, ext2.y);

            const sq = new MazeSquare(pos.x, pos.y, glyph)

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

            result.board[sq.id()] = sq;
         }
      }
      result.extent1 = ext1
      result.extent2 = ext2

      result.fillInDeadEnds();
      result.buildGraph();

      return result;
   }

   fillInDeadEnds() {
      let deadEnds = 1;
      while (deadEnds > 0) {
         deadEnds = 0;

         for (let j = this.extent1.y + 1; j <= this.extent2.y - 1; j++) {
            for (let i = this.extent1.x + 1; i <= this.extent2.x - 1; i++) {
               const sq = this.squareAt(i, j)!;
               const n = this.glyphAt(i, j, Compass.North);
               const s = this.glyphAt(i, j, Compass.South);
               const e = this.glyphAt(i, j, Compass.East);
               const w = this.glyphAt(i, j, Compass.West);

               let g = [n,s,e,w].sort().join('');
               if (sq.glyph === '.' && g === '###.') {
                  sq.glyph = '#';
                  deadEnds++;
               }
            }
         }
      }
   }

   buildGraph() {
      for (let y = this.extent1.y; y <= this.extent2.y; y++) {
         for (let x = this.extent1.x; x <= this.extent2.x; x++) {
            this.addNode(this.squareAt(x, y)!);
         }
      }
   }

   addNode(sq: MazeSquare) {
      type EdgeRef = { [id: string]: number };

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
            edges[neighbour!.id()] = 1;
         }

         // add the linked squares
         if (sq.label !== '') {
            const portals = this.findPortals(sq.label);
            if (portals.length > 2)
               throw new Error(`too many portals! ${sq.id()}${portals.length}`);

            if (portals.length >= 2) {
               edges[portals.filter(p => p !== sq.id())[0]] = 1;
            }
         }

         this.graph.addNode(sq.id(), edges);
      }
   }

   findPortals(label: string) {
      return Object.keys(this.board).filter(k => this.board[k].label === label);
   }

   findMazePath() {
      const startId = this.board[this.findPortals('AA')[0]].id();
      const finishId = this.board[this.findPortals('ZZ')[0]].id();

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
      //maze.print();

      return ''+maze.findMazePath();
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readLines();

      return '';
   }
}

export default new Solution() as ISolution;
