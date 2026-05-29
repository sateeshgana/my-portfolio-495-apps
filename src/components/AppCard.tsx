import { ExternalLink, GitBranch } from 'lucide-react'
import { clsx } from 'clsx'
import type { AppEntry } from '../types'

const DOMAIN_COLORS: Record<string, string> = {
  productivity:  'bg-blue-900/40 text-blue-300 border-blue-800',
  education:     'bg-green-900/40 text-green-300 border-green-800',
  health:        'bg-emerald-900/40 text-emerald-300 border-emerald-800',
  finance:       'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  legal:         'bg-orange-900/40 text-orange-300 border-orange-800',
  marketing:     'bg-purple-900/40 text-purple-300 border-purple-800',
  'dev-tools':   'bg-cyan-900/40 text-cyan-300 border-cyan-800',
  business:      'bg-indigo-900/40 text-indigo-300 border-indigo-800',
  creative:      'bg-pink-900/40 text-pink-300 border-pink-800',
  hr:            'bg-rose-900/40 text-rose-300 border-rose-800',
  science:       'bg-teal-900/40 text-teal-300 border-teal-800',
  'real-estate': 'bg-amber-900/40 text-amber-300 border-amber-800',
  food:          'bg-lime-900/40 text-lime-300 border-lime-800',
  travel:        'bg-sky-900/40 text-sky-300 border-sky-800',
  civic:         'bg-violet-900/40 text-violet-300 border-violet-800',
}

interface Props {
  app: AppEntry
}

export function AppCard({ app }: Props) {
  const domainColor = DOMAIN_COLORS[app.domain] ?? 'bg-gray-800 text-gray-300 border-gray-700'

  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-600 transition-colors">
      {/* Domain badge */}
      <span className={clsx('self-start text-xs px-2 py-0.5 rounded-full border mb-3', domainColor)}>
        {app.domain}
      </span>

      {/* Name + tagline */}
      <h3 className="font-semibold text-gray-100 text-base leading-snug">{app.name}</h3>
      <p className="mt-1 text-sm text-gray-400 flex-1">{app.tagline}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {app.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink size={12} /> Live app
        </a>
        <a
          href={app.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <GitBranch size={12} /> GitHub
        </a>
        {app.status === 'coming-soon' && (
          <span className="ml-auto text-xs text-gray-600">Coming soon</span>
        )}
      </div>
    </div>
  )
}
