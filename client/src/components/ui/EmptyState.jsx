export default function EmptyState({ title, body, action }) {
  return (
    <div className="empty card">
      <h3>{title}</h3>
      {body && <p className="muted">{body}</p>}
      {action}
    </div>
  );
}
