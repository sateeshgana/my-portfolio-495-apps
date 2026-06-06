# Ultra-Modern Portfolio Redesign — Design Spec

**Date:** 2026-06-06
**Status:** Approved
**Goal:** Redesign both portfolio pages (Career + AI Portfolio) with a Cyber/Neon Glow aesthetic, cinematic Framer Motion animations, and real resume content — making the site feel like a next-gen AI product rather than a static CV.

---

## Design System

### Theme: Cyber / Neon Glow
- **Background:** `#050508` (deep space black)
- **Primary accent:** `#6366f1` (indigo) + `#818cf8` (lighter indigo)
- **Secondary accent:** `#a78bfa` (violet)
- **Live status:** `#34d399` (emerald green)
- **Data viz accent:** `#38bdf8` (sky blue)
- **Text primary:** `#f1f5f9` · secondary: `#94a3b8` · muted: `#64748b`
- **Card backgrounds:** `#0a0a12`
- **Borders:** `rgba(99,102,241,0.2)` standard · `rgba(52,211,153,0.3)` for live apps

### Name Branding
`Sateesh <g/>` — "Sateesh" in white, `<g/>` in `#818cf8` with `text-shadow: 0 0 30px rgba(129,140,248,0.7)`. Used in nav logo, hero h1, and page title.

### Animation Library
**Framer Motion** (`framer-motion`) — new dependency added to `package.json`.

### Animation Catalogue
| Name | Implementation |
|---|---|
| Particle canvas | `<canvas>` + `requestAnimationFrame` custom hook `useParticles()` — 60 dots drifting slowly, indigo/violet colours |
| Hero text reveal | `motion.div` with `initial: {opacity:0, y:30}` → `animate: {opacity:1, y:0}`, staggered children via `variants` |
| Typewriter subtitle | Custom `useTypewriter()` hook cycling through role strings with blinking `▍` cursor |
| Scroll reveal | `whileInView={{ opacity:1, y:0 }}` with `viewport={{ once:true, margin:"-80px" }}` |
| Stagger children | Parent `variants` with `staggerChildren: 0.07` for skill tags, project cards, timeline items |
| Count-up numbers | Custom `useCountUp(target, duration)` hook triggered by `useInView` ref |
| Glow pulse | CSS `@keyframes glowPulse` on live-app border — `box-shadow` oscillates between dim and bright green |
| Shimmer sweep | CSS `@keyframes shimmer` on coming-soon cards — diagonal gradient sweeps left-to-right on 2.5s loop |
| Hover lift + glow | `whileHover={{ y: -3, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}` on all cards |
| Nav indicator | Active tab gets `layoutId="activeTab"` shared layout animation for smooth sliding highlight |

---

## Career Page (`CareerPage` component)

### Section 1 — Hero
- Full viewport (`min-h-screen`) dark section with particle canvas as `position:absolute` background
- Two-column on lg: left = text content, right = floating "Career snapshot" card (existing highlights)
- **H1:** `Sateesh` (white, `text-8xl font-black`) on line 1, `<g/>` (indigo glow) on line 2
- **Subtitle typewriter** cycles: `"Principal UI / Full-Stack Architect"` → `"AI-Augmented Engineer"` → `"Life Sciences & HealthTech Expert"` → `"Claude Code Power User"`
- **Role badge:** `Principal UI / Full-Stack Architect | Life Sciences & HealthTech | AI-Augmented Engineering` in small indigo pill
- **CTAs:** `View AI Portfolio →` (solid indigo, glow shadow) + `LinkedIn Profile` (outlined)
- Reveal animation: badge → h1 → typewriter → CTAs, each staggered 0.1s

### Section 2 — Stats Bar
- Full-width dark strip, 4-column grid, thin indigo dividers between columns
- Stats from resume: **13+** Years Experience · **11 yrs** At Excelra · **352+** AI Apps Built · **6+** Major Projects
- Each number: `text-4xl font-black text-indigo-400` with glow shadow
- `useCountUp()` triggers when section scrolls into view
- Label below each: `text-[9px] uppercase tracking-widest text-slate-500`

### Section 3 — Employment Timeline
- Vertical glowing spine: `w-px bg-gradient-to-b from-indigo-500/60 to-indigo-500/10`
- Node dots: active role = filled indigo circle with `box-shadow` glow · older roles = progressively dimmer
- **Roles from resume (newest first):**
  1. Principal Architect — Excelra (Apr 2025–Present)
  2. Senior Architect — Excelra (Aug 2024–Mar 2025)
  3. UI Architect / Senior Technical Manager — Excelra (Apr 2022–Jul 2024)
  4. UI Architect / Technical Manager — Excelra (Jun 2020–Mar 2022)
  5. Technical Lead / Full-Stack Developer — Excelra (Jun 2015–May 2020)
  6. Web Developer — CG Mines (Dec 2012–May 2015)
- Each role is a card: title, company, date badge, short description
- Cards stagger in from right on scroll (`x: 40 → 0`)
- Active (current) role has `border-indigo-500/40 border-l-2` left accent

### Section 4 — Key Projects
- 3-column grid of project cards, each with:
  - Tech stack label (top, small, coloured by domain)
  - Project name (`text-sm font-black`)
  - Description (2 lines max)
  - Client + date (bottom, muted)
  - Top-right glow orb (`radial-gradient` absolutely positioned)
