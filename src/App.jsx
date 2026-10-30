import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import Statistics from './components/Statistics.jsx';
import AlgorithmInfo from './components/AlgorithmInfo.jsx';
import useVisualization from './hooks/useVisualization.js';
import { makeBoard, resizeBoard, updateCell } from './utils/gridUtils.js';
import { generateRandomMaze } from './utils/mazeGenerator.js';

const ALGORITHM_KEYS = ['bfs', 'dfs', 'dijkstra', 'astar'];

export default function App() {
  const [board, setBoard] = useState(() => makeBoard(20, 34));
  const boardRef = useRef(board);
  boardRef.current = board;
  const [algorithm, setAlgorithmState] = useState('astar');
  const [speed, setSpeed] = useState('normal');
  const [tool, setTool] = useState('wall');
  const [weight, setWeight] = useState(5);
  const [density, setDensity] = useState(25);
  const [infoOpen, setInfoOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dragRef = useRef(null);

  const notify = useCallback((message, kind = 'success') => setToast({ message, kind, id: Date.now() }), []);
  const onComplete = useCallback((found) => {
    notify(found ? 'Path found! The final route is highlighted in gold.' : 'No route found. Try clearing walls or generating a new maze.', found ? 'success' : 'warning');
  }, [notify]);
  const { visual, metrics, start, pause, resume, reset } = useVisualization(speed, onComplete);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleResize = useCallback((rows, cols) => {
    if (boardRef.current.grid.rows === rows && boardRef.current.grid.cols === cols) return;
    // A layout change must not cancel an active pathfinding animation.
    if (['exploring', 'tracing', 'paused'].includes(metrics.status)) return;
    reset();
    setBoard(previous => resizeBoard(previous, rows, cols));
  }, [reset, metrics.status]);

  const changeAlgorithm = useCallback((next) => {
    reset();
    setAlgorithmState(next);
  }, [reset]);

  const clearPath = useCallback(() => {
    reset();
    notify('Visualization cleared. Your grid edits are preserved.');
  }, [reset, notify]);

  const clearWalls = useCallback(() => {
    reset();
    setBoard(prev => ({ ...prev, grid: {
      ...prev.grid,
      cells: prev.grid.cells.map(cell => cell.isWall ? { isWall: false, weight: 1 } : cell),
    } }));
    notify('All walls removed. Weighted nodes were preserved.');
  }, [reset, notify]);

  const resetGrid = useCallback(() => {
    reset();
    setBoard(prev => makeBoard(prev.grid.rows, prev.grid.cols, false));
    notify('Grid reset. Start and finish returned to their defaults.');
  }, [reset, notify]);

  const generateMaze = useCallback(() => {
    reset();
    setBoard(prev => ({ ...prev, grid: generateRandomMaze(prev.grid, prev.start, prev.goal, density / 100) }));
    notify(`Random maze created with ${density}% obstacle probability.`);
  }, [reset, density, notify]);

  const startRun = useCallback(() => {
    dragRef.current = null;
    setToast(null);
    const current = boardRef.current;
    start(current.grid, current.start, current.goal, algorithm);
  }, [start, algorithm]);

  const paint = useCallback((id, action) => {
    setBoard(prev => {
      if (id === prev.start || id === prev.goal) return prev;
      let patch;
      if (action === 'addWall') patch = { isWall: true, weight: 1 };
      else if (action === 'eraseWall') patch = { isWall: false, weight: 1 };
      else if (action === 'addWeight') patch = { isWall: false, weight };
      else patch = { isWall: false, weight: 1 };
      const grid = updateCell(prev.grid, id, patch);
      return grid === prev.grid ? prev : { ...prev, grid };
    });
  }, [weight]);

  const pointerStart = useCallback((id) => {
    reset(); // Editing invalidates the old visualization and cancels all queued frames.
    const current = boardRef.current;
    if (id === current.start) dragRef.current = { action: 'moveStart', last: id };
    else if (id === current.goal) dragRef.current = { action: 'moveGoal', last: id };
    else {
      const cell = current.grid.cells[id];
      let action;
      if (tool === 'erase') action = 'erase';
      else if (tool === 'weight') action = cell.weight === weight && !cell.isWall ? 'erase' : 'addWeight';
      else action = cell.isWall ? 'eraseWall' : 'addWall';
      dragRef.current = { action, last: id };
      paint(id, action);
    }
  }, [reset, paint, tool, weight]);

  const pointerOver = useCallback((id) => {
    const drag = dragRef.current;
    if (!drag || drag.last === id) return;
    drag.last = id;
    if (drag.action === 'moveStart' || drag.action === 'moveGoal') {
      setBoard(prev => {
        if (drag.action === 'moveStart' && id === prev.goal) return prev;
        if (drag.action === 'moveGoal' && id === prev.start) return prev;
        const grid = updateCell(prev.grid, id, { isWall: false, weight: 1 });
        return { grid, start: drag.action === 'moveStart' ? id : prev.start,
          goal: drag.action === 'moveGoal' ? id : prev.goal };
      });
    } else paint(id, drag.action);
  }, [paint]);
  const pointerEnd = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    const onKey = event => {
      const tag = event.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select', 'button'].includes(tag) || event.altKey || event.ctrlKey || event.metaKey || infoOpen) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (metrics.status === 'paused') resume();
        else if (['exploring', 'tracing'].includes(metrics.status)) pause();
        else startRun();
      } else if (event.key.toLowerCase() === 'r') resetGrid();
      else if (['1', '2', '3', '4'].includes(event.key)) changeAlgorithm(ALGORITHM_KEYS[Number(event.key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeAlgorithm, infoOpen, metrics.status, pause, resetGrid, resume, startRun]);

  const envRepo = import.meta.env.VITE_GITHUB_URL;
  const repoUrl = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(envRepo ?? '') ? envRepo : null;

  return (
    <div className="app-shell">
      <div className="background-orb orb-one" aria-hidden="true" />
      <div className="background-orb orb-two" aria-hidden="true" />
      <div className="app-container">
        <Header onInfo={() => setInfoOpen(true)} repoUrl={repoUrl} />
        <div className="intro-row"><div><div className="intro-eyebrow"><span className="intro-flash" /> ALGORITHMS, MADE VISIBLE <span className="eyebrow-line" /></div><h1>Find the <span>optimal path.</span></h1><p>Build your maze. Choose a search strategy. Watch every decision unfold.</p></div><div className="intro-side"><div className="online-dot" /> LIVE EXPLORATION ENVIRONMENT <strong>v1.0</strong></div></div>
        <div className="workspace">
          <Sidebar algorithm={algorithm} setAlgorithm={changeAlgorithm} speed={speed} setSpeed={setSpeed}
            tool={tool} setTool={setTool} weight={weight} setWeight={setWeight}
            density={density} setDensity={setDensity} onStart={startRun} onPause={pause}
            onResume={resume} onMaze={generateMaze} onClearPath={clearPath}
            onClearWalls={clearWalls} onReset={resetGrid} status={metrics.status} onInfo={() => setInfoOpen(true)} />
          <div className="canvas-column">
            <Grid board={board} visual={visual} status={metrics.status} onResize={handleResize}
              onPointerStart={pointerStart} onPointerOver={pointerOver} onPointerEnd={pointerEnd} />
            <Legend />
          </div>
          <Statistics algorithm={algorithm} metrics={metrics} onInfo={() => setInfoOpen(true)} />
        </div>
        <footer className="page-footer"><span>© 2026 PATHFORGE <span className="footer-separator">/</span> BUILT FOR ALGORITHM EXPLORATION</span><span>CRAFTED WITH REACT + JAVASCRIPT <span className="footer-separator">·</span> ADSA MINI PROJECT</span></footer>
      </div>
      {toast && <div className={`toast toast-${toast.kind}`} role="status">{toast.kind === 'warning' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}<span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button></div>}
      {infoOpen && <AlgorithmInfo initial={algorithm} onClose={() => setInfoOpen(false)} />}
    </div>
  );
}
