
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

export class Point {
   x : number;
   y : number;

   constructor(x : number = 0, y : number = 0) {
      this.x = x;
      this.y = y;
   }

   distance(p : Point) : number {
      // Manhattan distance between two points
      return Math.abs(this.x - p.x) + Math.abs(this.y - p.y);
   }

   translate(instruction : string) : Point {
      const count : number = +instruction.slice(1);

      switch(instruction.slice(0,1)) {
         case 'U': return new Point(this.x, this.y + count);
         case 'D': return new Point(this.x, this.y - count);
         case 'L': return new Point(this.x - count, this.y);
         case 'R': return new Point(this.x + count, this.y);
         default: throw new Error('Invalid direction');
      }
   }
}

export class Segment {
   a : Point;
   b : Point;
   rv : boolean;

   constructor(a : Point, b : Point, rv: boolean) {
      this.a = a;
      this.b = b;
      this.rv = rv;
   }

   start() : Point { return this.rv ? this.b : this.a; }
   finish() : Point { return this.rv ? this.a : this.b; }

   static parseInput(input : string[]) : Segment[] {
      let p1 = new Point();

      return input.map(s => {
         const rv = s[0] === 'L' || s[0] === 'U';
         const p0 = p1;
         p1 = p1.translate(s);

         return new Segment(rv ? p1 : p0, rv ? p0 : p1, rv);
      });
   }

   static findIntersects(wire1 : Segment[], wire2 : Segment[]) : Point[] {
      const result : Point[] = [];

      for (let i = 0; i < wire1.length; i++) {
         for (let j = 0; j < wire2.length; j++) {
            const segx = wire1[i].intersects(wire2[j]);
            for (const p of segx.filter(a => a.x !== 0 || a.y !== 0)) {
               result.push(p);
            }
         }
      }
      return result;
   }

   static signalToPoint(wire : Segment[], p : Point) {
      const pointTest = new Segment(p, p, false);
      let signalTime = 0;

      for(const segment of wire) {
         if (segment.intersects(pointTest).length > 0) {
            signalTime += p.distance(segment.start());
            break;
         }
         signalTime += segment.start().distance(segment.finish());
      }

      return signalTime;
   }

   isVertical() : boolean {
      return this.a.x === this.b.x;
   }

   intersects(that : Segment) : Point[] {
      // quick no intersection check
      if (this.a.x > that.b.x || this.b.x < that.a.x) { return []; }
      if (this.a.y < that.b.y || this.b.y > that.a.y) { return []; }

      // orthogonal intersection check
      if (this.isVertical() !== that.isVertical()) {
         let v = this.isVertical() ? this : that;
         let h = v !== this ? this : that;

         if (v.a.x >= h.a.x && v.a.x <= h.b.x && h.a.y <= v.a.y && h.a.y >= v.b.y)
            return [new Point(v.a.x, h.a.y)];
         return [];
      }

      // horizontal overlap check
      if (this.a.y === that.a.y && this.a.y === this.b.y && that.a.y === that.b.y) {
         const left = Math.max(this.a.x, that.a.x);
         const right = Math.min(this.b.x, that.b.x);
         return Util.range(right - left + 1, left).map(x => new Point(x, this.a.y));
      }

      // vertical overlap check
      if (this.a.x === that.a.x && this.a.x === this.b.x && that.a.x === that.b.x) {
         const bottom = Math.max(this.b.y, that.b.y);
         const top = Math.min(this.a.y, that.a.y);
         return Util.range(top - bottom + 1, bottom).map(y => new Point(this.a.x, y));
      }

      // no intersections
      return [];
   }
}

class Solution1 implements ISolution {
   dayNumber : number = 3;

   solvePart1() : string {
      const inputFile = new InputFile(this.dayNumber);
      const wires = inputFile.readLines().map(x => Segment.parseInput(x.split(',')));
      const wsx = Segment.findIntersects(wires[0], wires[1]);

      return ''+wsx
         .map(p => p.distance(new Point(0,0)))
         .reduce((min,dist) => dist < min ? dist : min);
   }

   solvePart2() : string {
      const inputFile = new InputFile(this.dayNumber);
      const wires = inputFile.readLines().map(x => Segment.parseInput(x.split(',')));
      const wsx = Segment.findIntersects(wires[0], wires[1]);

      return ''+wsx
         .map(p => Segment.signalToPoint(wires[0], p) + Segment.signalToPoint(wires[1], p))
         .reduce((min,dist) => dist < min ? dist : min);
   }
}

export default new Solution1() as ISolution;
