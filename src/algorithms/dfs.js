import { getNeighbors, makeResult, noPathResult, validEndpoints } from './pathUtils.js';

/** True iterative depth-first traversal: nodes are marked when popped. */
export function dfs(grid, start, goal) {
  if (!validEndpoints(grid, start, goal)) return noPathResult(grid);
  const seen = new Uint8Array(grid.cells.length);
  const parents = new Int32Array(grid.cells.length).fill(-1);
  const stack = [{ node: start, parent: -1 }];
  const events = [{ type: 'frontier', node: start }];
  const visitedOrder = [];
  while (stack.length) {
    const { node: current, parent } = stack.pop();
    if (seen[current]) continue;
    seen[current] = 1;
    parents[current] = parent;
    visitedOrder.push(current);
    events.push({ type: 'visited', node: current });
    if (current === goal) break;
    // Reverse push order, so popping follows up, right, down, left.
    const neighbors = getNeighbors(current, grid);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const next = neighbors[i];
      if (seen[next]) continue;
      stack.push({ node: next, parent: current });
      events.push({ type: 'frontier', node: next });
    }
  }
  const result = makeResult(grid, start, goal, parents, visitedOrder, events);
  return { ...result, totalCost: result.pathLength };
}
