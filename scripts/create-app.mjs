#!/usr/bin/env node
/**
 * create-app.mjs
 *
 * Single app:
 *   node scripts/create-app.mjs \
 *     --name "Recipe Generator AI" \
 *     --tagline "Create recipes from ingredients" \
 *     --prompt "You are a creative chef..." \
 *     --input "ingredients:textarea:Your ingredients" \
 *     --output "Your Recipe" \
 *     --color emerald \
 *     --domain food
 *
 * Batch:
 *   node scripts/create-app.mjs --batch --domain food
 *   node scripts/create-app.mjs --batch --all
 */

import { readFileSync, writeFileSync, appendFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRepoFromTemplate, upsertFile, isRepoNameAvailable } from './github.mjs'
import { createSite, setSiteEnvVar, triggerDeploy, waitForDeploy } from './netlify-api.mjs'
import { DOMAIN_INPUTS, deriveSystemPrompt } from './domain-inputs.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = join(__dir, '..')

// ── Load env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dir, '.env.cli')
  try {
    const raw = readFileSync(envPath, 'utf8')
    const env = {}
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      env[key.trim()] = rest.join('=').trim()
    }
    return env
  } catch {
    console.error('❌  scripts/.env.cli not found. Copy scripts/.env.cli.example and fill in your tokens.')
    process.exit(1)
  }
}

// ── Parse CLI args ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {}
  const inputs = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--batch') { args.batch = true; continue }
    if (arg === '--all')   { args.all   = true; continue }
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const val = argv[i + 1]
      if (key === 'input') {
        const [id, type, ...labelParts] = val.split(':')
        inputs.push({ id, type: type ?? 'text', label: labelParts.join(':') })
      } else {
        args[key] = val
      }
      i++
    }
  }
  if (inputs.length) args.inputs = inputs
  return args
}

// ── Build config.ts file content ──────────────────────────────────────────────
function buildConfigTs(app) {
  const inputsJson = JSON.stringify(app.inputs, null, 2)
    .split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')

  return `import type { AppConfig } from './types'

export const config: AppConfig = {
  name: ${JSON.stringify(app.name)},
  tagline: ${JSON.stringify(app.tagline)},
  systemPrompt: ${JSON.stringify(app.systemPrompt)},
  inputs: ${inputsJson},
  outputLabel: ${JSON.stringify(app.outputLabel ?? 'Result')},
  accentColor: ${JSON.stringify(app.accentColor ?? 'cyan')},
}
`
}

// ── Slug helper ───────────────────────────────────────────────────────────────
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Log helper ────────────────────────────────────────────────────────────────
const LOG_PATH = join(__dir, 'create-app.log')

function log(line) {
  const entry = `${new Date().toISOString()} ${line}\n`
  process.stdout.write(line + '\n')
  appendFileSync(LOG_PATH, entry)
}

// ── Create one app ────────────────────────────────────────────────────────────
async function createApp(env, appDef) {
  const { GITHUB_TOKEN, NETLIFY_TOKEN, GROQ_API_KEY, GITHUB_USERNAME, TEMPLATE_REPO } = env
  const [templateOwner, templateRepo] = TEMPLATE_REPO.split('/')

  let repoName = toSlug(appDef.name)
  if (!(await isRepoNameAvailable(GITHUB_TOKEN, GITHUB_USERNAME, repoName))) {
    repoName = repoName + '-app'
    if (!(await isRepoNameAvailable(GITHUB_TOKEN, GITHUB_USERNAME, repoName))) {
      throw new Error(`Repo name conflict: ${repoName} already exists`)
    }
  }

  log(`→ Creating GitHub repo: ${repoName}`)
  await createRepoFromTemplate(GITHUB_TOKEN, templateOwner, templateRepo, repoName, appDef.tagline)

  // Wait for GitHub to finish initialising the repo
  await new Promise(r => setTimeout(r, 3_000))

  log(`→ Injecting config.ts`)
  await upsertFile(
    GITHUB_TOKEN, GITHUB_USERNAME, repoName,
    'src/config.ts', buildConfigTs(appDef),
    `feat: configure ${appDef.name}`
  )

  log(`→ Creating Netlify site`)
  const site = await createSite(NETLIFY_TOKEN, GITHUB_USERNAME, repoName, repoName)

  log(`→ Setting env vars`)
  await setSiteEnvVar(NETLIFY_TOKEN, site.id, 'GROQ_API_KEY',   GROQ_API_KEY)
  await setSiteEnvVar(NETLIFY_TOKEN, site.id, 'SYSTEM_PROMPT',  appDef.systemPrompt)

  log(`→ Triggering deploy`)
  await triggerDeploy(NETLIFY_TOKEN, site.id)

  log(`→ Waiting for deploy (up to 3 min)…`)
  await waitForDeploy(NETLIFY_TOKEN, site.id)

  const url = `https://${repoName}.netlify.app`
  log(`✓ ${appDef.name} → ${url}`)
  return url
}

