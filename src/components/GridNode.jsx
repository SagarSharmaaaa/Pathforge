import { memo } from 'react';

function GridNode({ cell, id, cols, isStart, isGoal, state }) {
  let className = 'grid-node';
  if (cell.isWall) className += ' node-wall';
  else if (cell.weight > 1) className += ' node-weight';
  if (state === 'frontier') className += ' node-frontier';
  if (state === 'visited') className += ' node-visited';
  if (state === 'path') className += ' node-path';
  if (isStart) className += ' node-start';
  if (isGoal) className += ' node-goal';
  const label = isStart ? 'Starting node' : isGoal ? 'Destination node' : cell.isWall ? 'Wall' : cell.weight > 1 ? `Cost ${cell.weight}` : 'Open cell';
  return (
    <div data-node-id={id} className={className} role="gridcell"
      aria-label={`Row ${Math.floor(id / cols) + 1}, column ${id % cols + 1}: ${label}`}
      title={label}>
      {isStart ? <span className="endpoint-symbol">S</span> : isGoal ? <span className="endpoint-symbol">E</span> : cell.weight > 1 ? <span className="weight-text">{cell.weight}</span> : null}
    </div>
  );
}
export default memo(GridNode);
