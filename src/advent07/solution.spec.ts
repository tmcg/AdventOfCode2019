
import solution, {phaseSequence} from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should calculate phases', () => {
    const p = phaseSequence();
    expect(p.length).to.equal(120);
    expect(p[0]).eql([0,1,2,3,4]);
    expect(p[1]).eql([0,1,2,4,3]);
    expect(p[119]).eql([4,3,2,1,0]);
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('87138');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('17279674');
  });
});
