# Ultra-Modern Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio site with a Cyber/Neon Glow theme, cinematic Framer Motion animations, and real resume content across both Career and Portfolio pages.

**Architecture:** Full rewrite of `src/App.tsx` into focused section components. Three new custom hooks (`useParticles`, `useTypewriter`, `useCountUp`) in `src/hooks/`. `AppCard` component updated for dark masonry layout. All animations use Framer Motion with CSS keyframe supplements for glow/shimmer effects.

**Tech Stack:** React 19, TypeScript 6, Framer Motion, Tailwind CSS v4, Vite 8, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `framer-motion` dependency |
| `src/index.css` | Modify | Add `glowPulse`, `shimmer`, `blink` keyframes |
| `src/hooks/useParticles.ts` | Create | Canvas particle animation hook |
| `src/hooks/useTypewriter.ts` | Create | Typewriter string cycler hook |
| `src/hooks/useCountUp.ts` | Create | Scroll-triggered count-up hook |
| `src/components/AppCard.tsx` | Rewrite | Dark masonry card — live glow / coming-soon shimmer |
| `src/App.tsx` | Rewrite | Nav, Career page (6 sections), Portfolio page (3 sections), Footer |

---

## Task 1: Install Framer Motion + CSS Keyframes

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`

- [ ] **Step 1: Install framer-motion**

```bash
cd c:/workspace/sateesh-gana-portfolio
npm install framer-motion
```

Expected output: `added 1 package` (or similar), no errors.

- [ ] **Step 2: Add keyframes to `src/index.css`**

Replace the entire file with:

```css
@import "tailwindcss";

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(52, 211, 153, 0.1); }
  50%       { box-shadow: 0 0 24px rgba(52, 211, 153, 0.4); }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.glow-pulse {
  animation: glowPulse 2.5s ease-in-out infinite;
}

.shimmer-card {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(99, 102, 241, 0.06) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmer 2.5s linear infinite;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
}
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: no TypeScript errors, Vite build succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "feat: add framer-motion + glow/shimmer/blink CSS keyframes"
```

---

## Task 2: `useParticles` Hook

**Files:**
- Create: `src/hooks/useParticles.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useParticles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useParticles } from './useParticles'

describe('useParticles', () => {
  beforeEach(() => {
    // jsdom doesn't implement canvas — stub getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
    })
  })

  it('runs without error when given a canvas ref', () => {
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLCanvasElement>(document.createElement('canvas'))
      useParticles(ref, 10)
    })
    expect(() => unmount()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useParticles
```

Expected: FAIL — `Cannot find module './useParticles'`

- [ ] **Step 3: Create `src/hooks/useParticles.ts`**

```ts
import { useEffect } from 'react'

const COLOURS = ['#6366f1', '#818cf8', '#a78bfa', '#4f46e5']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  colour: string
  opacity: number
}

export function useParticles(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  count = 60,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function init() {
      if (!canvas) return
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        opacity: Math.random() * 0.6 + 0.2,
      }))
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.colour
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [canvasRef, count])
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useParticles
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useParticles.ts src/hooks/useParticles.test.ts
git commit -m "feat: add useParticles canvas animation hook"
```

---

## Task 3: `useTypewriter` Hook

**Files:**
- Create: `src/hooks/useTypewriter.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useTypewriter.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('starts with an empty string', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hello', 'World'], 50)
    )
    expect(result.current).toBe('')
  })

  it('types out the first character after one tick', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hi'], 50)
    )
    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current).toBe('H')
  })

  it('completes the first string', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hi'], 50)
    )
    act(() => { vi.advanceTimersByTime(50 * 2) })
    expect(result.current).toBe('Hi')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useTypewriter
```

Expected: FAIL — `Cannot find module './useTypewriter'`

- [ ] **Step 3: Create `src/hooks/useTypewriter.ts`**

```ts
import { useEffect, useState } from 'react'

