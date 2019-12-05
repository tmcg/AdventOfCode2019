
import solution,{ IntComputer } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {
  it('should decode instructions (1)', () => {
    const c1 = IntComputer.fromInput('99');

    expect(c1.instructionLength(1)).to.equal(4);
    expect(c1.instructionLength(2)).to.equal(4);
    expect(c1.instructionLength(3)).to.equal(2);
    expect(c1.instructionLength(4)).to.equal(2);
    expect(c1.instructionLength(5)).to.equal(3);
    expect(c1.instructionLength(6)).to.equal(3);
    expect(c1.instructionLength(7)).to.equal(4);
    expect(c1.instructionLength(8)).to.equal(4);
    expect(c1.instructionLength(99)).to.equal(1);
  });

  it('should decode instructions (2)', () => {
    const c1 = IntComputer.fromInput('1,4,5,6,2,7,8,9,3,45,4,54,99');

    let cx = c1.decode(0);
    expect(cx.opcode).to.equal(1);
    expect(cx.operands).eql([4,5,6]);
    expect(cx.modes).eql([0,0,0])

    cx = c1.decode(4);
    expect(cx.opcode).to.equal(2);
    expect(cx.operands).eql([7,8,9]);
    expect(cx.modes).eql([0,0,0])

    cx = c1.decode(8);
    expect(cx.opcode).to.equal(3);
    expect(cx.operands).eql([45]);
    expect(cx.modes).eql([0])

    cx = c1.decode(10);
    expect(cx.opcode).to.equal(4);
    expect(cx.operands).eql([54]);
    expect(cx.modes).eql([0])

    cx = c1.decode(12);
    expect(cx.opcode).to.equal(99);
    expect(cx.operands).eql([]);
    expect(cx.modes).eql([])
  });

  it('should decode instructions (3)', () => {
    const c1 = IntComputer.fromInput('102,2,3,4,1002,3,4,5,10002,4,5,6,99');
    let cx = c1.decode(0);
    expect(cx.opcode).to.equal(2);
    expect(cx.operands).eql([2,3,4]);
    expect(cx.modes).eql([1,0,0])

    cx = c1.decode(4);
    expect(cx.opcode).to.equal(2);
    expect(cx.operands).eql([3,4,5]);
    expect(cx.modes).eql([0,1,0])

    cx = c1.decode(8);
    expect(cx.opcode).to.equal(2);
    expect(cx.operands).eql([4,5,6]);
    expect(cx.modes).eql([0,0,1])

    cx = c1.decode(12);
    expect(cx.opcode).to.equal(99);
    expect(cx.operands).eql([]);
  });

  it('should decode instructions (4)', () => {
    const c1 = IntComputer.fromInput('5,0,33,5,1,33,6,0,34,6,1,34,7,0,1,35,7,1,0,35,8,0,1,36,8,1,1,36');
    let cx = c1.decode(0);
    expect(cx.opcode).to.equal(5);
    expect(cx.operands).eql([0,33]);

    cx = c1.decode(3);
    expect(cx.opcode).to.equal(5);
    expect(cx.operands).eql([1,33]);

    cx = c1.decode(6);
    expect(cx.opcode).to.equal(6);
    expect(cx.operands).eql([0,34]);

    cx = c1.decode(9);
    expect(cx.opcode).to.equal(6);
    expect(cx.operands).eql([1,34]);

    cx = c1.decode(12);
    expect(cx.opcode).to.equal(7);
    expect(cx.operands).eql([0,1,35]);

    cx = c1.decode(16);
    expect(cx.opcode).to.equal(7);
    expect(cx.operands).eql([1,0,35]);

    cx = c1.decode(20);
    expect(cx.opcode).to.equal(8);
    expect(cx.operands).eql([0,1,36]);

    cx = c1.decode(24);
    expect(cx.opcode).to.equal(8);
    expect(cx.operands).eql([1,1,36]);
  });

  it('should execute opcode 5', () => {

    const c1 = IntComputer.fromInput('1105,1,4,99,99'); c1.run('');
    expect(c1._instPtr).to.equal(4);

    const c2 = IntComputer.fromInput('1105,0,4,99,99'); c2.run('');
    expect(c2._instPtr).to.equal(3);

    const c3 = IntComputer.fromInput('5,5,6,99,99,1,4'); c3.run('');
    expect(c3._instPtr).to.equal(4);

    const c4 = IntComputer.fromInput('5,5,6,99,99,0,3'); c4.run('');
    expect(c4._instPtr).to.equal(3);
  });

  it('should execute opcode 6', () => {
    const c1 = IntComputer.fromInput('1106,1,4,99,99'); c1.run('');
    expect(c1._instPtr).to.equal(3);

    const c2 = IntComputer.fromInput('1106,0,4,99,99'); c2.run('');
    expect(c2._instPtr).to.equal(4);

    const c3 = IntComputer.fromInput('6,5,6,99,99,1,3'); c3.run('');
    expect(c3._instPtr).to.equal(3);

    const c4 = IntComputer.fromInput('6,5,6,99,99,0,4'); c4.run('');
    expect(c4._instPtr).to.equal(4);
  });

  it('should execute opcode 7', () => {
    const c1 = IntComputer.fromInput('1107,1,4,5,99,99'); c1.run('');
    expect(c1.dump()).eql([1107,1,4,5,99,1]);

    const c2 = IntComputer.fromInput('1107,4,1,5,99,99'); c2.run('');
    expect(c2.dump()).eql([1107,4,1,5,99,0]);

    const c3 = IntComputer.fromInput('7,5,6,7,99,1,4,99'); c3.run('');
    expect(c3.dump()).eql([7,5,6,7,99,1,4,1]);

    const c4 = IntComputer.fromInput('7,5,6,7,99,4,1,99'); c4.run('');
    expect(c4.dump()).eql([7,5,6,7,99,4,1,0]);
  });

  it('should execute full sample', () => {
    const input = '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99';

    expect(IntComputer.fromInput(input).run('7')).to.equal('999');
    expect(IntComputer.fromInput(input).run('8')).to.equal('1000');
    expect(IntComputer.fromInput(input).run('9')).to.equal('1001');
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('16489636');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('9386583');
  });
});
