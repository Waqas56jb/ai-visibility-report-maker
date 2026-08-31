import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Checker from '../components/Checker.jsx';
import Measure from '../components/Measure.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCta from '../components/FinalCta.jsx';
import Footer from '../components/Footer.jsx';
import LandingStory from '../components/LandingStory.jsx';
import AutomationBand from '../components/AutomationBand.jsx';
import { useSite } from '../store/site.jsx';

export default function Landing() {
  const { content } = useSite();

  useEffect(() => {
    document.title = content.documentTitle || 'AI Visibility Report for Australian Businesses | MakeFlow';
  }, [content.documentTitle]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <LandingStory />
        <AutomationBand />
        <Checker />
        <Measure />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
