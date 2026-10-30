import MinHeap from './MinHeap.js';
import { getNeighbors, makeResult, noPathResult, validEndpoints } from './pathUtils.js';

/** Dijkstra with a binary heap; entering cell v costs grid.cells[v].weight. */
export function dijkstra(grid, start, goal) {
  if (!validEndpoints(grid, start, goal)) return noPathResult(grid);
  const n = grid.cells.length;
  const dist = new Float64Array(n).fill(Infinity);
  const settled = new Uint8Array(n);
  const parents = new Int32Array(n).fill(-1);
  const heap = new MinHeap();
  const visitedOrder = [];
  const events = [{ type: 'frontier', node: start }];
  dist[start] = 0;
  heap.push(start, 0);
  while (heap.size) {
    const item = heap.pop();
    const current = item.node;
    if (settled[current] || item.cost !== dist[current]) continue;
    settled[current] = 1;
    visitedOrder.push(current);
    events.push({ type: 'visited', node: current });
    if (current === goal) break;
    for (const next of getNeighbors(current, grid)) {
      if (settled[next]) continue;
      const newDist = dist[current] + grid.cells[next].weight;
      if (newDist >= dist[next]) continue;
      dist[next] = newDist;
      parents[next] = current;
      heap.push(next, newDist);
      events.push({ type: 'frontier', node: next });
    }
  }
  return makeResult(grid, start, goal, parents, visitedOrder, events, dist[goal]);
}
