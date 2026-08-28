import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Checker from '../components/Checker.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Measure from '../components/Measure.jsx';
import Preview from '../components/Preview.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCta from '../components/FinalCta.jsx';
import Footer from '../components/Footer.jsx';
import LandingStory from '../components/LandingStory.jsx';
import { useSite } from '../store/site.jsx';

export default function Landing() {
  const { content } = useSite();
  const cities = content.cities?.length ? content.cities : ['Brisbane', 'Sydney', 'Melbourne'];

  useEffect(() => {
    document.title = content.documentTitle || 'AI Visibility Report for Australian Businesses | MakeFlow';
  }, [content.documentTitle]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="strip">
          <div className="wrap">
            <span>{content.strip}</span>
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track">
                {cities.map((c) => (
                  <span key={c}>{c}</span>
                ))}
                {cities.map((c) => (
                  <span key={`${c}-2`}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Checker />
        <LandingStory />
        <HowItWorks />
        <Measure />
        <Preview />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
