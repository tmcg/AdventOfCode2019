
import * as fs from 'fs';
import * as os from 'os';
import winston from 'winston';

export interface ISolution {
   readonly dayNumber: Number;
   solvePart1() : string;
   solvePart2() : string;
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

   static createLogger() : winston.Logger {
      return winston.createLogger({
         level: 'info',
         format: winston.format.simple(),
         transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: './output.log' })
         ]
      })
   }
}