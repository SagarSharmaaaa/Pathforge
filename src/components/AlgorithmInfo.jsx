import { useEffect, useState } from 'react';
import { BookOpen, Check, ChevronRight, Info, X } from 'lucide-react';
import { algorithmDetails } from '../algorithms/index.js';

const keys = ['bfs', 'dfs', 'dijkstra', 'astar'];

export default function AlgorithmInfo({ initial, onClose }) {
  const [selected, setSelected] = useState(initial);
  const detail = algorithmDetails[selected];
  useEffect(() => {
    const onKeyDown = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previous; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal panel" role="dialog" aria-modal="true" aria-label="Algorithm guide">
        <div className="modal-top"><div><span className="section-eyebrow"><BookOpen size={14} /> THE ALGORITHM HANDBOOK</span><h2>Understand the search</h2><p>Core concepts for your ADSA demonstration and viva.</p></div><button className="icon-button" onClick={onClose} aria-label="Close guide" title="Close (Esc)"><X size={20} /></button></div>
        <div className="modal-scroll">
          <div className="algorithm-tabs" role="tablist" aria-label="Choose an algorithm">
            {keys.map(key => <button key={key} type="button" role="tab" aria-selected={selected === key} className={selected === key ? 'active' : ''} onClick={() => setSelected(key)}>{algorithmDetails[key].short}</button>)}
          </div>
          <div className="algorithm-detail">
            <div className="detail-title"><div><span className="section-eyebrow">ALGORITHM OVERVIEW</span><h3>{detail.name}</h3></div><span className="detail-pill">{selected === 'astar' ? 'HEURISTIC' : selected === 'dfs' ? 'EXPLORATION' : 'SHORTEST PATH'}</span></div>
            <p>{detail.description}</p>
            <div className="detail-boxes">
              <div><small>DATA STRUCTURE</small><strong>{detail.structure}</strong></div>
              <div><small>TIME COMPLEXITY</small><strong>{detail.time}</strong></div>
              <div><small>SPACE COMPLEXITY</small><strong>{detail.space}</strong></div>
              <div><small>SHORTEST PATH?</small><strong>{detail.shortest}</strong></div>
            </div>
            <div className="guide-points"><p><Check size={15} /> <span><strong>Weights:</strong> {detail.weighted}</span></p><p><Check size={15} /> <span><strong>Common applications:</strong> {detail.applications}</span></p><p><Info size={15} /> <span>{detail.note}</span></p></div>
          </div>
          <div className="comparison-heading">Side-by-side comparison <ChevronRight size={16} /></div>
          <div className="table-scroller"><table className="comparison-table"><thead><tr><th>Algorithm</th><th>Core structure</th><th>Time</th><th>Space</th><th>Shortest path</th><th>Weighted</th></tr></thead><tbody>{keys.map(key => { const item = algorithmDetails[key]; return <tr key={key}><td>{item.short}</td><td>{item.structure}</td><td>{item.time}</td><td>{item.space}</td><td>{key === 'dfs' ? 'No' : key === 'bfs' ? 'Unweighted only' : 'Yes'}</td><td>{key === 'bfs' || key === 'dfs' ? 'Ignored' : 'Yes'}</td></tr>; })}</tbody></table></div>
          <p className="comparison-footnote">V = vertices (accessible cells), E = edges (four-way connections). Dijkstra and A* use a binary heap. Traversing a weighted cell costs its displayed value; regular cells cost 1. A* uses Manhattan distance, admissible because costs are at least 1.</p>
        </div>
      </div>
    </div>
  );
}
