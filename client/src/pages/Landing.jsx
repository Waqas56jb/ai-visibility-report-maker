import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Checker from '../components/Checker.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCta from '../components/FinalCta.jsx';
import Footer from '../components/Footer.jsx';
import AiSpotlight from '../components/AiSpotlight.jsx';
import LandingStory from '../components/LandingStory.jsx';
import Measure from '../components/Measure.jsx';
import SeoServices from '../components/SeoServices.jsx';
import Process from '../components/Process.jsx';
import AboutStrip from '../components/AboutStrip.jsx';

export default function Landing() {
  const { hash } = useLocation();

  // /#measure and /#services arrive from other pages: scroll once the section exists.
  useEffect(() => {
    if (!hash) return undefined;
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [hash]);

  // Fixed here rather than read from the CMS, which still carries the old
  // agency title; the home page is the one title search engines weigh most.
  useEffect(() => {
    document.title = 'MakeFlow | SEO Consultant for Australian Businesses';
  }, []);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <AiSpotlight />
        <LandingStory />
        <AboutStrip />
        <Measure />
        <SeoServices />
        <Process />
        <Checker />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
