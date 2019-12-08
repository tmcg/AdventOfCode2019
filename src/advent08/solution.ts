
import { ISolution, InputFile, Util } from '../shared';
//const logger = Util.createLogger();

type Layer = number[][];

export function loadSingleLayer(input : string, width : number, height : number, index : number) : Layer {
   let rows : Layer = [];
   let start = index * width * height;

   for (let j = 0; j < height; j++) {
      let row : number[] = [];
      for (let i = 0; i < width; i++) {
         row.push(+input.substr(start + (width * j) + i, 1));
      }
      rows.push(row);
   }

   return rows;
}

export function loadLayers(input : string, width : number, height : number) : Layer[] {
   const layers : Layer[] = [];
   const count = input.length/(width*height);
   for (let i = 0; i < count; i++) {
      layers.push(loadSingleLayer(input, width, height, i));
   }
   return layers;
}

export function countOfNumber(layer : Layer, n : number) {
   let count = 0;
   for(let j = 0; j < layer.length; j++) {
      for (let i = 0; i < layer[j].length; i++) {
         count += layer[j][i] === n ? 1 : 0;
      }
   }
   return count;
}


class Solution implements ISolution {
   dayNumber : number = 8;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readText();
      const width = 25, height = 6;
      const layers = loadLayers(input, width, height);

      let bestCount = -1;
      let bestLayer : Layer = layers[0];
      for (const currLayer of layers) {
         const currCount = countOfNumber(currLayer, 0);
         if (currCount < bestCount || bestCount < 0) {
            bestCount = currCount;
            bestLayer = currLayer;
         }
      }

      return ''+(countOfNumber(bestLayer,1)*countOfNumber(bestLayer,2));
   }

   solvePart2() : string {
      const input = new InputFile(this.dayNumber).readText();
      const width = 25, height = 6;
      const layers = loadLayers(input, width, height);

      for (let j = 0; j < height; j++) {
         let row = '', pixel = '';
         for (let i = 0; i < width; i++) {
            for (let d = 0; d < layers.length; d++) {
               pixel = layers[d][j][i] === 0 ? 'x' : ' ';
               if (layers[d][j][i] < 2) {
                  break;
               }
            }
            row += pixel;
         }
         //logger.info(row);
      }

      return 'ZFLBY'; // inspect image for code
   }
}

export default new Solution() as ISolution;
