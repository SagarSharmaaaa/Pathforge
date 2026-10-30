/** Four-direction movement, in a fixed, reproducible order: up, right, down, left. */
export function getNeighbors(index, grid) {
  const { rows, cols, cells } = grid;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const positions = [
    [row - 1, col], [row, col + 1],
    [row + 1, col], [row, col - 1],
  ];
  const result = [];
  for (const [r, c] of positions) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      const id = r * cols + c;
      if (!cells[id].isWall) result.push(id);
    }
  }
  return result;
}

export function validEndpoints(grid, start, goal) {
  return Number.isInteger(start) && Number.isInteger(goal) &&
    start >= 0 && goal >= 0 && start < grid.cells.length &&
    goal < grid.cells.length && !grid.cells[start].isWall &&
    !grid.cells[goal].isWall;
}

export function reconstructPath(parents, start, goal) {
  if (start !== goal && parents[goal] === -1) return [];
  const path = [];
  let node = goal;
  // The bound protects against malformed parent cycles.
  for (let steps = 0; steps <= parents.length && node !== -1; steps++) {
    path.push(node);
    if (node === start) return path.reverse();
    node = parents[node];
  }
  return [];
}

export function makeResult(grid, start, goal, parents, visitedOrder, events, costOverride) {
  const path = reconstructPath(parents, start, goal);
  const found = path.length > 0;
  const totalCost = found ? (costOverride ?? path.slice(1).reduce(
    (sum, id) => sum + grid.cells[id].weight, 0
  )) : null;
  return { found, path, parents, visitedOrder, events, totalCost, pathLength: found ? path.length - 1 : null };
}

export function noPathResult(grid) {
  return {
    found: false, path: [], parents: new Int32Array(grid.cells.length).fill(-1),
    visitedOrder: [], events: [], totalCost: null, pathLength: null,
  };
}
