import MinHeap from './MinHeap.js';
import { getNeighbors, makeResult, noPathResult, validEndpoints } from './pathUtils.js';

/** Manhattan heuristic × minimum step cost (1): consistent and admissible. */
export function manhattan(a, b, cols) {
  return Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) +
    Math.abs((a % cols) - (b % cols));
}

export function astar(grid, start, goal) {
  if (!validEndpoints(grid, start, goal)) return noPathResult(grid);
  const n = grid.cells.length;
  const scores = new Float64Array(n).fill(Infinity);
  const settled = new Uint8Array(n);
  const parents = new Int32Array(n).fill(-1);
  const heap = new MinHeap();
  const visitedOrder = [];
  const events = [{ type: 'frontier', node: start }];
  scores[start] = 0;
  heap.push(start, manhattan(start, goal, grid.cols), 0);
  while (heap.size) {
    const item = heap.pop();
    const current = item.node;
    if (settled[current] || item.cost !== scores[current]) continue;
    settled[current] = 1;
    visitedOrder.push(current);
    events.push({ type: 'visited', node: current });
    if (current === goal) break;
    for (const next of getNeighbors(current, grid)) {
      if (settled[next]) continue;
      const tentative = scores[current] + grid.cells[next].weight;
      if (tentative >= scores[next]) continue;
      scores[next] = tentative;
      parents[next] = current;
      const f = tentative + manhattan(next, goal, grid.cols);
      heap.push(next, f, tentative);
      events.push({ type: 'frontier', node: next });
    }
  }
  return makeResult(grid, start, goal, parents, visitedOrder, events, scores[goal]);
}