// ── Update apps.json ──────────────────────────────────────────────────────────
function updateAppsJson(appId, url) {
  const appsPath = join(ROOT, 'src', 'apps.json')
  const apps = JSON.parse(readFileSync(appsPath, 'utf8'))
  const idx = apps.findIndex(a => a.id === appId)
  if (idx !== -1) {
    apps[idx].status = 'live'
    apps[idx].url    = url
    writeFileSync(appsPath, JSON.stringify(apps, null, 2))
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
const env  = loadEnv()
const args = parseArgs(process.argv.slice(2))

if (args.batch) {
  const appsPath = join(ROOT, 'src', 'apps.json')
  const apps = JSON.parse(readFileSync(appsPath, 'utf8'))
  const targets = apps.filter(a =>
    a.status === 'coming-soon' &&
    (args.all || a.domain === args.domain)
  )

  if (targets.length === 0) {
    console.log('No coming-soon apps found for the specified domain.')
    process.exit(0)
  }

  log(`Starting batch: ${targets.length} apps`)

  for (const app of targets) {
    const inputs = DOMAIN_INPUTS[app.domain] ?? [
      { id: 'input', label: 'Your input', type: 'textarea', placeholder: 'Describe your question or task' },
    ]
    const appDef = {
      name:         app.name,
      tagline:      app.tagline,
      systemPrompt: deriveSystemPrompt(app.name, app.tagline),
      inputs,
      outputLabel:  'Result',
      accentColor:  'cyan',
    }

    try {
      const url = await createApp(env, appDef)
      updateAppsJson(app.id, url)
    } catch (err) {
      log(`✗ ${app.name}: ${err.message}`)
      const apps2 = JSON.parse(readFileSync(appsPath, 'utf8'))
      const idx = apps2.findIndex(a => a.id === app.id)
      if (idx !== -1) {
        apps2[idx].status = 'wip'
        writeFileSync(appsPath, JSON.stringify(apps2, null, 2))
      }
    }

    await new Promise(r => setTimeout(r, 2_000))
  }

  log('Batch complete. Review scripts/create-app.log for details.')

} else {
  if (!args.name || !args.prompt) {
    console.error('Usage: node scripts/create-app.mjs --name "App Name" --tagline "..." --prompt "..." [--input "id:type:label"] [--output "Label"] [--color cyan] [--domain food]')
    process.exit(1)
  }

  const appDef = {
    name:         args.name,
    tagline:      args.tagline ?? '',
    systemPrompt: args.prompt,
    inputs:       args.inputs ?? [{ id: 'input', label: 'Your input', type: 'textarea' }],
    outputLabel:  args.output ?? 'Result',
    accentColor:  args.color  ?? 'cyan',
  }

  try {
    await createApp(env, appDef)
  } catch (err) {
    log(`✗ Failed: ${err.message}`)
    process.exit(1)
  }
}
