
import solution, { SpaceBody } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should create sample orbits', () => {
    const system = SpaceBody.fromInput('AA)BB,BB)CC,COM)AA,BB)DD'.split(','));

    expect(system.name).to.equal('COM');
    expect(system.satellites[0].name).to.equal('AA');
    expect(system.satellites[0].satellites[0].name).to.equal('BB');
    expect(system.satellites[0].satellites[0].satellites[0].name).to.equal('CC');
    expect(system.satellites[0].satellites[0].satellites[1].name).to.equal('DD');
  });

  it('should find total orbits', () => {
    const system = SpaceBody.fromInput('COM)B,B)C,C)D,D)E,E)F,B)G,G)H,D)I,E)J,J)K,K)L'.split(','));

    expect(system.name).to.equal('COM');
    expect(system.findTotalOrbits(0)).to.equal(42);
  });

  it('should find orbit paths', () => {
    const system = SpaceBody.fromInput('COM)B,B)C,C)D,D)E,E)F,B)G,G)H,D)I,E)J,J)K,K)L,K)YOU,I)SAN'.split(','));

    expect(system.name).to.equal('COM');
    const orbitPaths = [...system.findOrbitPaths()];

    const san = orbitPaths.filter(p => p.body.name === 'SAN')[0];
    const you = orbitPaths.filter(p => p.body.name === 'YOU')[0];
    expect(san.body.name).to.equal('SAN');
    expect(you.body.name).to.equal('YOU');
    expect(san.path).eql(['COM','B','C','D','I']);
    expect(you.path).eql(['COM','B','C','D','E','J','K']);

    const commonPath = san.path.filter(p => you.path.includes(p));
    expect(commonPath.length).to.equal(4);
    expect(san.path.length - commonPath.length).to.equal(1);
    expect(you.path.length - commonPath.length).to.equal(3);
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('344238');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('436');
  });
});