export function useTypewriter(strings: string[], speed = 60): string {
  const [displayed, setDisplayed] = useState('')
  const [stringIndex, setStringIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = strings[stringIndex % strings.length]

    const delay = deleting ? speed / 2 : speed

    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setDisplayed(current.slice(0, charIndex + 1))
          setCharIndex((c) => c + 1)
        } else {
          // pause at end before deleting
          setTimeout(() => setDeleting(true), 1800)
        }
      } else {
        if (charIndex > 0) {
          setDisplayed(current.slice(0, charIndex - 1))
          setCharIndex((c) => c - 1)
        } else {
          setDeleting(false)
          setStringIndex((i) => (i + 1) % strings.length)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [charIndex, deleting, stringIndex, strings, speed])

  return displayed
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useTypewriter
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTypewriter.ts src/hooks/useTypewriter.test.ts
git commit -m "feat: add useTypewriter hook for cycling animated text"
```

---

## Task 4: `useCountUp` Hook

**Files:**
- Create: `src/hooks/useCountUp.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useCountUp.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from './useCountUp'

describe('useCountUp', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns 0 before trigger', () => {
    const { result } = renderHook(() => useCountUp(100, 1000, false))
    expect(result.current).toBe(0)
  })

  it('returns target value after duration when triggered', () => {
    const { result } = renderHook(() => useCountUp(100, 500, true))
    act(() => { vi.advanceTimersByTime(600) })
    expect(result.current).toBe(100)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useCountUp
```

Expected: FAIL — `Cannot find module './useCountUp'`

- [ ] **Step 3: Create `src/hooks/useCountUp.ts`**

```ts
import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    let raf: number

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])

  return count
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useCountUp
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCountUp.ts src/hooks/useCountUp.test.ts
git commit -m "feat: add useCountUp scroll-triggered animated counter hook"
```

---

## Task 5: Redesign `AppCard` for Dark Masonry Layout

**Files:**
- Modify: `src/components/AppCard.tsx`

- [ ] **Step 1: Write the failing test**

Replace contents of `src/components/AppCard.test.tsx` (create if missing):

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppCard } from './AppCard'
import type { AppEntry } from '../types'

const liveApp: AppEntry = {
  id: 'test-app',
  name: 'Test App',
  tagline: 'Does something useful',
  domain: 'productivity',
  status: 'live',
  url: 'https://test.netlify.app',
  github: 'https://github.com/test',
  tags: ['ai', 'tools'],
}

const soonApp: AppEntry = { ...liveApp, id: 'soon-app', status: 'coming-soon' }

describe('AppCard', () => {
  it('renders app name and tagline', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('Test App')).toBeTruthy()
    expect(screen.getByText('Does something useful')).toBeTruthy()
  })

  it('shows LIVE badge for live apps', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('LIVE')).toBeTruthy()
  })

  it('shows SOON badge for coming-soon apps', () => {
    render(<AppCard app={soonApp} />)
    expect(screen.getByText('SOON')).toBeTruthy()
  })

  it('renders open app link for live apps', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('OPEN APP →')).toBeTruthy()
  })

  it('does not render open app link for coming-soon apps', () => {
    render(<AppCard app={soonApp} />)
    expect(screen.queryByText('OPEN APP →')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- AppCard
```

Expected: FAIL — `LIVE`, `SOON`, `OPEN APP →` not found in current component

- [ ] **Step 3: Rewrite `src/components/AppCard.tsx`**

