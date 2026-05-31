import { useState, useMemo } from 'react'
import { Search, Layers } from 'lucide-react'
import { clsx } from 'clsx'
import { AppCard } from './components/AppCard'
import appsData from './apps.json'
import { DOMAINS } from './types'
import type { AppEntry, Domain } from './types'

const apps = appsData as AppEntry[]

export default function App() {
  const [query,  setQuery]  = useState('')
  const [domain, setDomain] = useState<Domain>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return apps.filter((app) => {
      const matchesDomain = domain === 'all' || app.domain === domain
      const matchesQuery  = !q ||
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.tags.some((t) => t.includes(q))
      return matchesDomain && matchesQuery
    })
  }, [query, domain])

  const liveCount = apps.filter((a) => a.status === 'live').length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Layers size={28} className="text-cyan-400" />
          <h1 className="text-3xl font-bold">AI App Portfolio</h1>
        </div>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          {liveCount} AI-powered tools solving real problems — built by{' '}
          <a href="https://github.com/sateeshgana" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
            @sateeshgana
          </a>. Open source. Free to use.
        </p>
        <p className="text-gray-600 text-xs mt-1">Building toward 500+ apps across 15 domains.</p>
      </header>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search apps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {/* Domain filter */}
          <div className="flex gap-1.5 flex-wrap">
            {DOMAINS.slice(0, 8).map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  domain === d
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200',
                )}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
            <select
              value={DOMAINS.slice(8).includes(domain as typeof DOMAINS[number]) ? domain : ''}
              onChange={(e) => setDomain(e.target.value as Domain)}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">More…</option>
              {DOMAINS.slice(8).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            No apps match your search.{' '}
            <button onClick={() => { setQuery(''); setDomain('all') }} className="text-cyan-500 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-4">{filtered.length} app{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer / HubSpot contact */}
      <footer className="border-t border-gray-800 px-6 py-12 text-center">
        <p className="text-gray-500 text-sm mb-6">
          Want to collaborate, give feedback, or hire me?
        </p>
        <div id="hubspot-form-container" className="max-w-md mx-auto" />
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.hbspt) {
            hbspt.forms.create({
              portalId: window.__HUBSPOT_PORTAL_ID__ || '',
              formId: window.__HUBSPOT_FORM_ID__ || '',
              target: '#hubspot-form-container',
            });
          }
        `}} />
        <p className="text-gray-700 text-xs mt-8">
          Built with React + Vite + Tailwind CSS + Groq + Transformers.js
        </p>
      </footer>
    </div>
  )
}
