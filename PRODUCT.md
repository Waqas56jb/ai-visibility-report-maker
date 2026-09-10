# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the report visitor (client site).** Owner-operators of small and
mid-sized businesses, mainly in Australia and Sri Lanka, across many trades:
local and home services, clinics and allied health, professional services
(law, accounting, consulting), hospitality and venues, and multi-location or
franchise operators. Non-technical. They rank fine on Google, have never asked
an AI assistant the questions their own customers ask, and arrive to find out
whether ChatGPT names them or someone else. No single vertical is prioritised;
the question set adapts to the business, so the site speaks to all of them.

**Secondary — in-house marketers and agencies** running reports on behalf of
those businesses.

**Operator — the MakeFlow team (admin CMS).** Staff who edit published site
copy and theme, tune the scoring engine, manage services/limits, and review
incoming leads and generated reports.

## Product Purpose

MakeFlow runs a business's real customer questions through ChatGPT and shows,
with a score and a PDF, how often and how prominently the answer names that
business. The free report is the product's front door: it turns an invisible
problem ("AI recommends someone else") into a measured one, then hands the
visitor a prioritised list of what to fix. Fixing it — schema and AI-readiness
work, answer/entity content, chatbots, automations, custom builds — is
MakeFlow's paid work. Success is a business that can see its AI-visibility gap
clearly enough to act on it, and a qualified lead for the services that close it.

Three surfaces: `client/` (public marketing site + the report checker and
public report view), `admin/` (CMS that publishes site copy and theme, plus
engine/leads/reports management), `server/` (the API that crawls, generates
questions, scores, and writes the PDF).

## Positioning

An SEO audit tells you where you rank on a results page. This tells you whether
the assistant names you in the answer it writes *instead of* that page — tested
against ChatGPT in two separate modes (web browsing on, and model knowledge
only), scored across six weighted signals (mention rate, prominence, website
AI-readiness, citation rate, sentiment, competitive share of voice), with a
per-competitor share-of-voice breakdown and a ranked fix list. A site can rank
first on Google and still be invisible to AI — usually because it blocks the
crawlers or has nothing quotable to read — and that is the gap this measures.

## Operating Context

- Visitor gives three details (who they are, site URL, optional competitors),
  watches the run happen live (~2–3 minutes: crawl, 30–50 generated questions,
  each run twice, answers scored), and gets a score, a dashboard, and an
  A4-formatted PDF. One free report per email every 30 days.
- Optional account keeps report history and re-runs for trend tracking.
- Booking a call (cal.com) is the main conversion step beyond the report.
- Plans (Starter / Growth / Scale) are presented by seriousness, not price;
  everyone starts on the same free report.
- Admin's Website and Theme tabs publish live to the public site. `client/src/lib/siteDefaults.js`
  and `server/src/config/site.js` are byte-identical first-paint copies of the
  default content and must stay in sync with what is published.
- `server/prompts/recommendations.v1.md` writes the prose that lands in
  customers' PDF reports — report-copy style rules belong there.

## Capabilities and Constraints

- **ChatGPT only, deliberately** — in browsing and knowledge modes, reported
  separately. The product does not test Google, Gemini, Perplexity or Claude,
  and this is a positioning choice ("one engine properly"), not a limitation to
  fix. The repo README still describes a four-engine tool; the README is stale,
  the site copy is authoritative.
- Six weighted signals; weights are shown to the visitor up front. Mention rate
  carries the most.
- Scores vary run to run (AI answers are non-deterministic) — presented as
  snapshots with a trend across runs, never a single fixed number.
- Report still runs when a site blocks crawlers; the AI-readiness score then
  reflects only what was visible and the report names the blocking rules.
- Markets: Australia and Sri Lanka. Australian consumer-protection law (ACCC)
  treats fabricated testimonials as misleading conduct.
- Stack (existing): Vite + React 19, hand-written CSS with `:root` design
  tokens (one `index.css` per app), `lucide-react` icons, `react-router-dom`,
  `framer-motion`. Not Tailwind despite it sitting in devDependencies.
- Deployed on Vercel (client / admin / server as three projects, each with its
  subfolder as Root Directory). Canonical URLs, and only these two:
  `https://ai-visibility-report-maker-client.vercel.app/` and
  `https://ai-visibility-report-maker-admin.vercel.app/`.
- `client/src/store/site.jsx` is runtime theming plumbing — do not edit it for
  design work.

## Brand Commitments

- **Name:** MakeFlow — one word, capital M and F. Never "Make Flow" or "makeflow".
- **Tagline:** "AI, Made Personal."
- **Voice:** direct, confident, plain-spoken. Outcomes in concrete terms, short
  sentences, no corporate jargon or buzzword soup. Modern and tech-forward but
  personal and approachable. Do: "Every lead is captured, no exceptions."
  Don't: "Leverage synergistic AI-powered solutions to optimise your lead
  lifecycle."
- **Design tokens (client):** ink navy `#160C51`, ink-soft `#3A3374`, brand
  blue-lavender `#7287FA` / `#5B6EF0`, mist `#C5CBFF`, paper `#F5F6FF`; brand
  gradient `linear-gradient(160deg,#C5CBFF,#8B9BFB 55%,#5B6EF0)`, ink gradient
  for dark sections. Corner radii 28 / 18 / 12px. Soft diffused shadows only.
  Typeface: the marketing brand is Sora; the current app build uses
  "BDO Grotesk"/"Roboto" — reconcile in DESIGN.md, not here.
- **Assets:** logo + mark at `/Users/isuruabhishek/Projects/MakeFlow Website/assets/`
  (`logo-color.svg`, `logo-white.svg`, `mark.svg`); in-repo `LogoMark.jsx` and
  `aiEngineIcons.jsx` hold the brand marks. `client/public/logo.jpg` (1.2 MB) is
  unreferenced.
- MakeFlow positions itself as an Australian AI studio.

## Evidence on Hand

- Real product copy across `client/src/lib/siteDefaults.js`, the marketing
  pages, and the admin CMS.
- A working sample report (`/report`) and public report view (`/report/:id`).
- **No customer testimonials, reviews, case studies, named customers, or
  benchmark numbers exist.** A `Testimonials.jsx` file with fabricated quotes
  was deleted. The Use Cases page scenarios are explicitly labelled illustrative
  composites. Future work must not fabricate proof of any kind.
- No public pricing exists and this is deliberate — plans are scoped and quoted
  after the free report.

## Product Principles

1. **The free report is the argument.** Every surface exists to get a business
   to run it, understand the gap, and see MakeFlow as the one to close it.
2. **Concrete over hype.** Name the number, the question, the competitor, the
   fix. Never a vague benefit where a specific one fits.
3. **One engine, done properly.** Depth on ChatGPT beats a thin score spread
   across five engines — in the product and in how it's described.
4. **Honest proof only.** No invented testimonials, customers, or metrics;
   illustrative examples are labelled as such.
5. **Adapts to the business, speaks to all of them.** The question set is
   generated per business, so no vertical is the "real" audience.

## Accessibility & Inclusion

No product-specific standard has been set. Baseline: the client site is built
to be fully responsive with no horizontal overflow at 320–1440px, respects
`prefers-reduced-motion`, and keeps interactive controls keyboard-operable —
hold that line in future work.
