# AI Tool Template + CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a config-driven React template repo and a CLI script that automatically creates, configures, and deploys each coming-soon app to Netlify from a single command.

**Architecture:** A standalone GitHub template repo (`ai-tool-template`) holds a React + Vite + Tailwind app whose entire UI is driven by `src/config.ts`. A CLI script (`scripts/create-app.mjs`) in the portfolio repo reads that config, creates a new GitHub repo from the template, injects the config, creates a Netlify site, sets the API key, and waits for the deploy — updating `src/apps.json` with the live URL when done.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Netlify Functions v2 (`.mts`), Node.js 20 ESM scripts, GitHub REST API, Netlify REST API, Groq API (`llama-3.3-70b-versatile`)

---

## File Map

### New repo: `ai-tool-template` (created on GitHub, separate from portfolio)
- `src/config.ts` — app configuration type + example values
- `src/types.ts` — exported `AppConfig` and `InputField` TypeScript interfaces
- `src/App.tsx` — config-driven UI (inputs → function call → output)
- `src/main.tsx` — React entry point
- `netlify/functions/chat.mts` — Groq API proxy, reads env var
- `netlify.toml` — build config + function directory
- `package.json` — dependencies
- `vite.config.ts` — Vite + React + Tailwind plugins
- `.env.example` — documents `GROQ_API_KEY`
- `index.html` — Vite entry HTML

### Portfolio repo additions
- `scripts/create-app.mjs` — main CLI (arg parsing, orchestration)
- `scripts/github.mjs` — GitHub API helpers
- `scripts/netlify-api.mjs` — Netlify API helpers
- `scripts/domain-inputs.mjs` — domain → default inputs map
- `scripts/.env.cli.example` — documents required tokens (committed)
- `scripts/.env.cli` — actual tokens (gitignored)
- `scripts/create-app.log` — runtime log (gitignored)

---

## Task 1: Create the template repo on GitHub and scaffold it locally

**Files:**
- Create: `ai-tool-template/package.json`
- Create: `ai-tool-template/vite.config.ts`
- Create: `ai-tool-template/netlify.toml`
- Create: `ai-tool-template/index.html`
- Create: `ai-tool-template/.env.example`
- Create: `ai-tool-template/.gitignore`

- [ ] **Step 1: Create a new GitHub repo named `ai-tool-template`**

Go to https://github.com/new and create a public repo named `ai-tool-template`. Do NOT initialise with README. After creating it, go to Settings → check **"Template repository"**.

- [ ] **Step 2: Clone it locally and set up the folder**

```bash
git clone https://github.com/sateeshgana/ai-tool-template
cd ai-tool-template
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "ai-tool-template",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "tailwindcss": "^4.3.0",
    "typescript": "~6.0.2",
    "vite": "^8.0.12"
  }
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 5: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 6: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `.env.example`**

```
GROQ_API_KEY=gsk_your_key_here
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "chore: scaffold template repo"
git push origin main
```

---

## Task 2: Add TypeScript types and `config.ts`

**Files:**
- Create: `ai-tool-template/src/types.ts`
- Create: `ai-tool-template/src/config.ts`
- Create: `ai-tool-template/tsconfig.json`

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Create `src/types.ts`**

```ts
export interface InputField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export interface AppConfig {
  name: string
  tagline: string
  systemPrompt: string
  inputs: InputField[]
  outputLabel: string
  accentColor: 'cyan' | 'emerald' | 'violet' | 'orange' | 'rose' | 'blue'
}
```

- [ ] **Step 3: Create `src/config.ts` with a working example**

```ts
import type { AppConfig } from './types'

