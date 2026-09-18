// Glossy 3D shapes that float around a section, drawn entirely in CSS (a real
// preserve-3d cube, plus a shaded sphere, ring and pill). Decorative only.
// Each wrapper carries data-depth, so Motion3D gives it scroll parallax.
function Cube({ tone = 'blue' }) {
  return (
    <span className={`cube cube-${tone}`}>
      {['f', 'b', 'l', 'r', 't', 'd'].map((f) => (
        <i key={f} className={`cube-${f}`} />
      ))}
    </span>
  );
}

const SETS = {
  hero: [
    { kind: 'cube', tone: 'blue', pos: 'a', depth: 0.25 },
    { kind: 'sphere', pos: 'b', depth: 0.4 },
    { kind: 'ring', pos: 'c', depth: 0.18 },
    { kind: 'cube', tone: 'violet', pos: 'd', depth: 0.32 },
  ],
  section: [
    { kind: 'pill', pos: 'e', depth: 0.3 },
    { kind: 'cube', tone: 'violet', pos: 'f', depth: 0.22 },
  ],
  footer: [
    { kind: 'sphere', pos: 'g', depth: 0.3 },
    { kind: 'cube', tone: 'blue', pos: 'h', depth: 0.2 },
  ],
};

export default function Shapes3D({ set = 'hero' }) {
  return (
    <div className={`shapes3d shapes3d-${set}`} aria-hidden="true">
      {(SETS[set] || []).map((s, i) => (
        <span key={i} className={`shape3d shape3d-${s.pos}`} data-depth={s.depth}>
          <span className="shape3d-spin">
            {s.kind === 'cube' ? <Cube tone={s.tone} /> : <span className={`orb orb-${s.kind}`} />}
          </span>
        </span>
      ))}
    </div>
  );
}
