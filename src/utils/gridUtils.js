export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 9;

export function makeEmptyGrid(rows, cols) {
  return {
    rows, cols,
    cells: Array.from({ length: rows * cols }, () => ({ isWall: false, weight: 1 })),
  };
}

export function initialPositions(rows, cols) {
  const mid = Math.floor(rows / 2);
  return {
    start: mid * cols + Math.min(3, Math.max(1, Math.floor(cols / 6))),
    goal: mid * cols + cols - Math.min(4, Math.max(2, Math.floor(cols / 6))) - 1,
  };
}

export function makeBoard(rows, cols, withDemo = true) {
  const grid = makeEmptyGrid(rows, cols);
  const { start, goal } = initialPositions(rows, cols);
  if (withDemo && cols >= 21 && rows >= 14) {
    // A curated, traversable starting map so the demo is interesting immediately.
    const barriers = [
      { x: Math.floor(cols * 0.32), gap: Math.floor(rows * 0.32) },
      { x: Math.floor(cols * 0.65), gap: Math.floor(rows * 0.68) },
    ];
    for (const { x, gap } of barriers) {
      for (let r = 3; r < rows - 3; r++) {
        if (Math.abs(r - gap) <= 1) continue;
        grid.cells[r * cols + x] = { isWall: true, weight: 1 };
      }
    }
    for (let k = 0; k < 3; k++) {
      const col = Math.floor(cols * 0.44) + k;
      const idx = Math.floor(rows * 0.52) * cols + col;
      if (idx !== start && idx !== goal) grid.cells[idx] = { isWall: false, weight: 5 };
    }
  }
  grid.cells[start] = { isWall: false, weight: 1 };
  grid.cells[goal] = { isWall: false, weight: 1 };
  return { grid, start, goal };
}

export function updateCell(grid, index, patch) {
  const old = grid.cells[index];
  if (!old) return grid;
  const cell = { ...old, ...patch };
  if (cell.isWall) cell.weight = 1;
  cell.weight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, cell.weight));
  if (cell.isWall === old.isWall && cell.weight === old.weight) return grid;
  const cells = grid.cells.slice();
  cells[index] = cell;
  return { ...grid, cells };
}

/** Preserve edits relative to the top-left when the available grid size changes. */
export function resizeBoard(board, rows, cols) {
  const { grid: old, start, goal } = board;
  if (rows === old.rows && cols === old.cols) return board;
  const grid = makeEmptyGrid(rows, cols);
  for (let r = 0; r < Math.min(rows, old.rows); r++) {
    for (let c = 0; c < Math.min(cols, old.cols); c++) {
      grid.cells[r * cols + c] = old.cells[r * old.cols + c];
    }
  }
  const remap = (id) => {
    const r = Math.min(rows - 1, Math.floor(id / old.cols));
    const c = Math.min(cols - 1, id % old.cols);
    return r * cols + c;
  };
  const nextStart = remap(start);
  let nextGoal = remap(goal);
  if (nextGoal === nextStart) nextGoal = (nextStart + 1) % grid.cells.length;
  grid.cells[nextStart] = { isWall: false, weight: 1 };
  grid.cells[nextGoal] = { isWall: false, weight: 1 };
  return { grid, start: nextStart, goal: nextGoal };
}
