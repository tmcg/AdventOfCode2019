
import solution, { FuelFactory } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should process first sample', () => {
      const input = [
         '10 ORE => 10 A',
         '1 ORE => 1 B',
         '7 A, 1 B => 1 C',
         '7 A, 1 C => 1 D',
         '7 A, 1 D => 1 E',
         '7 A, 1 E => 1 FUEL',
      ];
      const factory = FuelFactory.fromInput(input);
      factory.createFuel(1);

      expect(factory.store['ORE']).to.equal(-31);
  });


  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('371695');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('4052920');
  });
});
