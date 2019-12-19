
import * as fs from 'fs';
import * as os from 'os';
import winston from 'winston';

export interface ISolution {
   readonly dayNumber: number;
   solvePart1() : string;
   solvePart2() : string;
}

export enum Compass {
   North = 0,
   East = 1,
   South = 2,
   West = 3
}

export function CompassTurn(direction : Compass, left : boolean) : Compass {
   return (direction + (left ? 3 : 1)) % 4;
}

export interface IPosition extends Vec2 {}

export interface Vec2 {
   x : number,
   y : number
}

export interface Vec3 {
   x : number;
   y : number;
   z : number;
}

export class Vector2 implements Vec2 {
   constructor(public x: number, public y: number) {}
}

export class Vector3 implements Vec3 {
   constructor(public x: number, public y: number, public z: number) {}
}

export interface Dictionary<T> {
   [key: string]: T;
}

export class InputFile {
   _fileName : string;

   constructor(dayNumber : number) {
      this._fileName = `./src/advent${(''+dayNumber).padStart(2,'0')}/input.txt`;
   }

   readLines() : string[] {
      return this.readText().split(os.EOL);
   }

   readText() : string {
      return fs.readFileSync(this._fileName, 'utf8');
   }
}

export class OutputFile {
   _fileName : string;

   constructor(fileName : string) {
      this._fileName = fileName;
   }

   writeLines(lines : string[]) {
      this.writeText(lines.join(os.EOL));
   }

   writeText(text : string) {
      fs.writeFileSync(this._fileName, text, 'utf8');
   }
}

export class Util {
   static range(size : number, startAt : number = 0) : number[] {
      return [...Array(size).keys()].map(i => i + startAt);
   }

   static padZero(value : number, size : number) {
      return (''+value).padStart(size, '0');
   }

   static createLogger() : any {
      const logger = winston.createLogger({
         level: 'info',
         format: winston.format.simple(),
         transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: './output.log' })
         ]
      });

      return {
         info(msg : string) {
            logger.info(msg);
         },
         write(obj : any) {
            logger.info(JSON.stringify(obj));
         }
      }

   }
}