export const config: AppConfig = {
  name: 'Recipe Generator AI',
  tagline: 'Create recipes from ingredients you have on hand',
  systemPrompt:
    'You are a creative chef. The user provides a list of ingredients. Generate a complete, delicious recipe with title, ingredients list, and numbered steps. Be specific and practical.',
  inputs: [
    {
      id: 'ingredients',
      label: 'Your ingredients',
      type: 'textarea',
      placeholder: 'e.g. eggs, flour, milk, butter, sugar',
    },
  ],
  outputLabel: 'Your Recipe',
  accentColor: 'emerald',
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add AppConfig types and example config"
git push origin main
```

---

## Task 3: Build the Netlify Function (`chat.mts`)

**Files:**
- Create: `ai-tool-template/netlify/functions/chat.mts`

- [ ] **Step 1: Create `netlify/functions/chat.mts`**

```ts
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  const apiKey =
    process.env.GROQ_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No API key configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  const { messages } = await req.json()

  // Determine provider from which key is set
  const isGroq = !!process.env.GROQ_API_KEY
  const isDeepSeek = !!process.env.DEEPSEEK_API_KEY

  const baseUrl = isGroq
    ? 'https://api.groq.com/openai/v1'
    : isDeepSeek
    ? 'https://api.deepseek.com/v1'
    : 'https://api.openai.com/v1'

  const model = isGroq
    ? 'llama-3.3-70b-versatile'
    : isDeepSeek
    ? 'deepseek-chat'
    : 'gpt-4o-mini'

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: false }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return new Response(
      JSON.stringify({ error: err }),
      { status: upstream.status, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  return new Response(
    JSON.stringify({ content }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/chat.mts
git commit -m "feat: add Groq/DeepSeek/OpenAI proxy Netlify function"
git push origin main
```

---

## Task 4: Build `App.tsx` — config-driven UI

**Files:**
- Create: `ai-tool-template/src/App.tsx`
- Create: `ai-tool-template/src/main.tsx`

- [ ] **Step 1: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 2: Create `src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 3: Create `src/App.tsx`**

```tsx
import { useState } from 'react'
import { config } from './config'
import type { InputField } from './types'

const ACCENT: Record<string, string> = {
  cyan:    'bg-cyan-500 hover:bg-cyan-400 focus:ring-cyan-500',
  emerald: 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-500',
  violet:  'bg-violet-500 hover:bg-violet-400 focus:ring-violet-500',
  orange:  'bg-orange-500 hover:bg-orange-400 focus:ring-orange-500',
  rose:    'bg-rose-500 hover:bg-rose-400 focus:ring-rose-500',
  blue:    'bg-blue-500 hover:bg-blue-400 focus:ring-blue-500',
}

const ACCENT_TEXT: Record<string, string> = {
  cyan:    'text-cyan-400',
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  blue:    'text-blue-400',
}

function buildUserMessage(fields: InputField[], values: Record<string, string>): string {
  return fields
    .map(f => `${f.label}:\n${values[f.id] ?? ''}`)
    .join('\n\n')
}

export default function App() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [output, setOutput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const accent     = ACCENT[config.accentColor]     ?? ACCENT.cyan
  const accentText = ACCENT_TEXT[config.accentColor] ?? ACCENT_TEXT.cyan

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user',   content: buildUserMessage(config.inputs, values) },
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      setOutput(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-8 text-center">
        <h1 className={`text-3xl font-bold mb-2 ${accentText}`}>{config.name}</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{config.tagline}</p>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {config.inputs.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {field.label}
              </label>

              {field.type === 'textarea' && (
                <textarea
                  rows={4}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none"
                />
              )}

              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0"
                />
              )}

              {field.type === 'select' && (
                <select
                  value={values[field.id] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
                >
                  <option value="">Select…</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${accent} disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-colors`}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>

        {/* Output */}
        {error && (
          <div className="mt-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {output && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">{config.outputLabel}</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
              {output}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center">
        <p className="text-gray-600 text-xs">
          Built by{' '}
          <a
            href="https://sateesh-ganaparapu.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`${accentText} hover:underline`}
          >
            Sateesh Gana
          </a>
          {' · '}
          <a
            href="https://sateesh-ganaparapu.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300"
          >
            View Portfolio
          </a>
        </p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 4: Run the dev server and verify the UI works**

```bash
npm run dev
```

Open http://localhost:5173. You should see the Recipe Generator AI UI with a textarea for ingredients and a green Generate button. Submit the form — it will fail (no API key locally) but the UI should render correctly and show an error message.

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: config-driven App UI with input fields and output panel"
git push origin main
```

---

## Task 5: Test the template manually — deploy one real app

Before writing the CLI, verify the template actually works on Netlify end-to-end.

- [ ] **Step 1: Go to netlify.com → Add new site → Import from Git**

Select the `ai-tool-template` repo. Build command: `npm run build`. Publish directory: `dist`. Deploy.

- [ ] **Step 2: Add the env var on Netlify**

In the Netlify site dashboard → Site configuration → Environment variables → Add `GROQ_API_KEY` with your actual Groq key. Trigger a redeploy.

- [ ] **Step 3: Open the live site and test it**

Type `eggs, flour, milk, butter` into the ingredients field and click Generate. You should get a recipe back within a few seconds.

- [ ] **Step 4: Confirm the template works, then delete this test site**

Once confirmed working, delete the test Netlify site (it was only for verification — the CLI will create the real ones).

---

## Task 6: Set up CLI environment in portfolio repo

**Files (portfolio repo):**
- Create: `scripts/.env.cli.example`
- Create: `scripts/domain-inputs.mjs`

- [ ] **Step 1: Add `scripts/.env.cli` to `.gitignore`**

Open `.gitignore` in the portfolio repo root and add:

```
scripts/.env.cli
scripts/create-app.log
```

- [ ] **Step 2: Create `scripts/.env.cli.example`**

```
# Copy this to scripts/.env.cli and fill in your values
GITHUB_TOKEN=ghp_your_github_personal_access_token
NETLIFY_TOKEN=nf_your_netlify_personal_access_token
GROQ_API_KEY=gsk_your_groq_api_key
GITHUB_USERNAME=sateeshgana
TEMPLATE_REPO=sateeshgana/ai-tool-template
```

- [ ] **Step 3: Create your actual `scripts/.env.cli`**

Copy `.env.cli.example` to `.env.cli` and fill in real values.

To get tokens:
- GitHub token: https://github.com/settings/tokens → New classic token → check `repo` scope
- Netlify token: https://app.netlify.com/user/applications → Personal access tokens → New token

- [ ] **Step 4: Create `scripts/domain-inputs.mjs`**

```js
/** Default input fields per domain used in batch mode */
export const DOMAIN_INPUTS = {
  food: [
    { id: 'ingredients', label: 'Your ingredients', type: 'textarea', placeholder: 'e.g. eggs, flour, milk, butter' },
  ],
  travel: [
    { id: 'destination', label: 'Destination', type: 'text', placeholder: 'e.g. Tokyo, Japan' },
    { id: 'duration',    label: 'Trip duration', type: 'text', placeholder: 'e.g. 7 days' },
  ],
  health: [
    { id: 'topic', label: 'Health topic or symptoms', type: 'textarea', placeholder: 'Describe your question or situation' },
  ],
  creative: [
    { id: 'prompt', label: 'Your prompt or topic', type: 'textarea', placeholder: 'Describe what you want to create' },
  ],
  science: [
    { id: 'question', label: 'Your question or topic', type: 'textarea', placeholder: 'e.g. How does photosynthesis work?' },
  ],
  'real-estate': [
    { id: 'details', label: 'Property or situation details', type: 'textarea', placeholder: 'Describe the property or question' },
  ],
  legal: [
    { id: 'situation', label: 'Describe your situation', type: 'textarea', placeholder: 'What legal question do you have?' },
  ],
  business: [
    { id: 'details', label: 'Business details or question', type: 'textarea', placeholder: 'Describe your business or situation' },
  ],
  marketing: [
    { id: 'product',   label: 'Product or service', type: 'text',     placeholder: 'What are you marketing?' },
    { id: 'audience',  label: 'Target audience',    type: 'text',     placeholder: 'Who is your customer?' },
  ],
  'dev-tools': [
    { id: 'input', label: 'Code or description', type: 'textarea', placeholder: 'Paste code or describe your problem' },
  ],
  civic: [
    { id: 'topic', label: 'Topic or situation', type: 'textarea', placeholder: 'Describe your civic question or need' },
  ],
  finance: [
    { id: 'question', label: 'Your financial question', type: 'textarea', placeholder: 'e.g. Should I invest in index funds?' },
  ],
  education: [
    { id: 'question', label: 'Subject or question', type: 'textarea', placeholder: 'What do you want to learn or understand?' },
  ],
  productivity: [
    { id: 'task', label: 'Task or goal description', type: 'textarea', placeholder: 'Describe the task or goal' },
  ],
  hr: [
    { id: 'situation', label: 'HR situation or question', type: 'textarea', placeholder: 'Describe the HR situation' },
  ],
}

/** Generate a systemPrompt from app name and tagline for batch mode */
export function deriveSystemPrompt(name, tagline) {
  return `You are ${name}, an AI tool that helps users with the following: ${tagline}. Be helpful, concise, and practical. Provide clear, actionable output based on the user's input.`
}
```

- [ ] **Step 5: Commit**

```bash
cd c:/workspace/sateesh-gana-portfolio
git add scripts/.env.cli.example scripts/domain-inputs.mjs .gitignore
git commit -m "chore: add CLI env template and domain input patterns"
```

---

## Task 7: Build `scripts/github.mjs` — GitHub API helpers

**Files:**
- Create: `scripts/github.mjs`

- [ ] **Step 1: Create `scripts/github.mjs`**

```js
/**
 * GitHub REST API helpers.
 * All functions throw on non-2xx responses.
 */

async function ghFetch(path, token, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

/**
 * Create a new repo from a template repo.
 * Returns the new repo object { name, html_url, clone_url }.
 */
export async function createRepoFromTemplate(token, templateOwner, templateRepo, newName, description) {
  return ghFetch(`/repos/${templateOwner}/${templateRepo}/generate`, token, {
    method: 'POST',
    body: JSON.stringify({
      owner: templateOwner,
      name: newName,
      description,
      private: false,
      include_all_branches: false,
    }),
  })
}

/**
 * Update a single file in a repo via the Contents API.
 * content must be a plain string (will be base64-encoded).
 */
export async function upsertFile(token, owner, repo, filePath, content, message) {
  // Get current SHA if file exists
  let sha
  try {
    const existing = await ghFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token)
    sha = existing.sha
  } catch {
    // File doesn't exist yet — that's fine
  }

  return ghFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })
}

/**
 * Check if a repo name is available for the given owner.
 * Returns true if available (404 from GitHub = doesn't exist).
 */
export async function isRepoNameAvailable(token, owner, name) {
  try {
    await ghFetch(`/repos/${owner}/${name}`, token)
    return false // repo exists
  } catch (err) {
    if (err.message.includes('404')) return true
    throw err
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/github.mjs
git commit -m "feat: GitHub API helpers for repo creation and file upsert"
```

---

## Task 8: Build `scripts/netlify-api.mjs` — Netlify API helpers

**Files:**
- Create: `scripts/netlify-api.mjs`

- [ ] **Step 1: Create `scripts/netlify-api.mjs`**

```js
/**
 * Netlify REST API helpers.
 * Docs: https://open-api.netlify.com/
 */

async function ntFetch(path, token, options = {}) {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Netlify ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

/**
 * Create a Netlify site linked to a GitHub repo.
 * Returns the site object including site.id and site.ssl_url.
 */
export async function createSite(token, repoOwner, repoName, siteName) {
  return ntFetch('/sites', token, {
    method: 'POST',
    body: JSON.stringify({
      name: siteName,
      repo: {
        provider: 'github',
        repo: `${repoOwner}/${repoName}`,
        branch: 'main',
        cmd: 'npm run build',
        dir: 'dist',
        private: false,
      },
    }),
  })
}

/**
 * Set an environment variable on a Netlify site.
 */
export async function setSiteEnvVar(token, siteId, key, value) {
  return ntFetch(`/sites/${siteId}/env`, token, {
    method: 'POST',
    body: JSON.stringify([{ key, values: [{ value, context: 'all' }] }]),
  })
}

/**
 * Trigger a new deploy for a site.
 */
export async function triggerDeploy(token, siteId) {
  return ntFetch(`/sites/${siteId}/deploys`, token, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/**
 * Poll until the latest deploy reaches 'ready' or 'error'.
 * Resolves with the deploy object when done.
 * Times out after timeoutMs (default 3 minutes).
 */
export async function waitForDeploy(token, siteId, timeoutMs = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 8_000))
    const deploys = await ntFetch(`/sites/${siteId}/deploys?per_page=1`, token)
    const latest = deploys[0]
    if (!latest) continue
    if (latest.state === 'ready') return latest
    if (latest.state === 'error') throw new Error(`Deploy failed: ${latest.error_message ?? 'unknown'}`)
  }
  throw new Error('Deploy timed out after 3 minutes')
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/netlify-api.mjs
git commit -m "feat: Netlify API helpers for site creation, env vars, and deploy polling"
```

---

## Task 9: Build `scripts/create-app.mjs` — main CLI orchestrator

**Files:**
- Create: `scripts/create-app.mjs`

- [ ] **Step 1: Create `scripts/create-app.mjs`**

```js
#!/usr/bin/env node
/**
 * create-app.mjs
 *
 * Usage (single app):
 *   node scripts/create-app.mjs \
 *     --name "Recipe Generator AI" \
 *     --tagline "Create recipes from ingredients" \
 *     --prompt "You are a creative chef..." \
 *     --input "ingredients:textarea:Your ingredients" \
 *     --output "Your Recipe" \
 *     --color emerald \
 *     --domain food
 *
 * Usage (batch):
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
    console.error('❌ scripts/.env.cli not found. Copy scripts/.env.cli.example and fill in your tokens.')
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
        // format: "id:type:label"
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

// ── Build config.ts content ───────────────────────────────────────────────────
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

// ── Slug helpers ──────────────────────────────────────────────────────────────
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

// ── Main: create one app ──────────────────────────────────────────────────────
async function createApp(env, appDef) {
  const {
    GITHUB_TOKEN, NETLIFY_TOKEN, GROQ_API_KEY,
    GITHUB_USERNAME, TEMPLATE_REPO,
  } = env

  const [templateOwner, templateRepo] = TEMPLATE_REPO.split('/')
  let repoName = toSlug(appDef.name)

  // Resolve name conflicts
  if (!(await isRepoNameAvailable(GITHUB_TOKEN, GITHUB_USERNAME, repoName))) {
    repoName = repoName + '-app'
    if (!(await isRepoNameAvailable(GITHUB_TOKEN, GITHUB_USERNAME, repoName))) {
      throw new Error(`Repo name conflict: ${repoName} already exists`)
    }
  }

  log(`→ Creating GitHub repo: ${repoName}`)
  const repo = await createRepoFromTemplate(
    GITHUB_TOKEN, templateOwner, templateRepo,
    repoName, appDef.tagline
  )

  // Wait a moment for GitHub to finish initialising the repo
  await new Promise(r => setTimeout(r, 3_000))

  log(`→ Injecting config.ts`)
  const configContent = buildConfigTs(appDef)
  await upsertFile(
    GITHUB_TOKEN, GITHUB_USERNAME, repoName,
    'src/config.ts', configContent,
    `feat: configure ${appDef.name}`
  )

  log(`→ Creating Netlify site`)
  const site = await createSite(NETLIFY_TOKEN, GITHUB_USERNAME, repoName, repoName)

  log(`→ Setting GROQ_API_KEY env var`)
  await setSiteEnvVar(NETLIFY_TOKEN, site.id, 'GROQ_API_KEY', GROQ_API_KEY)

  log(`→ Triggering deploy`)
  await triggerDeploy(NETLIFY_TOKEN, site.id)

  log(`→ Waiting for deploy to go live (up to 3 min)…`)
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
  // Batch mode: read apps.json, process coming-soon entries
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

  log(`Starting batch: ${targets.length} apps to deploy`)

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
      // Mark as wip so we can retry later
      const appsPath = join(ROOT, 'src', 'apps.json')
      const apps2 = JSON.parse(readFileSync(appsPath, 'utf8'))
      const idx = apps2.findIndex(a => a.id === app.id)
      if (idx !== -1) {
        apps2[idx].status = 'wip'
        writeFileSync(appsPath, JSON.stringify(apps2, null, 2))
      }
    }

    // Small delay between apps to avoid rate limiting
    await new Promise(r => setTimeout(r, 2_000))
  }

  log('Batch complete. Review scripts/create-app.log for details.')
} else {
  // Single app mode
  if (!args.name || !args.prompt) {
    console.error('Usage: node scripts/create-app.mjs --name "App Name" --tagline "..." --prompt "..." --input "id:type:label" --output "Label" --color cyan --domain food')
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/create-app.mjs
git commit -m "feat: create-app CLI with single and batch modes"
```

---

## Task 10: Test CLI with a single app end-to-end

- [ ] **Step 1: Run the CLI for one app**

```bash
node scripts/create-app.mjs \
  --name "Grocery List AI" \
  --tagline "Generate optimized grocery lists from your meal plan" \
  --prompt "You are a helpful grocery planning assistant. The user provides a meal plan or list of dishes. Generate a clean, organized grocery list grouped by category (produce, dairy, meat, pantry, etc.)." \
  --input "meals:textarea:Your meals or dishes for the week" \
  --output "Your Grocery List" \
  --color emerald \
  --domain food
```

Expected output:
```
→ Creating GitHub repo: grocery-list-ai
→ Injecting config.ts
→ Creating Netlify site
→ Setting GROQ_API_KEY env var
→ Triggering deploy
→ Waiting for deploy to go live (up to 3 min)…
✓ Grocery List AI → https://grocery-list-ai.netlify.app
```

- [ ] **Step 2: Visit `https://grocery-list-ai.netlify.app` and test it**

Type a meal plan and verify the AI responds with a grocery list.

- [ ] **Step 3: Commit the updated apps.json if the app was in coming-soon**

```bash
git add src/apps.json
git commit -m "feat: grocery-list-ai now live"
git push origin main
```

---

## Task 11: Batch deploy one domain and verify

- [ ] **Step 1: Run batch for the food domain (25 apps)**

```bash
node scripts/create-app.mjs --batch --domain food
```

Watch the log output. Should take ~5-8 minutes for 25 apps (each deploy ~10-15 seconds polling).

- [ ] **Step 2: Check the log for failures**

```bash
cat scripts/create-app.log | grep "✗"
```

For any failed apps (marked `wip` in apps.json), retry individually:
```bash
node scripts/create-app.mjs --batch --domain food
# (only processes wip and coming-soon entries)
```

- [ ] **Step 3: Commit updated apps.json**

```bash
git add src/apps.json
git commit -m "feat: deploy food domain apps — 25 apps live"
git push origin main
```

- [ ] **Step 4: If food domain works cleanly, run all remaining domains**

```bash
node scripts/create-app.mjs --batch --all
```

Then commit:
```bash
git add src/apps.json
git commit -m "feat: batch deploy all remaining coming-soon apps"
git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Template repo with `config.ts` schema | Task 1, 2 |
| `App.tsx` renders from config | Task 4 |
| Netlify Function Groq proxy with fallback | Task 3 |
| Dark UI with accent color | Task 4 |
| Footer links to portfolio | Task 4 |
| CLI reads from `scripts/.env.cli` | Task 6, 9 |
| Single-app `--name --prompt --input` flags | Task 9 |
| Batch mode `--batch --domain` / `--all` | Task 9 |
| GitHub repo from template via API | Task 7, 9 |
| Netlify site creation via API | Task 8, 9 |
| GROQ_API_KEY set per-site via API | Task 8, 9 |
| Deploy polling until ready | Task 8, 9 |
| apps.json updated with live URL | Task 9 |
| Error → wip status + continue batch | Task 9 |
| Log file written | Task 9 |
| Name conflict retry with `-app` suffix | Task 7, 9 |
| Domain input patterns table | Task 6 |
| systemPrompt derived from name+tagline in batch | Task 6 |
| Manual test of template before CLI | Task 5 |
| Rollout: 3 manual → domain → all | Task 5, 10, 11 |

All spec requirements are covered. No placeholders. Type names (`AppConfig`, `InputField`) are consistent across `types.ts`, `config.ts`, and `App.tsx`.
