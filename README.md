# AI App Portfolio — Sateesh Ganaparapu

**Live site:** [sateesh-ganaparapu.netlify.app](https://sateesh-ganaparapu.netlify.app)

A curated portfolio of 500+ AI-powered web apps spanning 15 domains — productivity, health, education, finance, and more. Every tool is open source and free to use.

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Build | Vite 8 |
| Testing | Vitest + Testing Library |
| Hosting | Netlify |
| CRM | HubSpot Forms API v3 |
| Analytics | Google Analytics 4 (G-28ZYMNJD30) |
| Bot protection | Google reCAPTCHA Enterprise |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

---

## Project Structure

```
src/
  App.tsx                  — root layout: header, filters, grid, footer
  types.ts                 — AppEntry, Domain, shared interfaces
  apps.json                — registry of all apps (id, name, domain, tags, status, url)
  components/
    AppCard.tsx            — individual app card
    SupportWidget.tsx      — floating contact button + HubSpot form panel
  hooks/                   — custom React hooks (each with .test.ts)
netlify/
  functions/               — serverless API endpoints (.mts)
index.html                 — GA4 + reCAPTCHA Enterprise scripts
```

---

## Adding a New App

Add an entry to `src/apps.json`:

```json
{
  "id": "unique-slug",
  "name": "App Name",
  "tagline": "One-line description",
  "domain": "Productivity",
  "tags": ["tag1", "tag2"],
  "status": "live",
  "url": "https://..."
}
```

Status values: `"live"` | `"building"` | `"planned"`

---

## Contact

- **LinkedIn:** [sateesh-ganaparapu-19875257](https://www.linkedin.com/in/sateesh-ganaparapu-19875257/)
- **GitHub:** [@sateeshgana](https://github.com/sateeshgana)
---

## License

MIT — free to use and adapt.
