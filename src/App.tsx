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
