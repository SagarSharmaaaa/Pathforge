import {
  Play, Pause, RotateCcw, Eraser, Grid2X2, Shuffle, Layers,
  MousePointer2, Info, Trash2, SlidersHorizontal, Zap, Pencil, Route,
} from 'lucide-react';

const options = [
  { value: 'bfs', label: 'Breadth-First Search', tag: 'BFS' },
  { value: 'dfs', label: 'Depth-First Search', tag: 'DFS' },
  { value: 'dijkstra', label: "Dijkstra's Algorithm", tag: 'DIJKSTRA' },
  { value: 'astar', label: 'A* Search', tag: 'A*' },
];
const speeds = ['slow', 'normal', 'fast', 'instant'];
const tools = [
  { id: 'wall', label: 'Walls', icon: Pencil, title: 'Click and drag to draw or remove walls' },
  { id: 'weight', label: 'Weights', icon: Layers, title: 'Paint weighted nodes with your chosen traversal cost' },
  { id: 'erase', label: 'Eraser', icon: Eraser, title: 'Remove a wall or a weight' },
];

export default function Sidebar(props) {
  const {
    algorithm, setAlgorithm, speed, setSpeed, tool, setTool, weight, setWeight,
    density, setDensity, onStart, onPause, onResume, onMaze, onClearPath,
    onClearWalls, onReset, status, onInfo,
  } = props;
  const animating = ['exploring', 'tracing'].includes(status);
  const paused = status === 'paused';
  return (
    <aside className="sidebar panel">
      <div className="sidebar-title"><SlidersHorizontal size={16} /> CONTROLS <span className="small-corner">01 / CONFIGURE</span></div>
      <section className="control-section">
        <label htmlFor="algorithm" className="field-label">Pathfinding algorithm</label>
        <div className="select-wrap">
          <select id="algorithm" value={algorithm} onChange={e => setAlgorithm(e.target.value)} title="Choose the pathfinding algorithm">
            {options.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="inline-note"><Info size={13} /><span>{algorithm === 'bfs' || algorithm === 'dfs' ? 'This algorithm ignores weighted cell costs.' : 'Uses weighted cell costs for optimal routing.'}</span></div>
      </section>
      <section className="control-section">
        <div className="field-row"><label htmlFor="speed" className="field-label">Animation speed</label><span className="value-tag">{speed.toUpperCase()}</span></div>
        <input id="speed" type="range" min="0" max="3" step="1"
          value={speeds.indexOf(speed)} onChange={e => setSpeed(speeds[Number(e.target.value)])}
          aria-label="Animation speed" title="Slow, normal, fast or instant" />
        <div className="range-markers"><span>Slow</span><span>Normal</span><span>Fast</span><span>Instant</span></div>
      </section>
      <section className="control-section">
        <div className="field-label">Drawing tools</div>
        <div className="tool-group" role="group" aria-label="Grid drawing mode">
          {tools.map(({ id, label, icon: Icon, title }) => (
            <button type="button" key={id} title={title} aria-pressed={tool === id}
              onClick={() => setTool(id)} className={`tool-button ${tool === id ? 'active' : ''}`}>
              <Icon size={16} /><span>{label}</span>
            </button>
          ))}
        </div>
        {tool === 'weight' && (
          <div className="weight-picker">
            <label htmlFor="weight" className="muted-small">Cell traversal cost</label>
            <select id="weight" value={weight} onChange={e => setWeight(Number(e.target.value))}>
              {[2, 3, 5, 7, 9].map(value => <option key={value} value={value}>×{value} cost</option>)}
            </select>
          </div>
        )}
        <div className="inline-note"><MousePointer2 size={13} /><span>Drag the green and red nodes to move them.</span></div>
      </section>
      <section className="control-section maze-section">
        <div className="field-row"><label htmlFor="density" className="field-label">Maze density</label><span className="value-tag">{density}%</span></div>
        <input type="range" id="density" min="10" max="50" step="5" value={density}
          onChange={e => setDensity(Number(e.target.value))} title="Wall density for random mazes" />
        <div className="range-markers"><span>Sparse</span><span>Dense</span></div>
        <button type="button" className="btn btn-secondary full" onClick={onMaze} title="Generate a fresh random obstacle field">
          <Shuffle size={16} /> Generate random maze
        </button>
      </section>
      <section className="run-section">
        <button className="btn btn-primary full start-button" type="button" onClick={onStart} title="Run pathfinding (Space when idle)">
          <Play size={17} fill="currentColor" /> {animating || paused ? 'Restart visualization' : 'Start visualization'}
        </button>
        {animating ? (
          <button className="btn btn-secondary full" type="button" onClick={onPause} title="Pause the current animation">
            <Pause size={15} /> Pause visualization
          </button>
        ) : paused ? (
          <button className="btn btn-secondary full" type="button" onClick={onResume} title="Resume the paused animation">
            <Play size={15} /> Resume visualization
          </button>
        ) : (
          <div className="run-hint"><Zap size={13} /> Ready when you are</div>
        )}
      </section>
      <div className="utility-actions">
        <button className="btn btn-quiet" type="button" onClick={onClearPath} title="Clear visited and path highlights"><Route size={15} /> Clear path</button>
        <button className="btn btn-quiet" type="button" onClick={onClearWalls} title="Remove walls, preserve weighted cells"><Trash2 size={15} /> Clear walls</button>
        <button className="btn btn-quiet reset-full" type="button" onClick={onReset} title="Clear the entire grid and restore node positions"><RotateCcw size={15} /> Reset grid</button>
      </div>
      <button className="learn-link" type="button" onClick={onInfo}><Grid2X2 size={14} /> Learn about the algorithms <span>↗</span></button>
    </aside>
  );
}
