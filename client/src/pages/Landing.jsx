import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Checker from '../components/Checker.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Measure from '../components/Measure.jsx';
import Preview from '../components/Preview.jsx';
import Services from '../components/Services.jsx';
import Testimonials from '../components/Testimonials.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCta from '../components/FinalCta.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  useEffect(() => {
    document.title = 'MakeFlow — AI Visibility Report';
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="strip">
          <div className="wrap">
            <span>Built on the same methodology used by AI search agencies</span>
            <div className="names">
              <span>Brisbane</span>
              <span>Sydney</span>
              <span>Melbourne</span>
              <span>Perth</span>
              <span>Adelaide</span>
              <span>Gold Coast</span>
            </div>
          </div>
        </div>
        <Checker />
        <HowItWorks />
        <Measure />
        <Preview />
        <Services />
        <Testimonials />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
