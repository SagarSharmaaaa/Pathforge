import test from 'node:test';
import assert from 'node:assert/strict';
import { bfs } from '../src/algorithms/bfs.js';
import { dfs } from '../src/algorithms/dfs.js';
import { dijkstra } from '../src/algorithms/dijkstra.js';
import { astar, manhattan } from '../src/algorithms/astar.js';
import MinHeap from '../src/algorithms/MinHeap.js';
import { makeEmptyGrid, makeBoard, resizeBoard } from '../src/utils/gridUtils.js';
import { generateRandomMaze } from '../src/utils/mazeGenerator.js';

const searches = { bfs, dfs, dijkstra, astar };
function wall(grid, ids) { ids.forEach(id => { grid.cells[id] = { isWall: true, weight: 1 }; }); return grid; }
function validatePath(grid, path, start, goal) {
  assert.equal(path[0], start);
  assert.equal(path.at(-1), goal);
  for (let i = 0; i < path.length; i++) {
    assert.equal(grid.cells[path[i]].isWall, false);
    if (i) assert.equal(manhattan(path[i - 1], path[i], grid.cols), 1);
  }
}

for (const [name, run] of Object.entries(searches)) {
  test(`${name}: empty 5 × 5 grid, 8-step route`, () => {
    const grid = makeEmptyGrid(5, 5);
    const result = run(grid, 0, 24);
    assert.equal(result.found, true);
    validatePath(grid, result.path, 0, 24);
    if (name !== 'dfs') assert.equal(result.pathLength, 8);
    assert.equal(result.visitedOrder[0], 0);
    assert.ok(result.events.some(event => event.type === 'frontier'));
    assert.ok(result.events.some(event => event.type === 'visited'));
  });
  test(`${name}: start adjacent to finish`, () => {
    const grid = makeEmptyGrid(4, 4);
    const result = run(grid, 5, 6);
    assert.ok(result.found);
    validatePath(grid, result.path, 5, 6);
    if (name !== 'dfs') assert.equal(result.pathLength, 1);
  });
  test(`${name}: unreachable goal behind a full wall`, () => {
    const grid = wall(makeEmptyGrid(3, 3), [3, 4, 5]);
    const result = run(grid, 0, 8);
    assert.equal(result.found, false);
    assert.deepEqual(result.path, []);
    assert.equal(result.pathLength, null);
    assert.equal(result.totalCost, null);
  });
  test(`${name}: blocked destination is safely rejected`, () => {
    const grid = wall(makeEmptyGrid(3, 3), [8]);
    const result = run(grid, 0, 8);
    assert.equal(result.found, false);
    assert.deepEqual(result.visitedOrder, []);
  });
  test(`${name}: start equals goal`, () => {
    const grid = makeEmptyGrid(3, 3);
    const result = run(grid, 4, 4);
    assert.equal(result.found, true);
    assert.deepEqual(result.path, [4]);
    assert.equal(result.pathLength, 0);
    assert.equal(result.totalCost, 0);
  });
}

test('Dijkstra and A* avoid expensive nodes; BFS ignores weights', () => {
  const grid = makeEmptyGrid(3, 5);
  for (const id of [1, 2, 3]) grid.cells[id].weight = 9;
  const b = bfs(grid, 0, 4);
  const d = dijkstra(grid, 0, 4);
  const a = astar(grid, 0, 4);
  assert.equal(b.pathLength, 4);
  assert.equal(b.totalCost, 4); // BFS deliberately reports step count.
  assert.equal(d.totalCost, 6); // Down one row, right four, back up.
  assert.equal(a.totalCost, 6);
  assert.equal(d.pathLength, 6);
  assert.equal(a.pathLength, 6);
  validatePath(grid, d.path, 0, 4);
  validatePath(grid, a.path, 0, 4);
});

test('Uniform-cost grids: BFS, Dijkstra and A* agree on path length', () => {
  const grid = wall(makeEmptyGrid(6, 7), [3, 10, 17, 24, 31]);
  const lengths = [bfs, dijkstra, astar].map(run => run(grid, 0, 41).pathLength);
  assert.ok(lengths.every(length => length === lengths[0]));
  assert.ok(lengths[0] > 0);
});

test('Dijkstra and A* optimal cost equals independent Bellman-Ford on random weighted mazes', () => {
  let seed = 17041;
  const rng = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  for (let iteration = 0; iteration < 50; iteration++) {
    const grid = makeEmptyGrid(8, 9);
    for (let id = 1; id < 71; id++) {
      if (rng() < .24) grid.cells[id].isWall = true;
      grid.cells[id].weight = 1 + Math.floor(rng() * 9);
    }
    const edges = [];
    for (let id = 0; id < grid.cells.length; id++) {
      if (grid.cells[id].isWall) continue;
      for (const other of [id - grid.cols, id + grid.cols, id - 1, id + 1]) {
        if (other < 0 || other >= grid.cells.length || grid.cells[other].isWall) continue;
        if (Math.abs(Math.floor(other / grid.cols) - Math.floor(id / grid.cols)) + Math.abs(other % grid.cols - id % grid.cols) !== 1) continue;
        edges.push([id, other, grid.cells[other].weight]);
      }
    }
    const dist = Array(grid.cells.length).fill(Infinity);
    dist[0] = 0;
    for (let pass = 0; pass < grid.cells.length - 1; pass++) {
      let changed = false;
      for (const [from, to, cost] of edges) {
        if (dist[from] + cost < dist[to]) { dist[to] = dist[from] + cost; changed = true; }
      }
      if (!changed) break;
    }
    const expected = Number.isFinite(dist[71]) ? dist[71] : null;
    for (const search of [dijkstra, astar]) {
      const result = search(grid, 0, 71);
      assert.equal(result.totalCost, expected);
      assert.equal(result.found, expected !== null);
      if (result.found) validatePath(grid, result.path, 0, 71);
    }
  }
});

test('Heap pops by numeric priority and preserves order for ties', () => {
  const heap = new MinHeap();
  heap.push(1, 9); heap.push(2, 1); heap.push(3, 1); heap.push(4, 3);
  assert.deepEqual([heap.pop().node, heap.pop().node, heap.pop().node, heap.pop().node], [2, 3, 4, 1]);
  assert.equal(heap.pop(), null);
});

test('Random maze protects start and finish even with 100% wall probability', () => {
  const grid = makeEmptyGrid(4, 4);
  const maze = generateRandomMaze(grid, 0, 15, 1, () => 0);
  assert.equal(maze.cells[0].isWall, false);
  assert.equal(maze.cells[15].isWall, false);
  assert.equal(maze.cells.filter(cell => cell.isWall).length, 14);
});

test('Grid resizing preserves retained edits and valid endpoints', () => {
  const board = makeBoard(12, 20, false);
  board.grid.cells[3].isWall = true;
  const resized = resizeBoard(board, 15, 22);
  assert.equal(resized.grid.cells[3].isWall, true);
  assert.equal(resized.grid.cells[resized.start].isWall, false);
  assert.equal(resized.grid.cells[resized.goal].isWall, false);
});
