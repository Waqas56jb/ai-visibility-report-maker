import Reveal from './Reveal.jsx';

const QUOTES = [
  {
    text: '"I genuinely thought we ranked well. The report showed ChatGPT recommending three competitors for \'best physio in Newcastle\' and never us. Fixing the schema and FAQ took two weeks."',
    name: 'Priya Nair',
    role: 'Owner, Coastline Physio',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    text: '"The gap list was the part I forwarded to my team. Seeing the exact questions we were absent from made the priorities obvious."',
    name: 'Daniel Ross',
    role: 'Director, Ross & Co Conveyancing',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    text: '"We re-ran it after the changes. 19 to 61. That\'s a number I can put in front of the board."',
    name: 'Mel Tran',
    role: 'Marketing lead, Northside Dental',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
  },
];

export default function Testimonials() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">What owners say</span>
          <h2>Low scores are the useful ones</h2>
        </Reveal>
        <div className="quotes">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i === 0 ? '' : `d${i}`} className="card quote">
              <div className="stars">★★★★★</div>
              <p>{q.text}</p>
              <div className="who">
                <img src={q.img} alt="" />
                <div>
                  <strong>{q.name}</strong>
                  <span>{q.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