```tsx
import { motion } from 'framer-motion'
import type { AppEntry } from '../types'

const DOMAIN_COLOUR: Record<string, string> = {
  productivity:  'text-sky-400',
  education:     'text-lime-400',
  health:        'text-emerald-400',
  finance:       'text-yellow-400',
  legal:         'text-orange-400',
  marketing:     'text-fuchsia-400',
  'dev-tools':   'text-indigo-300',
  business:      'text-blue-400',
  creative:      'text-pink-400',
  hr:            'text-rose-400',
  science:       'text-teal-400',
  'real-estate': 'text-amber-400',
  food:          'text-green-400',
  travel:        'text-cyan-400',
  civic:         'text-violet-400',
}

interface Props { app: AppEntry }

export function AppCard({ app }: Props) {
  const isLive = app.status === 'live'
  const domainColour = DOMAIN_COLOUR[app.domain] ?? 'text-indigo-400'

  if (isLive) {
    return (
      <motion.article
        className="glow-pulse mb-3 break-inside-avoid border border-emerald-500/30 bg-[#0a0a12] p-4"
        style={{ boxShadow: '0 0 16px rgba(52,211,153,0.08)' }}
        whileHover={{ y: -3, boxShadow: '0 0 24px rgba(52,211,153,0.25)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${domainColour}`}>
            {app.domain}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #34d399' }} />
            <span className="text-[8px] font-bold tracking-widest text-emerald-400">LIVE</span>
          </span>
        </div>

        <h3 className="text-sm font-black leading-tight text-slate-100">{app.name}</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{app.tagline}</p>

        {app.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {app.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="border border-indigo-500/25 px-2 py-0.5 text-[8px] font-semibold text-indigo-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-indigo-500/10 pt-3">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold tracking-widest text-emerald-400 transition-colors hover:text-emerald-300"
          >
            OPEN APP →
          </a>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      className="shimmer-card mb-3 break-inside-avoid border border-indigo-500/10 bg-[#0a0a12] p-4"
      whileHover={{ boxShadow: '0 0 12px rgba(99,102,241,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
          {app.domain}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full border border-slate-600" />
          <span className="text-[8px] font-bold tracking-widest text-slate-600">SOON</span>
        </span>
      </div>

      <h3 className="text-sm font-black leading-tight text-slate-500">{app.name}</h3>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-700">{app.tagline}</p>
    </motion.article>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- AppCard
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/AppCard.tsx src/components/AppCard.test.tsx
git commit -m "feat: redesign AppCard for dark masonry — live glow, coming-soon shimmer"
```

---

## Task 6: Rewrite `SiteNav` + `SiteFooter`

**Files:**
- Modify: `src/App.tsx` (nav + footer sections only — keep existing CareerPage/PortfolioPage for now)

- [ ] **Step 1: Replace `SiteNav` and `SiteFooter` functions in `src/App.tsx`**

Find and replace the `SiteNav` function (lines ~101–162) with:

```tsx
function SiteNav({ page, setPage }: SiteNavProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-indigo-500/15 bg-[#050508]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => setPage('career')}
          className="flex items-center gap-3 text-sm font-semibold"
        >
          <span
            className="flex size-8 items-center justify-center border text-xs font-black text-indigo-400"
            style={{ borderColor: 'rgba(99,102,241,0.7)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
          >
            SG
          </span>
          <span className="text-slate-100">
            Sateesh{' '}
            <span style={{ color: '#818cf8', textShadow: '0 0 20px rgba(129,140,248,0.7)' }}>
              &lt;g/&gt;
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {(['career', 'portfolio'] as Page[]).map((p) => (
              <motion.button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className="relative px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
                style={{ color: page === p ? '#fff' : '#475569' }}
                whileHover={{ color: '#818cf8' }}
              >
                {page === p && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {p === 'career' ? 'Career' : 'AI Portfolio'}
              </motion.button>
            ))}
          </AnimatePresence>

          <a
            href="https://github.com/sateeshgana"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex size-8 items-center justify-center border border-slate-700 text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-400"
          >
            <GitBranch size={14} />
          </a>
          <a
            href="https://www.linkedin.com/in/sateesh-ganaparapu-19875257/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex size-8 items-center justify-center border border-slate-700 text-slate-500 transition-colors hover:border-sky-500 hover:text-sky-400"
          >
            <UserRound size={14} />
          </a>
        </div>
      </div>
    </nav>
  )
}
```

Replace the `SiteFooter` function with:

```tsx
function SiteFooter() {
  return (
    <footer className="border-t border-indigo-500/10 bg-[#050508] px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-sm font-semibold text-slate-400">
          Sateesh{' '}
          <span style={{ color: '#818cf8', textShadow: '0 0 16px rgba(129,140,248,0.6)' }}>
            &lt;g/&gt;
          </span>
        </span>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <a href="https://www.linkedin.com/in/sateesh-ganaparapu-19875257/" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">LinkedIn</a>
          <a href="https://github.com/sateeshgana" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">GitHub</a>
          <span>© 2026 sateesh-ganaparapu.netlify.app</span>
        </div>
      </div>
    </footer>
  )
}
```

Add these imports at the top of `src/App.tsx` (after existing imports):

```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

- [ ] **Step 2: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: redesign SiteNav and SiteFooter with Cyber/Neon theme and Framer Motion"
```

---

## Task 7: Career Hero Section

**Files:**
- Modify: `src/App.tsx` — replace `CareerPage` hero section (the first `<section>` inside `<main>`)

- [ ] **Step 1: Add the `ParticleCanvas` component and hero constants near the top of `src/App.tsx`** (after imports, before `App()`):

```tsx
import { useRef } from 'react'
import { useParticles } from './hooks/useParticles'
import { useTypewriter } from './hooks/useTypewriter'
import { useCountUp } from './hooks/useCountUp'

const TYPEWRITER_ROLES = [
  'Principal UI / Full-Stack Architect',
  'AI-Augmented Engineer',
  'Life Sciences & HealthTech Expert',
  'Claude Code Power User',
]

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticles(canvasRef, 60)
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
```

- [ ] **Step 2: Replace the first `<section>` inside `CareerPage`'s `<main>` with:**

```tsx
<section className="relative min-h-screen overflow-hidden bg-[#050508]">
  <ParticleCanvas />
  {/* Glow orbs */}
  <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }} />
  <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)' }} />

  <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Badge */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="mb-6 inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300"
      >
        <BriefcaseBusiness size={12} />
        Principal UI / Full-Stack Architect · Life Sciences & HealthTech · AI Engineering
      </motion.div>

      {/* Name */}
      <motion.h1
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        className="text-7xl font-black leading-none tracking-tight text-white sm:text-8xl lg:text-9xl"
      >
        Sateesh
      </motion.h1>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        className="text-7xl font-black leading-none tracking-tight sm:text-8xl lg:text-9xl"
        style={{ color: '#818cf8', textShadow: '0 0 40px rgba(129,140,248,0.7)' }}
      >
        &lt;g/&gt;
      </motion.div>

      {/* Typewriter */}
      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        className="mt-6 text-base text-indigo-300 sm:text-lg"
      >
        <TypewriterText />
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <motion.button
          type="button"
          onClick={() => setPage('portfolio')}
          className="inline-flex items-center gap-2 bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
          whileHover={{ boxShadow: '0 0 32px rgba(99,102,241,0.8)' }}
          whileTap={{ scale: 0.97 }}
        >
          View AI Portfolio <ArrowUpRight size={15} />
        </motion.button>
        <a
          href="https://www.linkedin.com/in/sateesh-ganaparapu-19875257/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:border-sky-500 hover:text-sky-300"
        >
          LinkedIn Profile <UserRound size={15} />
        </a>
      </motion.div>
    </motion.div>

    {/* Right: career snapshot card */}
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="border border-indigo-500/20 bg-[#0a0a12] p-6"
      style={{ boxShadow: '0 0 40px rgba(99,102,241,0.06)' }}
    >
      <p className="mb-4 text-[9px] font-bold uppercase tracking-widest text-indigo-400">Career snapshot</p>
      <div className="space-y-3">
        {careerHighlights.map((h) => (
          <div key={h} className="border border-indigo-500/10 bg-[#050508] p-4">
            <p className="text-sm leading-relaxed text-slate-400">{h}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
</section>
```

- [ ] **Step 3: Add `TypewriterText` component** (inside `src/App.tsx`, near `ParticleCanvas`):

```tsx
function TypewriterText() {
  const text = useTypewriter(TYPEWRITER_ROLES, 55)
  return (
    <span>
      {text}
      <span className="cursor-blink ml-0.5 text-indigo-400">▍</span>
    </span>
  )
}
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add cinematic career hero with particles, typewriter, and Framer Motion reveals"
```

---

## Task 8: Stats Bar + Employment Timeline

**Files:**
- Modify: `src/App.tsx` — replace the `bg-[#f4f1e8]` employment section

- [ ] **Step 1: Add employment data constants** (replace existing `employmentHistory` array):

```tsx
const employmentHistory = [
  {
    role: 'Principal Architect',
    company: 'Excelra Knowledge Solutions',
    period: 'Apr 2025 – Present',
    current: true,
    detail: 'AI-augmented engineering: multi-agent clinical data extraction pipeline using Claude Sonnet orchestration, React review panel, Azure infrastructure.',
  },
  {
    role: 'Senior Architect',
    company: 'Excelra Knowledge Solutions',
    period: 'Aug 2024 – Mar 2025',
    current: false,
    detail: 'Architecture leadership for AI systems and Life Sciences data platforms.',
  },
  {
    role: 'UI Architect / Senior Technical Manager',
    company: 'Excelra Knowledge Solutions',
    period: 'Apr 2022 – Jul 2024',
    current: false,
    detail: 'Analytics dashboards and clinical data visualization using Angular, D3.js, and Azure cloud architecture.',
  },
  {
    role: 'UI Architect / Technical Manager',
    company: 'Excelra Knowledge Solutions',
    period: 'Jun 2020 – Mar 2022',
    current: false,
    detail: 'Data visualization and analytics stream — GViz, GTrack platforms for genetics scientists.',
  },
  {
    role: 'Technical Lead / Full-Stack Developer',
    company: 'Excelra Knowledge Solutions',
    period: 'Jun 2015 – May 2020',
    current: false,
    detail: 'Built CTOD, GMF, IRMS — clinical trial and metadata platforms using Angular, PHP, and .NET.',
  },
  {
    role: 'Web Developer',
    company: 'CG Mines',
    period: 'Dec 2012 – May 2015',
    current: false,
    detail: 'Built Resumpooler job portal with PHP/CodeIgniter, Google Analytics integration, and on-page SEO.',
  },
]
```

- [ ] **Step 2: Add `StatsBar` component** (near `ParticleCanvas` in `src/App.tsx`):

```tsx
function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTriggered(true); io.disconnect() }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const yrs = useCountUp(13, 1200, triggered)
  const excelra = useCountUp(11, 1200, triggered)
  const apps = useCountUp(352, 1500, triggered)
  const projects = useCountUp(6, 1000, triggered)

  const stats = [
    { value: yrs, suffix: '+', label: 'Years Experience' },
    { value: excelra, suffix: ' yrs', label: 'At Excelra' },
    { value: apps, suffix: '+', label: 'AI Apps Built' },
    { value: projects, suffix: '+', label: 'Major Projects' },
  ]

  return (
    <div ref={ref} className="border-y border-indigo-500/15 bg-[#080810]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-indigo-500/10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-8 py-8 text-center">
            <div className="text-4xl font-black" style={{ color: '#818cf8', textShadow: '0 0 20px rgba(129,140,248,0.5)' }}>
              {s.value}<span className="text-xl text-indigo-500">{s.suffix}</span>
            </div>
            <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Add `import React from 'react'` or use `useState`/`useEffect` directly (they're already imported).

- [ ] **Step 3: Replace the `bg-[#f4f1e8]` employment section with StatsBar + Timeline:**

```tsx
<StatsBar />

<section className="bg-[#050508] px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="mb-12"
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Employment History</p>
      <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Career Timeline</h2>
    </motion.div>

    <div className="flex gap-8">
      {/* Spine */}
      <div className="flex flex-col items-center pt-1">
        {employmentHistory.map((item, i) => (
          <React.Fragment key={item.period}>
            <div
              className="size-3 flex-shrink-0 rounded-full"
              style={{
                background: item.current ? '#6366f1' : i < 2 ? '#4f46e5' : '#1e1b4b',
                boxShadow: item.current ? '0 0 14px rgba(99,102,241,0.8)' : 'none',
              }}
            />
            {i < employmentHistory.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(99,102,241,0.05))', minHeight: '60px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-4">
        {employmentHistory.map((item, i) => (
          <motion.article
            key={item.period}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08 }}
            className="border bg-[#0a0a12] p-5"
            style={{
              borderColor: item.current ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.1)',
              borderLeftWidth: item.current ? '2px' : '1px',
              borderLeftColor: item.current ? '#6366f1' : undefined,
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-100">{item.role}</h3>
                <p className="mt-1 text-xs text-indigo-400">{item.company}</p>
              </div>
              <span className="self-start border border-indigo-500/20 px-2 py-1 text-[9px] font-bold tracking-wider text-indigo-400">
                {item.period}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{item.detail}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add count-up stats bar and glowing employment timeline with real resume data"
```

---

## Task 9: Key Projects + Skills Grid + AI Spotlight

**Files:**
- Modify: `src/App.tsx` — replace the skills section and add projects + AI spotlight

- [ ] **Step 1: Add project and skills data constants** (replace existing `skills` array):

```tsx
const projects = [
  {
    name: 'Clinical Trial Data Extraction Pipeline',
    stack: 'Claude API · Python · React · Azure',
    stackColour: 'text-violet-400',
    description: 'Production-grade multi-agent AI system. Claude Sonnet orchestrator, 80% confidence threshold triggers human review. Processes 50–500 PDFs per batch.',
    client: 'Excelra · 2024–Present',
  },
  {
    name: 'GViz — Genetic Data Visualizer',
    stack: 'Angular · D3.js · Azure AD · MSAL',
    stackColour: 'text-sky-400',
    description: '5 custom D3.js plot types (scatter, manhattan, boxplot, heatmap, network). Collaborative SVG annotations, RBAC via Azure AD.',
    client: 'Excelra · 2020–Present',
  },
  {
    name: 'GTrack — Genetics Tracking Platform',
    stack: 'Angular 10 · AG Grid · MSAL · PostgreSQL',
    stackColour: 'text-indigo-400',
    description: 'Genomic record search with custom table views, batch analysis operations, Azure AD SSO, CICD pipelines.',
    client: 'Excelra · 2020–Present',
  },
  {
    name: 'IRMS — Integrated Request Management',
    stack: 'Angular 7 · PrimeNG · .NET Core · Azure',
    stackColour: 'text-emerald-400',
    description: 'Configurable request management for CROs. Drag-and-drop form builder, RBAC, dashboard reports.',
    client: 'Excelra · 2019',
  },
  {
    name: 'CTOD — Clinical Trial Outcome Database',
    stack: 'Angular · D3.js · High Charts · .NET Core',
    stackColour: 'text-amber-400',
    description: 'Analytics platform for clinical trial analysis. Network graphs, sunburst charts, drilldown navigation.',
    client: 'Excelra · 2016–2019',
  },
  {
    name: 'GMF — GUI Meta-data Framework',
    stack: 'HTML5 · PHP · Yii2 · MySQL',
    stackColour: 'text-rose-400',
    description: 'GUI platform for AXI server computation workflows. Metadata CSV import, execution monitoring, reports.',
    client: 'Excelra · 2015–2016',
  },
]

const skillGroups = [
  {
    label: 'Frontend',
    colour: 'border-indigo-500/40 text-indigo-400',
    skills: ['Angular 2–17', 'React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Electron JS'],
  },
  {
    label: 'AI / LLM',
    colour: 'border-violet-500/40 text-violet-400',
    skills: ['Claude API', 'Multi-agent pipelines', 'Prompt engineering', 'LangChain', 'Cursor AI', 'GitHub Copilot'],
  },
  {
    label: 'Data Viz',
    colour: 'border-sky-500/40 text-sky-400',
    skills: ['D3.js', 'High Charts', 'Chart.js', 'AG Grid', 'Custom SVG rendering'],
  },
  {
    label: 'Cloud / DevOps',
    colour: 'border-emerald-500/40 text-emerald-400',
    skills: ['Azure', 'AWS', 'GCP', 'Docker', 'Azure DevOps', 'MSAL / Azure AD'],
  },
]
```

- [ ] **Step 2: Replace the existing skills section with Projects + Skills + AI Spotlight:**

Replace the `<section className="border-y border-stone-800 bg-stone-950 ...">` section:

```tsx
{/* Key Projects */}
<section className="bg-[#080810] px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="mb-12">
      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Project Portfolio</p>
      <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Key Projects</h2>
    </motion.div>
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {projects.map((p) => (
        <motion.article
          key={p.name}
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -3, boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}
          className="relative overflow-hidden border border-indigo-500/20 bg-[#0a0a12] p-5"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-16" style={{ background: 'radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 70%)' }} />
          <p className={`text-[9px] font-bold uppercase tracking-widest ${p.stackColour}`}>{p.stack}</p>
          <h3 className="mt-2 text-sm font-black leading-tight text-slate-100">{p.name}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{p.description}</p>
          <p className="mt-4 text-[9px] tracking-wider text-slate-700">{p.client}</p>
        </motion.article>
      ))}
    </motion.div>
  </div>
</section>

{/* Skills Grid */}
<section className="bg-[#050508] px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="mb-12">
      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Capabilities</p>
      <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Core Skills</h2>
    </motion.div>
    <div className="grid gap-8 sm:grid-cols-2">
      {skillGroups.map((group) => (
        <div key={group.label}>
          <p className={`mb-4 text-[9px] font-bold uppercase tracking-widest ${group.colour.split(' ')[1]}`}>{group.label}</p>
          <motion.div
            className="flex flex-wrap gap-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {group.skills.map((skill) => (
              <motion.span
                key={skill}
                variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } }}
                whileHover={{ scale: 1.05 }}
                className={`border px-3 py-1.5 text-[10px] font-semibold ${group.colour}`}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* AI Spotlight */}
<section className="relative overflow-hidden bg-[#080810] px-5 py-20 sm:px-8">
  <div className="pointer-events-none absolute right-0 top-0 h-64 w-64" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)' }} />
  <div className="mx-auto max-w-7xl">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="mb-12">
      <p className="text-[9px] font-bold uppercase tracking-widest text-violet-400">AI Research & Vibe Coding</p>
      <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Where I Push the Edge</h2>
    </motion.div>
    <motion.div
      className="grid gap-4 sm:grid-cols-3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {[
        { icon: '🤖', title: 'Multi-Agent Pipeline', body: 'Clinical data extraction at Excelra. Claude Sonnet as orchestrator. 80% confidence threshold for human review escalation. FastAPI + Azure Blob + Service Bus.' },
        { icon: '⚡', title: 'Vibe Coding', body: 'Claude + Cursor AI + v0.dev. Zero-to-demo in hours. 352+ AI-powered web apps built via LLM pair programming. Active Claude Code CLI user.' },
        { icon: '🎓', title: 'Certifications', body: 'Claude Code 101 · Hands-On AI: Build a Generative LLM from Scratch · Learning Python. Anthropic Team subscription at Excelra. Global Employee Recognition Award.' },
      ].map((card) => (
        <motion.div
          key={card.title}
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -3, boxShadow: '0 0 24px rgba(167,139,250,0.2)' }}
          className="border border-violet-500/20 bg-[#0a0a12] p-6"
          style={{ background: 'rgba(167,139,250,0.03)' }}
        >
          <div className="mb-4 text-2xl">{card.icon}</div>
          <h3 className="text-sm font-black text-slate-100">{card.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.body}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add key projects, grouped skills grid, and AI/vibe coding spotlight sections"
```

---

## Task 10: Portfolio Page Redesign

**Files:**
- Modify: `src/App.tsx` — full rewrite of `PortfolioPage`

- [ ] **Step 1: Replace `PortfolioPage` function entirely:**

```tsx
function PortfolioPage() {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<Domain>('all')
  const [liveOnly, setLiveOnly] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return apps.filter((app) => {
      const matchDomain = domain === 'all' || app.domain === domain
      const matchLive = !liveOnly || app.status === 'live'
      const matchQuery = !q ||
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q))
      return matchDomain && matchLive && matchQuery
    })
  }, [query, domain, liveOnly])

  const liveCount = apps.filter((a) => a.status === 'live').length
  const soonCount = apps.length - liveCount

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden bg-[#050508]">
        <ParticleCanvas />
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)' }} />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)' }} />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-5 py-20 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 inline-flex items-center gap-3 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                {liveCount} live apps
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full border border-slate-600" />
                {soonCount} coming soon
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-indigo-400">15 domains</span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="text-6xl font-black leading-none text-white sm:text-7xl lg:text-8xl"
            >
              AI App{' '}
              <span style={{ color: '#818cf8', textShadow: '0 0 40px rgba(129,140,248,0.7)' }}>
                Portfolio
              </span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
            >
              A living portfolio of AI products, experiments, and practical tools built across
              productivity, education, legal, finance, health, and developer workflows.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="#apps"
                className="inline-flex items-center gap-2 bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
              >
                View Live Apps <ArrowUpRight size={15} />
              </a>
              <a
                href="https://github.com/sateeshgana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:border-indigo-500 hover:text-indigo-300"
              >
                GitHub <GitBranch size={15} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Domain tabs + search */}
      <div id="apps" className="sticky top-[57px] z-20 border-b border-indigo-500/15 bg-[#050508]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
          <div className="flex gap-1.5 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
            {(['all', ...DOMAINS.filter((d) => d !== 'all')] as Domain[]).map((d) => {
              const count = d === 'all' ? apps.length : apps.filter((a) => a.domain === d).length
              return (
                <motion.button
                  key={d}
                  type="button"
                  onClick={() => setDomain(d)}
                  className="relative flex-shrink-0 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: domain === d ? '#fff' : '#475569' }}
                  whileHover={{ color: '#818cf8' }}
                >
                  {domain === d && (
                    <motion.span
                      layoutId="domainTab"
                      className="absolute inset-0 bg-indigo-600"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  {domainLabels[d]} · {count}
                </motion.button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 items-center gap-2 border border-indigo-500/20 bg-[#0a0a12] px-3 py-2">
              <Search size={13} className="text-indigo-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${apps.length} apps…`}
                className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-700 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setLiveOnly((v) => !v)}
              className="border px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors"
              style={{
                borderColor: liveOnly ? 'rgba(52,211,153,0.5)' : 'rgba(99,102,241,0.2)',
                color: liveOnly ? '#34d399' : '#475569',
                background: liveOnly ? 'rgba(52,211,153,0.06)' : 'transparent',
              }}
            >
              Live Only
            </button>
          </div>
        </div>
      </div>

      {/* Masonry grid */}
      <section className="bg-[#050508] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-sm text-slate-600">No apps match your search.</p>
          ) : (
            <motion.div
              key={`${domain}-${liveOnly}`}
              className="columns-1 gap-3 sm:columns-2 lg:columns-3"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {filtered.map((app) => (
                <motion.div
                  key={app.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <AppCard app={app} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: redesign portfolio page — cinematic hero, domain tabs, masonry grid with live/soon cards"
```

---

## Task 11: Update Global Background + Final Polish

**Files:**
- Modify: `src/App.tsx` — root div background colour

- [ ] **Step 1: Update root div in `App()`**

In the `App` function, change:

```tsx
// OLD
<div className="min-h-screen bg-[#0b0b0a] text-stone-100">

// NEW
<div className="min-h-screen bg-[#050508] text-slate-100">
```

- [ ] **Step 2: Verify dev server renders correctly**

```bash
npm run dev
```

Open http://localhost:5173 — confirm:
- Career page loads with particle canvas and typewriter
- Stats count up when scrolled into view
- Timeline items slide in from right
- Projects stagger in on scroll
- Skills tags stagger in with neon borders
- AI spotlight cards animate in
- Nav `Sateesh <g/>` branding correct
- Clicking "AI Portfolio" shows portfolio page
- Domain tabs slide highlight with Framer Motion
- Masonry grid renders, Live Only toggle works
- Search filters work

- [ ] **Step 3: Run full test suite and build**

```bash
npm test && npm run build
```

Expected: all tests pass, clean build.

- [ ] **Step 4: Final commit**

```bash
git add src/App.tsx
git commit -m "feat: finalize ultra-modern Cyber/Neon portfolio redesign — all sections complete"
```
