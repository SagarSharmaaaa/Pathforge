const items = [
  ['start', 'Start'], ['goal', 'Destination'], ['wall', 'Obstacle'],
  ['frontier', 'Frontier'], ['visited', 'Visited'], ['path', 'Final path'], ['weight', 'Weighted'],
];

export default function Legend() {
  return (
    <div className="legend panel">
      <div className="legend-caption">NODE LEGEND</div>
      <div className="legend-list">
        {items.map(([name, title]) => <span className="legend-item" key={name}><i className={`legend-swatch legend-${name}`} />{title}</span>)}
      </div>
    </div>
  );
}
