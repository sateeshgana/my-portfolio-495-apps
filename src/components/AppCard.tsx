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
