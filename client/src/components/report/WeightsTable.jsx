export default function WeightsTable({ items = [] }) {
  return (
    <div className="weights">
      {items.map((w) => (
        <div className="wrow" key={w.name}>
          <span>{w.name}</span>
          <span className="pct">{w.weight}</span>
          <span className="sc">{w.score == null || w.score === '-' ? '-' : `${w.score}/100`}</span>
        </div>
      ))}
    </div>
  );
}
