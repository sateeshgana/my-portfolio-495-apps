import { useMemo, useState, useRef, useEffect } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GitBranch,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useParticles } from './hooks/useParticles'
import { useTypewriter } from './hooks/useTypewriter'
import { useCountUp } from './hooks/useCountUp'
import { AppCard } from './components/AppCard'
import { SupportWidget } from './components/SupportWidget'
import appsData from './apps.json'
import heroImage from './assets/hero.png'
import { DOMAINS } from './types'
import type { AppEntry, Domain } from './types'

type Page = 'career' | 'portfolio'

const apps = appsData as AppEntry[]
const featuredAppIds = ['promptlab', 'quizforge', 'privatedoc-ai']

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

const domainLabels: Record<Domain, string> = {
  all: 'All',
  productivity: 'Productivity',
  education: 'Education',
  health: 'Health',
  finance: 'Finance',
  legal: 'Legal',
  marketing: 'Marketing',
  'dev-tools': 'Dev tools',
  business: 'Business',
  creative: 'Creative',
  hr: 'HR',
  science: 'Science',
  'real-estate': 'Real estate',
  food: 'Food',
  travel: 'Travel',
  civic: 'Civic',
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
    <div className="min-h-screen bg-[#0b0b0a] text-stone-100">
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
    </main>
  )
}

function PortfolioPage() {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<Domain>('all')

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase()

    return apps.filter((app) => {
      const matchesDomain = domain === 'all' || app.domain === domain
      const matchesQuery = !normalizedQuery ||
        app.name.toLowerCase().includes(normalizedQuery) ||
        app.tagline.toLowerCase().includes(normalizedQuery) ||
        app.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      return matchesDomain && matchesQuery
    })
  }, [query, domain])

  const liveCount = apps.filter((app) => app.status === 'live').length
  const plannedCount = apps.length - liveCount
  const featuredApps = featuredAppIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is AppEntry => Boolean(app))

  return (
    <main>
      <header className="relative overflow-hidden border-b border-stone-800/80 bg-[linear-gradient(135deg,#0b0b0a_0%,#17130f_48%,#101715_100%)]">
        <section
          id="portfolio-top"
          className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]"
        >
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-lime-300/25 bg-lime-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-lime-100">
              <Sparkles size={14} />
              Builder of small, useful AI products
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-stone-50 sm:text-7xl lg:text-8xl">
              AI App Portfolio
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-stone-300 sm:text-2xl">
              A living portfolio of AI products, experiments, and practical tools built across work,
              learning, legal, finance, health, and developer workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#apps"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-lime-200"
              >
                View live apps
                <ArrowUpRight size={16} />
              </a>
              <a
                href="https://github.com/sateeshgana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-700 px-5 py-3 text-sm font-bold text-stone-200 transition-colors hover:border-stone-500 hover:bg-stone-900"
              >
                Browse source
                <GitBranch size={16} />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 top-6 h-24 border border-lime-300/20 bg-lime-300/5" />
            <div className="relative border border-stone-700 bg-stone-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <img
                src={heroImage}
                alt="Layered AI product stack"
                className="mx-auto aspect-square w-full max-w-[360px] object-contain"
              />
              <div className="grid grid-cols-3 gap-2 border-t border-stone-800 pt-4">
                <div>
                  <p className="text-3xl font-black text-lime-200">{liveCount}</p>
                  <p className="text-xs text-stone-500">Live apps</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-sky-200">{DOMAINS.length - 1}</p>
                  <p className="text-xs text-stone-500">Domains</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-orange-200">{plannedCount}</p>
                  <p className="text-xs text-stone-500">In pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="border-b border-stone-800 bg-stone-950 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-orange-200">Featured</p>
              <h2 className="mt-2 text-2xl font-black text-stone-100">Live products with teeth</h2>
            </div>
            <a href="#apps" className="hidden text-sm font-semibold text-lime-200 hover:text-lime-100 sm:inline-flex">
              Explore all
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredApps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-stone-800 bg-[#121210] p-5 transition-colors hover:border-lime-300/70"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="rounded-lg border border-stone-700 px-2 py-1 text-xs font-semibold text-stone-400">
                    {domainLabels[app.domain as Domain] ?? app.domain}
                  </span>
                  <ArrowUpRight size={17} className="text-stone-500 transition-colors group-hover:text-lime-200" />
                </div>
                <h3 className="text-xl font-black text-stone-100">{app.name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">{app.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="apps" aria-labelledby="apps-heading" className="bg-[#f4f1e8] px-5 py-8 text-stone-950 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-orange-700">Directory</p>
              <h2 id="apps-heading" className="mt-2 text-3xl font-black">Find the tool that fits the job.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_auto]">
              <label className="relative block">
                <span className="sr-only">Search apps</span>
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="search"
                  aria-label="Search apps"
                  placeholder="Search apps, domains, or tags"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 w-full rounded-lg border border-stone-300 bg-white pl-10 pr-4 text-sm text-stone-950 placeholder-stone-500 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-lime-300"
                />
              </label>
              <select
                aria-label="Filter by domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value as Domain)}
                className="h-12 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-lime-300"
              >
                {DOMAINS.map((domainName) => (
                  <option key={domainName} value={domainName}>{domainLabels[domainName]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {DOMAINS.slice(0, 8).map((domainName) => (
              <button
                key={domainName}
                onClick={() => setDomain(domainName)}
                className={clsx(
                  'rounded-lg border px-3 py-2 text-xs font-bold transition-colors',
                  domain === domainName
                    ? 'border-stone-950 bg-stone-950 text-lime-200'
                    : 'border-stone-300 bg-white text-stone-600 hover:border-stone-950 hover:text-stone-950',
                )}
              >
                {domainLabels[domainName]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-stone-300 bg-white px-6 py-16 text-center text-stone-600">
              No apps match your search.{' '}
              <button onClick={() => { setQuery(''); setDomain('all') }} className="font-bold text-stone-950 underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm font-semibold text-stone-500">
                Showing {filtered.length} app{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </>
          )}
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
