function color(v) {
  if (v < 30) return '#F0625A';
  if (v < 60) return '#F5B84B';
  return '#22C55E';
}

export default function BarList({ items = [], colored }) {
  return (
    <div className="bars">
      {items.map((item) => (
        <div className="bar-row" key={item.name}>
          <span className="n">{item.name}</span>
          <div className="t">
            <i style={{ width: `${item.value}%`, background: colored ? color(item.value) : 'var(--grad)' }} />
          </div>
          <span className="v">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
