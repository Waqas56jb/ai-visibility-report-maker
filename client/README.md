# MakeFlow — Landing Page

Marketing site for MakeFlow, an Australian AI services startup.
Built with **React + Vite**, **lucide-react** and **react-router-dom**.

## Getting started

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Landing page |
| `/login` | Log in |
| `/signup` | Create account |
| `/forgot-password` | Request a reset link |
| `/reset-password` | Set a new password |
| `/reset-password?expired=1` | Invalid/expired reset-link state |
| `/verify-email` | Confirm email after signup |
| `/progress` | Report generation (demo) |
| `/report` | Sample / generated report (demo) |

Auth is **frontend-only**. Every form calls a stub in `src/lib/auth.js` that waits 1.2s, `console.log`s the payload, and resolves. There are no backend, Supabase, or real API calls yet.

## Where to change things

### Brand colors
All colors live as CSS variables at the top of `src/index.css` (`--ink`, `--paper`, `--indigo`, `--cyan`, `--grad`). Fonts are **Bricolage Grotesque** (headings), **Inter** (body) and **JetBrains Mono** (eyebrows).

### Copy
Landing and report copy lives in the section components and `src/lib/reportData.js`. Auth pages match the HTML mock markup.

### Images
Unsplash URLs are inlined in the landing components (hero, measure, services, testimonials, auth art).

### Logo
The logo is `src/components/Logo.jsx` (sparkles mark + MakeFlow, as in the HTML mock).

## Connecting the visibility-checker form to the backend

The checker form calls `submitReport(data)` in **`src/lib/api.js`**, then navigates to `/progress` and `/report`.

To wire up the real backend, replace the stub with a `fetch` to your API —
a commented example is already in that file. The form sends:

```js
{ businessName: string, websiteUrl: string, email: string }
```

Nothing else in the UI needs to change. If your API can fail, wrap the call
in the form (`src/components/Checker.jsx`) with a try/catch and
show an error toast.

## Connecting auth to the backend

Auth pages call **only** the functions in **`src/lib/auth.js`**:

```js
login(data)            // { email, password, remember }
signup(data)           // { fullName, businessName, email, password }
forgotPassword(email)
resetPassword(password)
```

Replace those stubs with real `fetch` calls later. Do not change the page
components — they already go through this single module. A comment in the
file marks the swap point: `Replace with real API calls later.`

“Continue with Google” currently `console.log`s only; wire OAuth when the
backend is ready.

## Project structure

```
client/
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx             # routes
│   ├── index.css           # design system from the HTML mock
│   ├── lib/
│   │   ├── api.js          # submitReport() stub
│   │   ├── auth.js         # login/signup/forgot/reset stubs
│   │   ├── reportData.js   # sample report
│   │   └── toast.jsx
│   ├── pages/              # Landing, auth, Progress, Report
│   └── components/         # landing sections + auth/AuthShell.jsx
```

## Accessibility & performance notes

- Semantic landmarks (`header`, `main`, `section`, `footer`), ordered headings.
- All icon-only buttons have `aria-label`s; the FAQ accordion uses
  `aria-expanded` / `aria-controls`.
- Images are `loading="lazy"` (hero visual is div-built, no LCP image).
- All non-essential motion is disabled for users with
  `prefers-reduced-motion` (via Framer's `MotionConfig` + CSS media query).
