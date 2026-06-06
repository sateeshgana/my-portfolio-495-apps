import { useMemo, useState, useRef, useEffect } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GitBranch,
  Search,
  UserRound,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParticles } from './hooks/useParticles'
import { useTypewriter } from './hooks/useTypewriter'
import { useCountUp } from './hooks/useCountUp'
import { AppCard } from './components/AppCard'
import { SupportWidget } from './components/SupportWidget'
import appsData from './apps.json'
import type { AppEntry } from './types'

type Page = 'career' | 'portfolio'

const apps = appsData as AppEntry[]

const careerHighlights = [
  'AI product builder focused on practical tools and automation',
  'Hands-on full-stack development with React, TypeScript, Vite, and serverless APIs',
  'Portfolio-first execution across productivity, education, legal, finance, and dev-tools',
]

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




const liveCount = apps.filter((a) => a.status === 'live').length
const soonCount = apps.length - liveCount

const heroContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
const heroHeadingVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
}
const gridContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const gridItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

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

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
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

function TypewriterText() {
  const text = useTypewriter(TYPEWRITER_ROLES, 55)
  return (
    <span>
      {text}
      <span className="cursor-blink ml-0.5 text-indigo-400">▍</span>
    </span>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('career')

  return (
    <div className="min-h-screen bg-[#050508] text-stone-100">
      <SiteNav page={page} setPage={setPage} />
      {page === 'career' ? <CareerPage setPage={setPage} /> : <PortfolioPage />}
      <SiteFooter />
      <SupportWidget />
    </div>
  )
}

interface SiteNavProps {
  page: Page
  setPage: (page: Page) => void
}

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

// ── Skill bubble data ──────────────────────────────────────────────────────
const SKILL_BUBBLES: { label: string; size: number; color: string; border: string; glow: string; bg: string }[] = [
  // Frontend — indigo
  { label: 'Angular',      size: 110, color: '#818cf8', border: 'rgba(99,102,241,0.5)',   glow: 'rgba(99,102,241,0.35)',  bg: 'rgba(99,102,241,0.07)' },
  { label: 'React',        size: 90,  color: '#818cf8', border: 'rgba(99,102,241,0.4)',   glow: 'rgba(99,102,241,0.25)',  bg: 'rgba(99,102,241,0.05)' },
  { label: 'TypeScript',   size: 100, color: '#818cf8', border: 'rgba(99,102,241,0.45)',  glow: 'rgba(99,102,241,0.3)',   bg: 'rgba(99,102,241,0.06)' },
  { label: 'Vue.js',       size: 78,  color: '#818cf8', border: 'rgba(99,102,241,0.35)',  glow: 'rgba(99,102,241,0.2)',   bg: 'rgba(99,102,241,0.04)' },
  { label: 'Tailwind CSS', size: 88,  color: '#818cf8', border: 'rgba(99,102,241,0.4)',   glow: 'rgba(99,102,241,0.22)',  bg: 'rgba(99,102,241,0.05)' },
  { label: 'Electron JS',  size: 72,  color: '#818cf8', border: 'rgba(99,102,241,0.3)',   glow: 'rgba(99,102,241,0.18)',  bg: 'rgba(99,102,241,0.04)' },
  // AI / LLM — violet
  { label: 'Claude API',   size: 115, color: '#c4b5fd', border: 'rgba(167,139,250,0.55)', glow: 'rgba(167,139,250,0.4)',  bg: 'rgba(167,139,250,0.08)' },
  { label: 'Multi-agent',  size: 96,  color: '#c4b5fd', border: 'rgba(167,139,250,0.45)', glow: 'rgba(167,139,250,0.3)',  bg: 'rgba(167,139,250,0.06)' },
  { label: 'Prompt Eng.',  size: 86,  color: '#c4b5fd', border: 'rgba(167,139,250,0.4)',  glow: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.05)' },
  { label: 'LangChain',    size: 80,  color: '#c4b5fd', border: 'rgba(167,139,250,0.35)', glow: 'rgba(167,139,250,0.2)',  bg: 'rgba(167,139,250,0.04)' },
  { label: 'Cursor AI',    size: 74,  color: '#c4b5fd', border: 'rgba(167,139,250,0.3)',  glow: 'rgba(167,139,250,0.18)', bg: 'rgba(167,139,250,0.04)' },
  { label: 'Copilot',      size: 70,  color: '#c4b5fd', border: 'rgba(167,139,250,0.28)', glow: 'rgba(167,139,250,0.15)', bg: 'rgba(167,139,250,0.03)' },
  // Data Viz — sky
  { label: 'D3.js',        size: 100, color: '#38bdf8', border: 'rgba(56,189,248,0.5)',   glow: 'rgba(56,189,248,0.35)',  bg: 'rgba(56,189,248,0.07)' },
  { label: 'HighCharts',   size: 84,  color: '#38bdf8', border: 'rgba(56,189,248,0.4)',   glow: 'rgba(56,189,248,0.25)',  bg: 'rgba(56,189,248,0.05)' },
  { label: 'Chart.js',     size: 76,  color: '#38bdf8', border: 'rgba(56,189,248,0.35)',  glow: 'rgba(56,189,248,0.2)',   bg: 'rgba(56,189,248,0.04)' },
  { label: 'AG Grid',      size: 80,  color: '#38bdf8', border: 'rgba(56,189,248,0.38)',  glow: 'rgba(56,189,248,0.22)',  bg: 'rgba(56,189,248,0.04)' },
  { label: 'Custom SVG',   size: 68,  color: '#38bdf8', border: 'rgba(56,189,248,0.28)',  glow: 'rgba(56,189,248,0.15)',  bg: 'rgba(56,189,248,0.03)' },
  // Cloud / DevOps — emerald
  { label: 'Azure',        size: 105, color: '#34d399', border: 'rgba(52,211,153,0.5)',   glow: 'rgba(52,211,153,0.35)',  bg: 'rgba(52,211,153,0.07)' },
  { label: 'AWS',          size: 88,  color: '#34d399', border: 'rgba(52,211,153,0.42)',  glow: 'rgba(52,211,153,0.28)',  bg: 'rgba(52,211,153,0.05)' },
  { label: 'GCP',          size: 76,  color: '#34d399', border: 'rgba(52,211,153,0.36)',  glow: 'rgba(52,211,153,0.22)',  bg: 'rgba(52,211,153,0.04)' },
  { label: 'Docker',       size: 82,  color: '#34d399', border: 'rgba(52,211,153,0.4)',   glow: 'rgba(52,211,153,0.25)',  bg: 'rgba(52,211,153,0.05)' },
  { label: 'Azure DevOps', size: 94,  color: '#34d399', border: 'rgba(52,211,153,0.45)',  glow: 'rgba(52,211,153,0.3)',   bg: 'rgba(52,211,153,0.06)' },
  { label: 'MSAL / AD',    size: 72,  color: '#34d399', border: 'rgba(52,211,153,0.3)',   glow: 'rgba(52,211,153,0.18)',  bg: 'rgba(52,211,153,0.04)' },
]

function SkillBubble({ b, i }: { b: typeof SKILL_BUBBLES[number]; i: number }) {
  const yRange = 14 + (i % 3) * 4
  const duration = 3.8 + (i % 5) * 0.5
  const rotate = i % 2 === 0 ? [0, 1.5, -1, 0] : [0, -1.5, 1, 0]
  const verticalOffset = [0, 20, -10, 30, 5, -20, 15, -5][i % 8]

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.3, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 16, delay: i * 0.04 } },
      }}
      animate={{ y: [0, -yRange, 0], rotate }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
      style={{ alignSelf: 'center', marginTop: verticalOffset }}
    >
      <motion.div
        whileHover={{
          scale: 1.22,
          boxShadow: `0 0 40px ${b.glow.replace('0.35', '0.7').replace('0.3', '0.65').replace('0.25', '0.6')}, 0 0 80px ${b.glow.replace('0.35', '0.3').replace('0.3', '0.25').replace('0.25', '0.2')}, inset 0 0 30px ${b.glow.replace('0.35', '0.15')}`,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="skill-bubble"
        style={{
          width: b.size,
          height: b.size,
          fontSize: b.size > 105 ? 12 : b.size > 88 ? 11 : b.size > 75 ? 10 : 9,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: b.color,
          background: `radial-gradient(circle at 35% 35%, ${b.glow.replace(/[\d.]+\)$/, '0.18)')}, ${b.bg})`,
          border: `1px solid ${b.border}`,
          boxShadow: `0 0 20px ${b.glow}, 0 0 50px ${b.glow.replace(/[\d.]+\)$/, '0.1)')}, inset 0 0 20px ${b.glow.replace(/[\d.]+\)$/, '0.08)')}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* glass shine arc */}
        <span
          style={{
            position: 'absolute',
            top: '12%',
            left: '15%',
            width: '45%',
            height: '30%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${b.color}22 0%, transparent 70%)`,
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />
        <span style={{ position: 'relative', zIndex: 1 }}>{b.label}</span>
      </motion.div>
    </motion.div>
  )
}

// ── Domain expertise data ─────────────────────────────────────────────────
const DOMAINS = [
  {
    name: 'Life Sciences & HealthTech',
    years: '11+',
    accent: '#818cf8',
    glow: 'rgba(99,102,241,0.35)',
    border: 'rgba(99,102,241,0.3)',
    bg: 'rgba(99,102,241,0.05)',
    icon: '🧬',
    highlights: [
      'Clinical trial data platforms & outcome databases',
      'Genetics tracking & visualization (GViz, GTrack)',
      'Regulatory-grade reporting systems',
      'AI-powered clinical data extraction (Claude API)',
    ],
    clients: 'Excelra · Global pharma & biotech clients',
    tag: 'Primary Domain',
    tagColor: '#818cf8',
  },
  {
    name: 'E-Commerce & Retail',
    years: '5+',
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    border: 'rgba(52,211,153,0.25)',
    bg: 'rgba(52,211,153,0.04)',
    icon: '🛒',
    highlights: [
      'Product catalog & inventory management UIs',
      'Order management & fulfillment dashboards',
      'Customer analytics & conversion funnels',
      'Headless commerce front-ends (React / Angular)',
    ],
    clients: 'Mid-market retail & D2C brands',
    tag: 'Secondary Domain',
    tagColor: '#34d399',
  },
  {
    name: 'Tech & Engineering',
    years: '13+',
    accent: '#c4b5fd',
    glow: 'rgba(167,139,250,0.3)',
    border: 'rgba(167,139,250,0.25)',
    bg: 'rgba(167,139,250,0.04)',
    icon: '⚙️',
    highlights: [
      'Enterprise SaaS portals & internal tooling',
      'Data visualisation platforms (D3.js, HighCharts)',
      'Multi-agent AI pipelines & developer tooling',
      '352+ micro-apps shipped with Claude Code',
    ],
    clients: 'CG Mines · Excelra · Independent projects',
    tag: 'Core Expertise',
    tagColor: '#c4b5fd',
  },
]

function DomainExpertise() {
  return (
    <section className="relative overflow-hidden bg-[#080810] px-5 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div style={{ position: 'absolute', top: 0, left: '30%', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.06), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: 400, height: 300, background: 'radial-gradient(ellipse, rgba(52,211,153,0.05), transparent 70%)' }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Industry Focus</p>
          <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Domain Expertise</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-500">13 years building products across three industries — from regulated life-sciences platforms to high-velocity e-commerce and developer tooling.</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden"
              style={{
                background: d.bg,
                border: `1px solid ${d.border}`,
                boxShadow: `0 0 30px ${d.glow.replace('0.3', '0.08')}, 0 0 0 0 ${d.glow}`,
                padding: '28px 24px 24px',
              }}
            >
              {/* hover glow sweep */}
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${d.glow.replace('0.3', '0.12')}, transparent 70%)` }}
              />

              {/* top-right glow orb */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: d.accent }} />

              {/* tag */}
              <span className="mb-4 inline-block text-[8px] font-black uppercase tracking-[3px]" style={{ color: d.tagColor }}>
                {d.tag}
              </span>

              {/* icon + years */}
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl leading-none">{d.icon}</span>
                <div className="text-right">
                  <div className="text-3xl font-black leading-none" style={{ color: d.accent, textShadow: `0 0 20px ${d.glow}` }}>
                    {d.years}
                  </div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">yrs</div>
                </div>
              </div>

              {/* name */}
              <h3 className="mb-5 text-base font-black leading-tight text-slate-100">{d.name}</h3>

              {/* highlights */}
              <ul className="mb-6 space-y-2">
                {d.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-400">
                    <span className="mt-0.5 shrink-0 text-[6px]" style={{ color: d.accent }}>◆</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* clients */}
              <div className="border-t pt-4" style={{ borderColor: d.border }}>
                <p className="text-[9px] uppercase tracking-widest text-slate-600">{d.clients}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillBubbles() {
  return (
    <section className="relative overflow-hidden bg-[#050508] px-5 py-24 sm:px-8">
      {/* ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(52,211,153,0.05), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(167,139,250,0.04), transparent 70%)', transform: 'translate(-50%,-50%)' }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Capabilities</p>
          <h2 className="mt-2 text-3xl font-black text-slate-100 sm:text-4xl">Core Skills</h2>
          <div className="mt-5 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-indigo-400"><span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />Frontend</span>
            <span className="flex items-center gap-1.5 text-violet-400"><span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />AI / LLM</span>
            <span className="flex items-center gap-1.5 text-sky-400"><span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />Data Viz</span>
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />Cloud / DevOps</span>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, visible: {} }}
        >
          {SKILL_BUBBLES.map((b, i) => (
            <SkillBubble key={b.label} b={b} i={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CareerPage({ setPage }: Pick<SiteNavProps, 'setPage'>) {
  return (
    <main>
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
                <>
                  <div
                    key={`dot-${item.period}`}
                    className="size-3 flex-shrink-0 rounded-full"
                    style={{
                      background: item.current ? '#6366f1' : i < 2 ? '#4f46e5' : '#1e1b4b',
                      boxShadow: item.current ? '0 0 14px rgba(99,102,241,0.8)' : 'none',
                    }}
                  />
                  {i < employmentHistory.length - 1 && (
                    <div key={`line-${item.period}`} className="w-px flex-1 my-1" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(99,102,241,0.05))', minHeight: '60px' }} />
                  )}
                </>
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
      <SkillBubbles />

      {/* Domain Expertise */}
      <DomainExpertise />

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
    </main>
  )
}

function PortfolioPage() {
  const [selectedDomain, setSelectedDomain] = useState('All')
  const [search, setSearch] = useState('')
  const [liveOnly, setLiveOnly] = useState(false)

  const domains = useMemo(() => {
    const unique = Array.from(new Set(apps.map((a) => a.domain))).sort()
    return unique
  }, [])

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { All: apps.length }
    for (const d of domains) {
      counts[d] = apps.filter((a) => a.domain === d).length
    }
    return counts
  }, [domains])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return apps.filter((app) => {
      const matchDomain = selectedDomain === 'All' || app.domain === selectedDomain
      const matchSearch = !search ||
        app.name.toLowerCase().includes(q) ||
        (app.tagline || '').toLowerCase().includes(q)
      const matchLive = !liveOnly || app.status === 'live'
      return matchDomain && matchSearch && matchLive
    })
  }, [selectedDomain, search, liveOnly])

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[60vh] overflow-hidden bg-[#050508]">
        <ParticleCanvas />
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)' }} />

        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl flex-col items-start justify-center px-5 py-20 sm:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={heroContainerVariants}
          >
            {/* Badge */}
            <motion.div
              variants={heroItemVariants}
              className="mb-6 inline-flex items-center gap-2"
            >
              <span className="h-px w-8 bg-indigo-500/60" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                Builder of small, useful AI products
              </span>
              <span className="h-px w-8 bg-indigo-500/60" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={heroHeadingVariants}
              className="text-6xl font-black leading-none tracking-tight text-white sm:text-7xl lg:text-8xl"
            >
              AI App{' '}
              <span style={{ color: '#818cf8', textShadow: '0 0 30px rgba(129,140,248,0.6)' }}>
                Portfolio
              </span>
            </motion.h1>

            {/* Stat line */}
            <motion.p
              variants={heroItemVariants}
              className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">●</span>
                <span className="text-emerald-400">{liveCount} live</span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-400">◌</span>
                <span className="text-indigo-400">{soonCount} soon</span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-indigo-300">{domains.length} domains</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={heroItemVariants}
              className="mt-8 flex flex-wrap gap-3"
            >
              <motion.a
                href="#app-grid"
                className="inline-flex items-center gap-2 bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
                whileHover={{ boxShadow: '0 0 32px rgba(99,102,241,0.8)' }}
                whileTap={{ scale: 0.97 }}
              >
                View Live Apps ↓
              </motion.a>
              <motion.a
                href="https://github.com/sateeshgana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-indigo-500/50 px-5 py-3 text-sm font-bold text-indigo-300 transition-colors hover:border-indigo-400 hover:text-indigo-200"
                whileTap={{ scale: 0.97 }}
              >
                GitHub →
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Domain Tab Bar */}
      <div className="sticky top-[73px] z-20 border-y border-indigo-500/15 bg-[#080810]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {['All', ...domains].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDomain(d)}
                aria-pressed={selectedDomain === d}
                className={`relative px-3 py-1.5 text-[9px] font-black tracking-widest uppercase whitespace-nowrap transition-colors ${
                  selectedDomain === d ? 'text-white' : 'border border-indigo-500/25 text-indigo-400 hover:text-indigo-200'
                }`}
              >
                {selectedDomain === d && (
                  <motion.span
                    layoutId="domainTab"
                    className="absolute inset-0 bg-indigo-600"
                    style={{ boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{d} <span className="opacity-60">({domainCounts[d] ?? 0})</span></span>
              </button>
            ))}
          </div>

          {/* Search + Live Only */}
          <div className="flex items-center gap-3 pb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="search"
                aria-label="Search apps"
                placeholder="Search apps…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full bg-[#0a0a12] border border-indigo-500/25 pl-9 pr-4 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/60"
              />
            </div>
            <button
              type="button"
              onClick={() => setLiveOnly((v) => !v)}
              aria-pressed={liveOnly}
              className={`h-9 whitespace-nowrap px-4 text-[9px] font-black tracking-widest uppercase transition-colors ${
                liveOnly ? 'bg-indigo-600 text-white' : 'border border-indigo-500/20 text-indigo-400 hover:text-indigo-200'
              }`}
            >
              Live Only
            </button>
          </div>
        </div>
      </div>

      {/* App Grid */}
      <section id="app-grid" className="bg-[#050508] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDomain + String(liveOnly) + search}
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="columns-1 sm:columns-2 lg:columns-3 gap-x-3"
            >
              {filtered.map((app) => (
                <motion.div
                  key={app.id}
                  variants={gridItemVariants}
                  className="break-inside-avoid mb-3"
                >
                  <AppCard app={app} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-widest text-slate-700">
            Showing {filtered.length} of {apps.length} apps
          </p>
        </div>
      </section>
    </main>
  )
}

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
