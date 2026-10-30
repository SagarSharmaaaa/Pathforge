import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const ROWS = 18;
const COLS = 32;
const START = { row: 8, col: 6 };
const GOAL = { row: 8, col: 25 };

function key(row, col) {
  return `${row}:${col}`;
}

function makeGrid() {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      wall: false,
      start: row === START.row && col === START.col,
      goal: row === GOAL.row && col === GOAL.col,
    })),
  );
}

const neighbors = (node) => [
  [node.row - 1, node.col],
  [node.row, node.col + 1],
  [node.row + 1, node.col],
  [node.row, node.col - 1],
];

function search(grid, algorithm) {
  const start = START;
  const goal = GOAL;
  const queue = [start];
  const seen = new Set([key(start.row, start.col)]);
  const parent = new Map();
  const distance = new Map([[key(start.row, start.col), 0]]);
  const visited = [];

  while (queue.length) {
    let currentIndex = 0;
    if (algorithm === 'dfs') currentIndex = queue.length - 1;
    if (algorithm === 'dijkstra' || algorithm === 'astar') {
      currentIndex = queue.reduce((best, item, index) => {
        const score = (distance.get(key(item.row, item.col)) ?? Infinity)
          + (algorithm === 'astar' ? Math.abs(item.row - goal.row) + Math.abs(item.col - goal.col) : 0);
        const bestScore = (distance.get(key(queue[best].row, queue[best].col)) ?? Infinity)
          + (algorithm === 'astar' ? Math.abs(queue[best].row - goal.row) + Math.abs(queue[best].col - goal.col) : 0);
        return score < bestScore ? index : best;
      }, 0);
    }

    const current = queue.splice(currentIndex, 1)[0];
    visited.push(key(current.row, current.col));
    if (current.row === goal.row && current.col === goal.col) break;

    for (const [row, col] of neighbors(current)) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;
      const cell = grid[row][col];
      if (cell.wall) continue;
      const nextKey = key(row, col);
      const nextDistance = (distance.get(key(current.row, current.col)) ?? 0) + 1;
      if (!seen.has(nextKey) || nextDistance < (distance.get(nextKey) ?? Infinity)) {
        seen.add(nextKey);
        distance.set(nextKey, nextDistance);
        parent.set(nextKey, key(current.row, current.col));
        queue.push({ row, col });
      }
    }
  }

  const path = [];
  let cursor = key(goal.row, goal.col);
  while (cursor && (cursor === key(start.row, start.col) || parent.has(cursor))) {
    path.unshift(cursor);
    cursor = parent.get(cursor);
  }
  return { visited, path: path[0] === key(start.row, start.col) ? path : [] };
}

function App() {
  const [grid, setGrid] = useState(makeGrid);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [visited, setVisited] = useState(new Set());
  const [path, setPath] = useState(new Set());
  const [dragging, setDragging] = useState(false);

  const stats = useMemo(() => ({
    visited: visited.size,
    path: path.size ? path.size - 1 : 0,
  }), [visited, path]);

  const clearResults = useCallback(() => {
    setVisited(new Set());
    setPath(new Set());
  }, []);

  const toggleWall = (row, col) => {
    if ((row === START.row && col === START.col) || (row === GOAL.row && col === GOAL.col)) return;
    clearResults();
    setGrid((current) => current.map((line, r) => line.map((cell, c) =>
      r === row && c === col ? { ...cell, wall: !cell.wall } : cell)));
  };

  const run = () => {
    const result = search(grid, algorithm);
    setVisited(new Set(result.visited));
    setPath(new Set(result.path));
  };

  const reset = () => {
    setGrid(makeGrid());
    clearResults();
  };

  return (
    <main className="app">
      <header>
        <div>
          <p className="eyebrow">ALGORITHM LABORATORY</p>
          <h1>Path<span>Forge</span></h1>
          <p className="subtitle">See how algorithms find their way through the grid.</p>
        </div>
        <div className="controls">
          <label>Algorithm
            <select value={algorithm} onChange={(event) => { setAlgorithm(event.target.value); clearResults(); }}>
              <option value="bfs">Breadth-first search</option>
              <option value="dfs">Depth-first search</option>
              <option value="dijkstra">Dijkstra's algorithm</option>
              <option value="astar">A* search</option>
            </select>
          </label>
          <button className="primary" onClick={run}>Run algorithm</button>
          <button className="secondary" onClick={reset}>Reset grid</button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-heading">
          <div><strong>Interactive grid</strong><span>Click cells to draw walls</span></div>
          <div className="stats"><span>Visited <b>{stats.visited}</b></span><span>Path length <b>{stats.path}</b></span></div>
        </div>
        <div className="grid" onMouseLeave={() => setDragging(false)}>
          {grid.flat().map((cell) => {
            const cellKey = key(cell.row, cell.col);
            const className = [
              'cell',
              cell.wall && 'wall',
              cell.start && 'start',
              cell.goal && 'goal',
              visited.has(cellKey) && 'visited',
              path.has(cellKey) && 'path',
            ].filter(Boolean).join(' ');
            return <button aria-label={`row ${cell.row + 1}, column ${cell.col + 1}`} className={className}
              key={cellKey} onMouseDown={() => { setDragging(true); toggleWall(cell.row, cell.col); }}
              onMouseEnter={() => dragging && toggleWall(cell.row, cell.col)}>{cell.start ? 'S' : cell.goal ? 'E' : ''}</button>;
          })}
        </div>
        <div className="legend"><span><i className="dot start-dot" />Start</span><span><i className="dot goal-dot" />End</span><span><i className="dot wall-dot" />Wall</span><span><i className="dot visit-dot" />Visited</span><span><i className="dot path-dot" />Path</span></div>
      </section>
      <footer>PathForge · A client-side ADSA visualizer · {algorithm.toUpperCase()}</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
