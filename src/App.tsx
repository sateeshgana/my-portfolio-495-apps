import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GitBranch,
  GraduationCap,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
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
    role: 'Product and AI Engineering',
    company: 'Current focus',
    period: 'Now',
    detail: 'Building a growing portfolio of AI-powered web apps, reusable templates, and production-ready experiments.',
  },
  {
    role: 'Professional Experience',
    company: 'Resume details coming soon',
    period: 'To update',
    detail: 'Employment history, responsibilities, achievements, and domain experience will be filled from your resume and LinkedIn.',
  },
  {
    role: 'Career Direction',
    company: 'Open to collaboration',
    period: 'Ongoing',
    detail: 'Interested in practical AI products, automation workflows, frontend engineering, and business-facing tools.',
  },
]

const skills = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'AI apps',
  'LLM integrations',
  'Netlify Functions',
  'Product thinking',
  'Automation',
  'GitHub workflows',
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
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b0b0a_0%,#17130f_48%,#101715_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-orange-300/25 bg-orange-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-orange-100">
              <BriefcaseBusiness size={14} />
              Profession, career story, employment history, and skills
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-stone-50 sm:text-7xl lg:text-8xl">
              Sateesh Gana
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-stone-300 sm:text-2xl">
              AI product builder and full-stack developer creating practical tools, automation workflows,
              and portfolio-grade web apps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPage('portfolio')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-lime-200"
              >
                View AI portfolio
                <ArrowUpRight size={16} />
              </button>
              <a
                href="https://www.linkedin.com/in/sateesh-ganaparapu-19875257/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-700 px-5 py-3 text-sm font-bold text-stone-200 transition-colors hover:border-sky-300 hover:text-sky-200"
              >
                LinkedIn profile
                <UserRound size={16} />
              </a>
            </div>
          </div>

          <div className="border border-stone-700 bg-stone-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
            <p className="mb-5 text-xs font-semibold uppercase tracking-normal text-lime-200">Career snapshot</p>
            <div className="space-y-4">
              {careerHighlights.map((highlight) => (
                <div key={highlight} className="rounded-lg border border-stone-800 bg-[#121210] p-4">
                  <p className="text-sm leading-6 text-stone-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1e8] px-5 py-12 text-stone-950 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-orange-700">Employment</p>
            <h2 className="mt-2 text-3xl font-black">Career and employment</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
              This section is ready for your LinkedIn and resume details. Once you share them,
              I will replace these placeholders with your exact roles, companies, dates, and achievements.
            </p>
          </div>
          <div className="space-y-4">
            {employmentHistory.map((item) => (
              <article key={`${item.role}-${item.company}`} className="rounded-lg border border-stone-300 bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-950">{item.role}</h3>
                    <p className="mt-1 text-sm font-bold text-stone-500">{item.company}</p>
                  </div>
                  <span className="self-start rounded-lg bg-stone-950 px-2 py-1 text-xs font-bold text-lime-200">
                    {item.period}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-800 bg-stone-950 px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-lime-200">Capabilities</p>
              <h2 className="mt-2 text-3xl font-black text-stone-100">Core skills</h2>
            </div>
            <GraduationCap className="hidden text-orange-200 sm:block" size={34} />
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-stone-700 bg-[#121210] px-3 py-2 text-sm font-bold text-stone-200">
                {skill}
              </span>
            ))}
          </div>
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
