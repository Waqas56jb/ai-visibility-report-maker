import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

const UPDATED = '30 August 2026';

export default function PrivacyPolicyPage() {
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';

  useEffect(() => {
    document.title = `Privacy Policy | ${brand}`;
  }, [brand]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <section className="page-hero legal-hero">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="wrap">
            <Reveal className="page-hero-in">
              <span className="eyebrow">Legal</span>
              <h1>Privacy Policy</h1>
              <p className="lead">Last updated {UPDATED}</p>
            </Reveal>
          </div>
        </section>

        <section className="section legal-sec">
          <div className="wrap">
            <Reveal className="legal">
              <p>
                {brand} ("we", "us", "our") builds AI visibility reports and AI automation systems
                for businesses. This policy explains what we collect when you use our website or
                run a report, why we collect it, and what we do with it.
              </p>

              <h2>What we collect</h2>
              <p>When you run a free AI visibility report or contact us, we collect:</p>
              <ul>
                <li>Your name, work email address, and phone number, if you give it to us.</li>
                <li>Your business name, website URL, industry, and location.</li>
                <li>Any competitor names or extra detail you enter into the report form.</li>
                <li>
                  Basic usage data (pages visited, browser type, approximate location from IP)
                  collected automatically, the same as almost any website.
                </li>
              </ul>
              <p>We do not collect payment card details directly — plan payments are handled by our payment processor, which has its own privacy policy.</p>

              <h2>How we use it</h2>
              <ul>
                <li>To run the AI visibility check you requested and generate your report.</li>
                <li>To send you the report, follow up on it, and answer questions you raise with us.</li>
                <li>To improve the accuracy of the report and the site over time.</li>
                <li>To send occasional relevant updates, which you can opt out of at any time.</li>
              </ul>

              <h2>AI providers and third parties</h2>
              <p>
                Generating a report means asking third-party AI assistants (such as ChatGPT) the
                same questions your customers might ask, using the business details you provide.
                Those queries are sent to the relevant AI provider under its own terms. We use
                reputable infrastructure providers to host the site, store report data, and send
                email — each bound to keep your data secure and confidential. We do not sell your
                personal information to anyone.
              </p>

              <h2>How long we keep it</h2>
              <p>
                We keep report data and account information for as long as your account is active,
                or as long as needed to provide the service and meet legal obligations. You can ask
                us to delete your data at any time — see Your rights below.
              </p>

              <h2>Your rights</h2>
              <p>
                You can ask us what data we hold on you, ask us to correct it, or ask us to delete
                it, by emailing{' '}
                <a href="mailto:hello@makeflow.com.au">hello@makeflow.com.au</a>. We will respond
                within a reasonable time and in line with the Australian Privacy Principles under
                the Privacy Act 1988 (Cth).
              </p>

              <h2>Cookies</h2>
              <p>
                We use essential cookies to keep the site working and basic analytics cookies to
                understand how the site is used. You can block cookies in your browser settings;
                the site will still work, though some features may be limited.
              </p>

              <h2>Changes to this policy</h2>
              <p>
                We may update this policy as the product changes. Material changes will be posted
                on this page with a new "last updated" date above.
              </p>

              <h2>Contact</h2>
              <p>
                Questions about this policy? Email{' '}
                <a href="mailto:hello@makeflow.com.au">hello@makeflow.com.au</a>.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
