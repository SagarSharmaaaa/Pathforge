import { Activity, Binary, CheckCheck, Clock3, Footprints, Gauge, Route, XCircle, CircleDot, Lightbulb, Keyboard } from 'lucide-react';
import { algorithmDetails } from '../algorithms/index.js';

const stateLabel = {
  idle: 'Ready to visualize', exploring: 'Exploring nodes', tracing: 'Tracing final path',
  paused: 'Visualization paused', completed: 'Path discovered', unreachable: 'No route found',
};

function Stat({ icon: Icon, title, value, sub }) {
  return (
    <div className="stat-tile">
      <div className="stat-top"><Icon size={14} /><span>{title}</span></div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Statistics({ algorithm, metrics, onInfo }) {
  const info = algorithmDetails[algorithm];
  const { status, visitedCount, pathLength, totalCost, computeMs, found } = metrics;
  return (
    <aside className="insights-panel">
      <div className="panel stats-main">
        <div className="insight-heading"><Activity size={16} /> LIVE STATISTICS <span className="small-corner">02 / ANALYZE</span></div>
        <div className="status-card">
          <div className="status-overline">CURRENT STATUS</div>
          <div className="status-line">
            <span className={`status-symbol ${status}`}>{status === 'completed' ? <CheckCheck size={17} /> : status === 'unreachable' ? <XCircle size={17} /> : <CircleDot size={17} />}</span>
            <span>{stateLabel[status]}</span>
          </div>
        </div>
        <div className="stat-grid">
          <Stat icon={Binary} title="Nodes visited" value={visitedCount.toLocaleString()} sub="Processed nodes" />
          <Stat icon={Footprints} title="Path length" value={pathLength === null ? '—' : `${pathLength}`} sub="Steps / edges" />
          <Stat icon={Clock3} title="Compute time" value={computeMs === null ? '—' : `${computeMs.toFixed(2)}`} sub="Milliseconds (no animation)" />
          <Stat icon={Gauge} title="Path cost" value={totalCost ?? '—'} sub="Travel cost" />
        </div>
        <div className="result-row"><span><Route size={14} /> Path found</span><strong className={found === true ? 'result-yes' : found === false ? 'result-no' : ''}>{found === null ? '—' : found ? 'YES' : 'NO'}</strong></div>
        <div className="result-row"><span><Binary size={14} /> Algorithm</span><strong>{info.short}</strong></div>
      </div>
      <div className="panel explain-card">
        <div className="section-eyebrow"><Lightbulb size={14} /> UNDER THE HOOD</div>
        <h3>{info.name}</h3>
        <p>{info.description}</p>
        <div className="spec-grid"><span>DATA STRUCTURE</span><strong>{info.structure}</strong><span>TIME COMPLEXITY</span><strong>{info.time}</strong></div>
        <button className="text-action" onClick={onInfo} type="button">Explore algorithm details <span>↗</span></button>
      </div>
      <div className="shortcut-panel"><Keyboard size={15} /> <span><strong>Quick keys</strong><br />Space · Run / pause &nbsp; R · Reset</span></div>
    </aside>
  );
}
