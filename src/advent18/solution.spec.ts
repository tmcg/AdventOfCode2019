
import solution, { VaultMaze } from './solution';
import { expect } from 'chai';
import 'mocha';

describe(`Advent of Code Day ${solution.dayNumber}`, () => {

  it('should load sample 1', () => {
    const input = [
      '#########',
      '#b.A.@.a#',
      '#########',
    ];

    const maze = VaultMaze.fromInput(input);

    expect(maze.board.length).to.equal(3);
    expect(maze.board[0].map(x => x.glyph).join('')).to.equal('#########');
    expect(maze.board[1].map(x => x.glyph).join('')).to.equal('#b.A.@.a#');
    expect(maze.board[2].map(x => x.glyph).join('')).to.equal('#########');

    expect(Object.keys(maze.keys).sort()).eql(['@','a','b']);
    expect(maze.keys['a'].x).to.equal(7);
    expect(maze.keys['a'].y).to.equal(1);
    expect(maze.keys['b'].x).to.equal(1);
    expect(maze.keys['b'].y).to.equal(1);

    expect(Object.keys(maze.doors).sort()).eql(['A']);
    expect(maze.doors['A'].x).to.equal(3);
    expect(maze.doors['A'].y).to.equal(1);
  });

  it('should find path to key a', () => {
    const input = [
      '#########',
      '#b.A.@.a#',
      '#########',
    ];

    const maze = VaultMaze.fromInput(input);

    const p1 = maze.pathToKey(maze.keys['@'], 'a', '');
    expect(p1.cost).to.equal(2);
    expect(p1.path).eql(['5,1', '6,1', '7,1']);

    const p2 = maze.pathToKey(maze.keys['@'], 'b', '')
    expect(p2.cost).to.equal(0);
    expect(p2.path).to.equal(null);

    const p3 = maze.pathToKey(maze.keys['a'], 'b', 'a');
    expect(p3.cost).to.equal(6);
    expect(p3.path).eql(['7,1','6,1','5,1','4,1','3,1','2,1','1,1']);
  });

  it('should find path to all keys (1)', () => {
    const input = [
      '#########',
      '#b.A.@.a#',
      '#########',
    ];

    const maze = VaultMaze.fromInput(input);
    expect(maze.shortestPathToKeys()).to.equal(8);
  });

  it('should find path to all keys (2)', () => {
    const input = [
      '########################',
      '#f.D.E.e.C.b.A.@.a.B.c.#',
      '######################.#',
      '#d.....................#',
      '########################',
    ];

    const maze = VaultMaze.fromInput(input);
    expect(maze.shortestPathToKeys()).to.equal(86);
  });

  it('should find path to all keys (3)', () => {
    const input = [
      '########################',
      '#...............b.C.D.f#',
      '#.######################',
      '#.....@.a.B.c.d.A.e.F.g#',
      '########################',
    ];

    const maze = VaultMaze.fromInput(input);
    expect(maze.shortestPathToKeys()).to.equal(132);
  });

  it('should find path to all keys (4)', () => {
    const input = [
      '#################',
      '#i.G..c...e..H.p#',
      '########.########',
      '#j.A..b...f..D.o#',
      '########@########',
      '#k.E..a...g..B.n#',
      '########.########',
      '#l.F..d...h..C.m#',
      '#################',
    ];

    const maze = VaultMaze.fromInput(input);
    expect(maze.shortestPathToKeys()).to.equal(99999);
  });
/*
  it('should find path to all keys (5)', () => {
    const input = [
      '#################',
      '#..D..a...b..C.g#',
      '########@########',
      '#f.B..c...d..A.e#',
      '#################',
    ];

    const maze = VaultMaze.fromInput(input);
    expect(maze.shortestPathToKeys()).to.equal(99999);
  });
*/

  it('should solve part 1', () => {
    expect(solution.solvePart1()).to.equal('zz');
  });

  it('should solve part 2', () => {
    expect(solution.solvePart2()).to.equal('zz');
  });
});
