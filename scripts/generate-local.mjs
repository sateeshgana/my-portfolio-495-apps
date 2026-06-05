#!/usr/bin/env node
/**
 * generate-local.mjs
 *
 * Creates local app folders from the ai-tool-template for all coming-soon apps.
 *
 * Usage:
 *   node scripts/generate-local.mjs                  # all coming-soon apps
 *   node scripts/generate-local.mjs --domain food    # one domain only
 *
 * Output: c:\workspace\apps\{app-id}\
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { DOMAIN_INPUTS, deriveSystemPrompt } from './domain-inputs.mjs'

const __dir   = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dir, '..')
const TEMPLATE_DIR = 'c:\\workspace\\ai-tool-template'
const OUT_DIR      = 'c:\\workspace\\apps'

// ── Args ──────────────────────────────────────────────────────────────────────
const domainFilter = (() => {
  const idx = process.argv.indexOf('--domain')
  return idx !== -1 ? process.argv[idx + 1] : null
})()

// ── Load apps ─────────────────────────────────────────────────────────────────
const apps = JSON.parse(readFileSync(join(ROOT, 'src', 'apps.json'), 'utf8'))
const targets = apps.filter(a =>
  a.status === 'coming-soon' &&
  (!domainFilter || a.domain === domainFilter)
)

if (targets.length === 0) {
  console.log('No coming-soon apps found.')
  process.exit(0)
}

console.log(`Generating ${targets.length} apps into ${OUT_DIR}\\...\n`)
mkdirSync(OUT_DIR, { recursive: true })

// ── Build config.ts for an app ────────────────────────────────────────────────
function buildConfigTs(app) {
  const inputs  = DOMAIN_INPUTS[app.domain] ?? [
    { id: 'input', label: 'Your input', type: 'textarea', placeholder: 'Describe your question or task' },
  ]
  const inputsJson = JSON.stringify(inputs, null, 2)
    .split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')

  const accentMap = {
    food: 'emerald', travel: 'blue', health: 'rose', creative: 'violet',
    science: 'cyan', 'real-estate': 'orange', legal: 'blue', business: 'cyan',
    marketing: 'orange', 'dev-tools': 'violet', civic: 'emerald',
    finance: 'emerald', education: 'blue', productivity: 'cyan', hr: 'rose',
  }
  const accentColor = accentMap[app.domain] ?? 'cyan'
  const systemPrompt = deriveSystemPrompt(app.name, app.tagline)

  return `import type { AppConfig } from './types'

export const config: AppConfig = {
  name: ${JSON.stringify(app.name)},
  tagline: ${JSON.stringify(app.tagline)},
  systemPrompt: ${JSON.stringify(systemPrompt)},
  inputs: ${inputsJson},
  outputLabel: 'Result',
  accentColor: '${accentColor}',
}
`
}

// ── Copy template + inject config ─────────────────────────────────────────────
let created = 0
let skipped = 0

for (const app of targets) {
  const dest = join(OUT_DIR, app.id)

  if (existsSync(dest)) {
    console.log(`⟳  skip  ${app.id} (already exists)`)
    skipped++
    continue
  }

  // Copy template excluding node_modules, dist, .git
  cpSync(TEMPLATE_DIR, dest, {
    recursive: true,
    filter: (src) => {
      const rel = src.replace(TEMPLATE_DIR, '')
      return !rel.startsWith('\\node_modules') &&
             !rel.startsWith('\\dist') &&
             !rel.startsWith('\\.git')
    },
  })

  // Write custom config.ts
  writeFileSync(join(dest, 'src', 'config.ts'), buildConfigTs(app))

  console.log(`✓  ${app.name.padEnd(40)} → apps\\${app.id}`)
  created++
}

console.log(`\nDone. ${created} created, ${skipped} skipped.`)
console.log(`\nTo run any app locally:`)
console.log(`  cd c:\\workspace\\apps\\<app-id>`)
console.log(`  npm install`)
console.log(`  npm run dev`)
console.log(`\nTo deploy to Netlify: drag the folder to app.netlify.com/drop after running npm run build.`)
