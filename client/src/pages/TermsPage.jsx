import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import { useSite } from '../store/site.jsx';

const UPDATED = '30 August 2026';

export default function TermsPage() {
  const { content } = useSite();
  const brand = content.brandName || 'MakeFlow';

  useEffect(() => {
    document.title = `Terms and Conditions | ${brand}`;
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
              <h1>Terms and Conditions</h1>
              <p className="lead">Last updated {UPDATED}</p>
            </Reveal>
          </div>
        </section>

        <section className="section legal-sec">
          <div className="wrap">
            <Reveal className="legal">
              <p>
                These terms apply whenever you use the {brand} website, run an AI visibility
                report, or engage {brand} for services. By using the site or the report tool, you
                agree to them.
              </p>

              <h2>The service</h2>
              <p>
                {brand} provides an AI visibility report that checks how businesses appear in
                answers from AI assistants, plus SEO services (technical SEO, local SEO, on-page and
                content work, AEO and GEO) delivered as separate paid engagements. The free
                report is provided as a snapshot at a point in time — see Report accuracy below.
              </p>

              <h2>Report accuracy</h2>
              <ul>
                <li>
                  Scores reflect the answers AI assistants gave at the moment the report ran. AI
                  models change constantly, so results can and do vary if you run the same check
                  again later.
                </li>
                <li>The report is informational. It is not a guarantee of future ranking, mentions, or business outcomes.</li>
                <li>We make reasonable efforts to keep the methodology fair and consistent, but we do not control how any third-party AI assistant behaves.</li>
              </ul>

              <h2>Free report usage</h2>
              <p>
                The free report is limited to one run per business per period as shown on the site,
                intended for genuine evaluation. We may throttle, decline, or investigate usage that
                looks automated, abusive, or intended to burden the service.
              </p>

              <h2>Paid services</h2>
              <p>
                Paid plans and custom engagements are scoped and priced separately, either through
                the plans on this site or a proposal we send you. Fees, deliverables, and timelines
                for a specific engagement are set out in that plan or proposal, which forms part of
                these terms for that engagement.
              </p>

              <h2>Your responsibilities</h2>
              <ul>
                <li>Give us accurate information about your business when running a report or engaging our services.</li>
                <li>Don't use the site to test, scrape, or reverse-engineer our systems, or to submit content you don't have the right to share.</li>
                <li>You're responsible for how you act on the report — we recommend treating it as one input, not the only input, into your decisions.</li>
              </ul>

              <h2>Intellectual property</h2>
              <p>
                The {brand} site, report format, and scoring methodology are our intellectual
                property. Your report content (the specific answers and scores generated for your
                business) is yours to use. Any custom work we build for you under a paid engagement
                is licensed or assigned as set out in that engagement's proposal.
              </p>

              <h2>Liability</h2>
              <p>
                To the extent permitted by law, {brand} is not liable for indirect or consequential
                loss arising from use of the free report or the website, including loss of business,
                revenue, or opportunity. Nothing here limits liability that cannot be excluded under
                the Australian Consumer Law.
              </p>

              <h2>Changes</h2>
              <p>
                We may update these terms as the service changes. Continuing to use the site after
                an update means you accept the revised terms.
              </p>

              <h2>Governing law</h2>
              <p>These terms are governed by the laws of Australia.</p>

              <h2>Contact</h2>
              <p>
                Questions about these terms? Email{' '}
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
