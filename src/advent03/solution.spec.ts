
import solution, { Segment, Point } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should create segments', () => {
    const wire1 = Segment.parseInput('R8,U5,L5,D3'.split(','));

    expect(wire1[0].a).eql({x:0,y:0});
    expect(wire1[0].b).eql({x:8,y:0});
    expect(wire1[0].rv).to.equal(false);
    expect(wire1[1].a).eql({x:8,y:5});
    expect(wire1[1].b).eql({x:8,y:0});
    expect(wire1[1].rv).to.equal(true);
    expect(wire1[2].a).eql({x:3,y:5});
    expect(wire1[2].b).eql({x:8,y:5});
    expect(wire1[2].rv).to.equal(true);
    expect(wire1[3].a).eql({x:3,y:5});
    expect(wire1[3].b).eql({x:3,y:2});
    expect(wire1[3].rv).to.equal(false);
  });

  it('should find an intersect', () => {
    const seg1 = new Segment(new Point(3,5), new Point(8,5), false);
    const seg2 = new Segment(new Point(6,7), new Point(6,3), false);

    const points1 = seg1.intersects(seg2);
    expect(points1.length).to.equal(1);
    expect(points1[0].x).to.equal(6);
    expect(points1[0].x).to.equal(6);

    const points2 = seg2.intersects(seg1);
    expect(points2.length).to.equal(1);
    expect(points2[0].x).to.equal(6);
    expect(points2[0].x).to.equal(6);
  })

  it('should find overlapping horizontal intersects', () => {
    const seg1 = new Segment(new Point(3,5), new Point(8,5), false);
    const seg2 = new Segment(new Point(2,5), new Point(6,5), false);
    const seg3 = new Segment(new Point(4,5), new Point(6,5), false);
    const seg4 = new Segment(new Point(5,5), new Point(10,5), false);

    const points1 = seg1.intersects(seg2);
    expect(points1.length).to.equal(4);

    const points2 = seg1.intersects(seg3);
    expect(points2.length).to.equal(3);

    const points3 = seg1.intersects(seg4);
    expect(points3.length).to.equal(4);
  });

  it('should find all intersects', () => {
    const wire1 = Segment.parseInput('R8,U5,L5,D3'.split(','));
    const wire2 = Segment.parseInput('U7,R6,D4,L4'.split(','));

    const intersects = Segment.findIntersects(wire1, wire2);

    expect(intersects.length).to.equal(2);
  });

  it('should find signal time to intersects', () => {
    const segment1 = Segment.parseInput('R8,U5,L5,D3'.split(','));
    const segment2 = Segment.parseInput('U7,R6,D4,L4'.split(','));

    const intersects = Segment.findIntersects(segment1, segment2);

    expect(intersects.length).to.equal(2);
    expect(intersects[0].x).to.equal(6);
    expect(intersects[0].y).to.equal(5);
    expect(intersects[1].x).to.equal(3);
    expect(intersects[1].y).to.equal(3);

    expect(Segment.signalToPoint(segment1, intersects[0])).to.equal(15);
    expect(Segment.signalToPoint(segment2, intersects[0])).to.equal(15);
    expect(Segment.signalToPoint(segment1, intersects[1])).to.equal(20);
    expect(Segment.signalToPoint(segment2, intersects[1])).to.equal(20);
  });

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('1017');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('11432');
  });
});
