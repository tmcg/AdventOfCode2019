
import solution from './solution';
import { IntComputer, BasicIntStream } from '../intcode';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should execute basic program 1', () => {
    const comp = new IntComputer([1,0,0,0,99], new BasicIntStream()).runToHalt();
    expect(comp.dump()).eql([2,0,0,0,99]);
  });

  it('should execute basic program 2', () => {
    const comp = new IntComputer([2,3,0,3,99], new BasicIntStream()).runToHalt();
    expect(comp.dump()).eql([2,3,0,6,99]);
  });

  it('should execute basic program 3', () => {
    const comp = new IntComputer([2,4,4,5,99,0], new BasicIntStream()).runToHalt();
    expect(comp.dump()).eql([2,4,4,5,99,9801]);
  });

  it('should execute basic program 4', () => {
    const comp = new IntComputer([1,1,1,4,99,5,6,0,99], new BasicIntStream()).runToHalt();
    expect(comp.dump()).eql([30,1,1,4,2,5,6,0,99]);
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('11590668');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('2254');
  });
});
