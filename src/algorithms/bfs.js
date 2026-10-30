import { getNeighbors, makeResult, noPathResult, validEndpoints } from './pathUtils.js';

/** BFS finds the minimum number of steps on an unweighted grid. */
export function bfs(grid, start, goal) {
  if (!validEndpoints(grid, start, goal)) return noPathResult(grid);
  const seen = new Uint8Array(grid.cells.length);
  const parents = new Int32Array(grid.cells.length).fill(-1);
  const queue = [start];
  const events = [{ type: 'frontier', node: start }];
  const visitedOrder = [];
  seen[start] = 1;
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    visitedOrder.push(current);
    events.push({ type: 'visited', node: current });
    if (current === goal) break;
    for (const next of getNeighbors(current, grid)) {
      if (seen[next]) continue;
      seen[next] = 1;
      parents[next] = current;
      queue.push(next);
      events.push({ type: 'frontier', node: next });
    }
  }
  const result = makeResult(grid, start, goal, parents, visitedOrder, events);
  // BFS ignores weights: report edge count as its search cost.
  return { ...result, totalCost: result.pathLength };
}