- **Projects from resume:**
  1. Clinical Trial Data Extraction Pipeline (Claude API, Python, React · Excelra 2024–Present)
  2. GViz — Genetic Data Visualizer (Angular, D3.js, Azure · Excelra 2020–Present)
  3. GTrack — Genetics Tracking Platform (Angular, AG Grid, MSAL · Excelra 2020–Present)
  4. IRMS — Integrated Request Management (Angular 7, PrimeNG, .NET · 2019)
  5. CTOD — Clinical Trial Outcome Database (Angular, D3.js, HighCharts · 2016–2019)
  6. GMF — GUI Meta-data Framework (HTML5, PHP, Yii2 · 2015–2016)
- Stagger-in on scroll, hover lifts card 3px + indigo glow

### Section 5 — Skills Grid
- 4 category groups, 2×2 layout
- Tags stagger in with `staggerChildren: 0.04`
- **Categories and skills:**
  - **Frontend** (indigo): Angular 2–17 · React · Vue.js · TypeScript · Tailwind CSS · Electron JS
  - **AI / LLM** (violet): Claude API · Multi-agent pipeline design · Prompt engineering · LangChain · Cursor AI · GitHub Copilot
  - **Data Viz** (sky): D3.js · High Charts · Chart.js · AG Grid · Custom SVG rendering
  - **Cloud / DevOps** (emerald): Azure · AWS · GCP · Docker · Azure DevOps · MSAL / Azure AD
- Each tag: outlined border in category colour, small font, `whileHover` brightens border + text

### Section 6 — AI / Vibe Coding Spotlight
- Dark section with violet radial glow top-right
- 3 cards side by side:
  1. **Multi-Agent Pipeline** — Claude Sonnet orchestrator, 80% confidence threshold, React review panel, Azure infra
  2. **Vibe Coding** — Claude + Cursor + v0.dev, zero-to-demo in hours, 352+ apps built
  3. **Certifications** — Claude Code 101 · Generative LLM from Scratch · Anthropic Team subscription at Excelra
- Cards have violet-tinted border + subtle background
- Bottom: Global Employee Recognition Award badge

---

## Portfolio Page (`PortfolioPage` component)

### Section 1 — Hero
- Same particle canvas background as Career hero
- Stat line: `● 125 live apps · ◌ 227 coming soon · 15 domains` (green dot for live, hollow for soon)
- H1: `AI App Portfolio` with "Portfolio" in indigo glow
- CTAs: `View Live Apps ↓` (anchor scroll) + `GitHub →`

### Section 2 — Domain Tab Bar
- Sticky below main nav (`sticky top-[73px] z-20`)
- Horizontal scrollable tab row: `All (352)` + 15 domain tabs
- Active tab: solid indigo background, `layoutId="activeTab"` for smooth sliding
- Inactive: dim border, muted text, hover brightens
- Below tabs: full-width search input + `Live Only` toggle button (right side)
- Mobile: horizontal scroll with `-webkit-overflow-scrolling:touch`

### Section 3 — Masonry App Grid
- CSS `columns-1 sm:columns-2 lg:columns-3` with `column-gap` and `break-inside-avoid` on cards
- Each card `mb-3` for natural masonry gap

**Live app cards:**
- Border: `border-emerald-500/30` + `box-shadow: 0 0 16px rgba(52,211,153,0.08)` base, pulses via `glowPulse` CSS keyframe
- Status indicator: pulsing green dot (`animate-pulse`) + `LIVE` label (top right)
- Content: domain label (indigo, uppercase) · app name · tagline · tag pills · `OPEN APP →` link
- Hover: lifts 3px, border brightens to `emerald-400/50`

**Coming-soon cards:**
- Border: `border-indigo-500/10`, muted text
- `shimmer` CSS animation: diagonal gradient sweep every 2.5s
- Status: hollow circle + `SOON` label
- No tags shown, no link
- Hover: very subtle glow only

**Stagger:** Cards animate in via `staggerChildren: 0.04` when tab/filter changes (exit + enter animation)

---

## Nav (`SiteNav`)
- Logo: indigo-bordered `SG` box + `Sateesh <g/>` text
- Active tab: solid indigo pill with `layoutId` sliding indicator
- GitHub + LinkedIn icon buttons: outlined, hover glows in respective colours

## Footer (`SiteFooter`)
- Dark, minimal — `Sateesh <g/>` · LinkedIn · GitHub · `© 2026 sateesh-ganaparapu.netlify.app`

---

## New Custom Hooks

| Hook | Purpose |
|---|---|
| `useParticles(canvasRef, count)` | Animates N dots on a canvas — drift, wrap, colour from palette |
| `useTypewriter(strings[], speed)` | Cycles through strings with character-by-character reveal + blinking cursor |
| `useCountUp(target, duration, trigger)` | Counts from 0 to target when `trigger` becomes true |

Hooks live in `src/hooks/`.

---

## CSS Additions (`src/index.css`)

```css
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(52,211,153,0.1); }
  50%       { box-shadow: 0 0 20px rgba(52,211,153,0.35); }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

---

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `framer-motion` |
| `src/App.tsx` | Full rewrite — new Career + Portfolio sections, new Nav/Footer |
| `src/index.css` | Add `glowPulse`, `shimmer`, `blink` keyframes |
| `src/hooks/useParticles.ts` | New — canvas particle animation |
| `src/hooks/useTypewriter.ts` | New — typewriter string cycler |
| `src/hooks/useCountUp.ts` | New — scroll-triggered count-up |

---

## Out of Scope

- Dark/light mode toggle
- PDF resume download button
- Blog or writing section
- Animated page transitions between Career ↔ Portfolio (simple fade only)
- Mobile-specific layout changes beyond responsive Tailwind classes
