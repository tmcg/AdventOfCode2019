
import solution, { Util4 } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should find if code is increasing', () => {
    expect(Util4.isIncreasing('111111')).to.equal(true);
    expect(Util4.isIncreasing('234560')).to.equal(false);
    expect(Util4.isIncreasing('123789')).to.equal(true);
  })

  it('should find runs within a code', () => {
    expect(Util4.findRuns('111111')).to.eql(['111111']);
    expect(Util4.findRuns('234560')).to.eql(['2','3','4','5','6','0']);
    expect(Util4.findRuns('123789')).to.eql(['1','2','3','7','8','9']);
    expect(Util4.findRuns('112233')).to.eql(['11','22','33']);
    expect(Util4.findRuns('123444')).to.eql(['1','2','3','444']);
    expect(Util4.findRuns('111122')).to.eql(['1111','22']);
  });

  it('should meet criteria 1', () => {
    expect(Util4.meetsCriteriaPart1('111111')).to.equal(true);
    expect(Util4.meetsCriteriaPart1('223450')).to.equal(false);
    expect(Util4.meetsCriteriaPart1('123789')).to.equal(false);
  });

  it('should meet criteria 2', () => {
    expect(Util4.meetsCriteriaPart2('112233')).to.equal(true);
    expect(Util4.meetsCriteriaPart2('123444')).to.equal(false);
    expect(Util4.meetsCriteriaPart2('111122')).to.equal(true);
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('2090');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('1419');
  });
});
