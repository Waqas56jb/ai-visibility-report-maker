import { useState } from 'react';
import { X } from 'lucide-react';

export default function Chips({ value = [], onChange, placeholder, max = 5 }) {
  const [text, setText] = useState('');

  function add() {
    const next = text.trim();
    if (!next || value.includes(next) || value.length >= max) return;
    onChange([...value, next]);
    setText('');
  }

  return (
    <div className="chips-input">
      <div className="chips-row">
        {value.map((chip) => (
          <span className="chip" key={chip}>
            {chip}
            <button type="button" aria-label={`Remove ${chip}`} onClick={() => onChange(value.filter((c) => c !== chip))}>
              <X className="lucide svg" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
      />
    </div>
  );
}
