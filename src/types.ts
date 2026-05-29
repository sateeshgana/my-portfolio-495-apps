export interface AppEntry {
  id: string
  name: string
  tagline: string
  domain: string
  url: string
  github: string
  tags: string[]
  status: 'live' | 'coming-soon' | 'wip'
}

export const DOMAINS = [
  'all',
  'productivity',
  'education',
  'health',
  'finance',
  'legal',
  'marketing',
  'dev-tools',
  'business',
  'creative',
  'hr',
  'science',
  'real-estate',
  'food',
  'travel',
  'civic',
] as const

export type Domain = (typeof DOMAINS)[number]
