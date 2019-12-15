
import { ISolution, InputFile, Util } from '../shared';
const logger = Util.createLogger();

export interface Chemical {
   code : string;
   amount : number;
}

export interface Reaction {
   product : Chemical;
   reactants : Chemical[];
}

export interface Dictionary<T> {
   [key: string]: T;
}

export interface ReactionTable {
   [code: string]: Reaction;
}

export class FuelFactory {
   reactions : Dictionary<Reaction> = {}
   store : Dictionary<number> = {}

   constructor(reactions : Reaction[]) {
      for (const reaction of reactions) {
         this.reactions[reaction.product.code] = reaction;
         this.store[reaction.product.code] = 0;
      }
      this.store['ORE'] = 0;
   }

   static fromInput(input : string[]) : FuelFactory {
      let reactions : Reaction[] = [];

      const ratioMatch = (s : string) : Chemical => {
         const m = /(\d+) ([A-Z]+)/.exec(s.trim());
         return { code: m![2], amount: +(m![1]) };
      };

      for (const line of input) {
         const [partA, partB] = line.split(' => ').map(s => s.trim());

         reactions.push({
            product: ratioMatch(partB),
            reactants: partA.split(',').map(ratioMatch)
         });
      }

      return new FuelFactory(reactions);
   }

   createFuel() {
      this.process('FUEL');

      const products = Object.keys(this.store).filter(k => k !== 'FUEL' && k !== 'ORE');
      const findDeficit = () : string => {
         const x = products.filter(k => this.store[k] < 0);
         return x.length > 0 ? x[0] : '';
      }

      let next = findDeficit()
      while (next !== '') {
         this.process(next);
         next = findDeficit();
      }
   }

   process(code: string) {
      const reaction = this.reactions[code];
      this.store[reaction.product.code] += (reaction.product.amount);
      for (const reactant of reaction.reactants) {
         this.store[reactant.code] -= (reactant.amount);
      }
   }

   printStore() {
      const keys = Object.keys(this.store).sort();
      for (const key of keys) {
         logger.info(`${key}: ${this.store[key]}`);
      }
   }
}

class Solution implements ISolution {
   dayNumber : number = 14;

   solvePart1() : string {
      const input = new InputFile(this.dayNumber).readLines();
      const factory = FuelFactory.fromInput(input);
      factory.createFuel();

      return ''+(-factory.store['ORE']);
   }

   solvePart2() : string {

      // TODO
      return ''
   }
}

export default new Solution() as ISolution;