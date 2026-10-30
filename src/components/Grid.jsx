import { useEffect, useRef, useState } from 'react';
import { CircleHelp, MousePointer2, MoveUpRight, ScanLine } from 'lucide-react';
import GridNode from './GridNode.jsx';

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

export default function Grid({ board, visual, status, onResize, onPointerStart, onPointerOver, onPointerEnd }) {
  const { grid, start, goal } = board;
  const stageRef = useRef(null);
  const surfaceRef = useRef(null);
  const pointerIdRef = useRef(null);
  const [bounds, setBounds] = useState({ width: 740, height: 490 });
  const dimensionsRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width < 150 || height < 150) return;
      const availableWidth = Math.max(width - 24, 200);
      const availableHeight = Math.max(height - 24, 200);
      setBounds(previous => Math.abs(previous.width - availableWidth) > 2 || Math.abs(previous.height - availableHeight) > 2 ? { width: availableWidth, height: availableHeight } : previous);
      const cols = clamp(Math.round(availableWidth / 23), 12, 48);
      const rows = clamp(Math.round(availableHeight / 23), 10, 30);
      const key = `${rows}x${cols}`;
      if (dimensionsRef.current !== key) {
        dimensionsRef.current = key;
        onResize(rows, cols);
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [onResize]);

  const cellSize = Math.min(bounds.width / grid.cols, bounds.height / grid.rows);
  const boardWidth = Math.floor(cellSize * grid.cols);
  const boardHeight = Math.floor(cellSize * grid.rows);

  function cellFromEvent(event) {
    // elementFromPoint also works while pointer capture is active on touch screens.
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const node = target?.closest?.('[data-node-id]');
    if (!node || !surfaceRef.current?.contains(node)) return null;
    return Number(node.dataset.nodeId);
  }
  function handleDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const cell = cellFromEvent(event);
    if (cell === null) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    surfaceRef.current?.setPointerCapture(event.pointerId);
    onPointerStart(cell);
  }
  function handleMove(event) {
    if (pointerIdRef.current !== event.pointerId) return;
    const cell = cellFromEvent(event);
    if (cell !== null) onPointerOver(cell);
  }
  function handleUp(event) {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    if (surfaceRef.current?.hasPointerCapture(event.pointerId)) {
      surfaceRef.current.releasePointerCapture(event.pointerId);
    }
    onPointerEnd();
  }

  return (
    <section className="visualizer panel">
      <div className="canvas-topline">
        <div className="canvas-heading"><ScanLine size={18} className="cyan-text" /> <span>Visualization canvas</span> <span className="grid-dimensions">{grid.cols} × {grid.rows} GRID</span></div>
        <span className={`live-indicator ${['exploring', 'tracing'].includes(status) ? 'running' : ''}`}><span className="indicator-dot" /> {status === 'exploring' ? 'EXPLORING' : status === 'tracing' ? 'TRACING PATH' : status === 'paused' ? 'PAUSED' : 'INTERACTIVE'}</span>
      </div>
      <div className="canvas-hint"><MousePointer2 size={13} /> Draw walls and weighted cells, or drag the start and finish nodes. <span className="hint-desktop">Explore every search step in real time.</span></div>
      <div className="grid-stage" ref={stageRef}>
        <div className="canvas-glow" aria-hidden="true" />
        <div
          ref={surfaceRef} className="grid-surface" role="grid" aria-label="Interactive pathfinding grid"
          style={{ width: boardWidth, height: boardHeight, gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
          onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}
          onPointerCancel={handleUp} onLostPointerCapture={() => { pointerIdRef.current = null; onPointerEnd(); }}
          onContextMenu={e => e.preventDefault()}
        >
          {grid.cells.map((cell, id) => {
            const state = visual.path.has(id) ? 'path' : visual.visited.has(id) ? 'visited' : visual.frontier.has(id) ? 'frontier' : '';
            return <GridNode key={id} id={id} cols={grid.cols} cell={cell} state={state} isStart={id === start} isGoal={id === goal} />;
          })}
        </div>
        <div className="stage-badge stage-left"><MoveUpRight size={12} /> FOUR-WAY MOVEMENT</div>
        <div className="stage-badge stage-right"><CircleHelp size={12} /> NO DIAGONALS</div>
      </div>
      <div className="canvas-footer">
        <div><span className="footer-halo" /> <strong>PATHFORGE ENGINE</strong><span className="footer-muted"> / GRID GRAPH</span></div>
        <span className="footer-muted">100% CLIENT-SIDE · ZERO API CALLS</span>
      </div>
    </section>
  );
}
