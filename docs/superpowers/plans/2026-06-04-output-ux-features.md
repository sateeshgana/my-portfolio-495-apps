# Output UX Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `ai-tool-template` with SSE streaming, live markdown rendering, copy to clipboard, regenerate button, and OpenRouter as a 4th LLM fallback.

**Architecture:** `chat.mts` is rewritten to call the LLM with `stream: true` and pipe chunks back as Server-Sent Events. `App.tsx` reads the SSE stream with `fetch` + `ReadableStream`, appends tokens to state, and renders output with `react-markdown`. Copy and Regenerate buttons appear when the stream completes.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Netlify Functions v2 (`.mts`), react-markdown 9, remark-gfm 4, Groq / DeepSeek / OpenAI / OpenRouter APIs

---

## File Map

**Repo: `c:\workspace\ai-tool-template`**
- Modify: `netlify/functions/chat.mts` — full rewrite to SSE streaming + OpenRouter
- Modify: `src/App.tsx` — stream reading, markdown, copy, regenerate
- Modify: `package.json` — add react-markdown, remark-gfm
- Modify: `.env.example` — add OPENROUTER_API_KEY

**Repo: `c:\workspace\sateesh-gana-portfolio`**
- Modify: `scripts/.env.cli.example` — add OPENROUTER_API_KEY

---

## Task 1: Add react-markdown and remark-gfm dependencies

**Files:**
- Modify: `c:\workspace\ai-tool-template\package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd c:\workspace\ai-tool-template
npm install react-markdown@^9.0.1 remark-gfm@^4.0.0
```

Expected: packages added to `node_modules`, `package.json` updated with both dependencies under `"dependencies"`.

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors. (react-markdown imports nothing at build time yet — this just confirms the package resolves.)

- [ ] **Step 3: Commit**

```bash
cd c:\workspace\ai-tool-template
git add package.json package-lock.json
git commit -m "chore: add react-markdown and remark-gfm"
git push origin main
```

---

## Task 2: Rewrite `chat.mts` — SSE streaming + OpenRouter fallback

**Files:**
- Modify: `c:\workspace\ai-tool-template\netlify\functions\chat.mts`
- Modify: `c:\workspace\ai-tool-template\.env.example`

- [ ] **Step 1: Replace `chat.mts` with the full streaming implementation**

Write the following as the complete contents of `netlify/functions/chat.mts`:

```ts
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Provider = {
  baseUrl: string
  apiKey: string
  model: string
}

function detectProvider(): Provider | null {
  if (process.env.GROQ_API_KEY) {
    return {
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey:  process.env.GROQ_API_KEY,
      model:   'llama-3.3-70b-versatile',
    }
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey:  process.env.DEEPSEEK_API_KEY,
      model:   'deepseek-chat',
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      baseUrl: 'https://api.openai.com/v1',
      apiKey:  process.env.OPENAI_API_KEY,
      model:   'gpt-4o-mini',
    }
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey:  process.env.OPENROUTER_API_KEY,
      model:   'meta-llama/llama-3.3-70b-instruct:free',
    }
  }
  return null
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  const provider = detectProvider()
  if (!provider) {
    return new Response(
      JSON.stringify({ error: 'No API key configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  if (!Array.isArray(body.messages)) {
    return new Response(
      JSON.stringify({ error: 'messages must be an array' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  const systemPrompt = process.env.SYSTEM_PROMPT
  const userMessages = (body.messages as Array<{ role: string; content: string }>)
    .filter(m => m.role !== 'system')
  const messages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...userMessages]
    : userMessages

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)

  let upstream: Response
  try {
    upstream = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: provider.model, messages, stream: true }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'Request timed out'
      : 'Failed to reach AI provider'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
  clearTimeout(timeout)

  if (!upstream.ok) {
    let message = `AI provider error (${upstream.status})`
    try {
      const errData = await upstream.json() as { error?: { message?: string } }
      if (errData.error?.message) message = errData.error.message
    } catch { /* ignore */ }
    return new Response(
      JSON.stringify({ error: message }),
      { status: upstream.status, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  // Pipe the provider SSE stream to the client as SSE
  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  ;(async () => {
    const reader = upstream.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6)) as {
              choices?: Array<{ delta?: { content?: string } }>
            }
            const token = json.choices?.[0]?.delta?.content
            if (token) {
              await writer.write(encoder.encode(`data: ${token}\n\n`))
            }
          } catch { /* malformed chunk — skip */ }
        }
      }
    } finally {
      await writer.write(encoder.encode('data: [DONE]\n\n'))
      await writer.close()
    }
  })()

  return new Response(readable, {
    status: 200,
    headers: {
      ...CORS,
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
```

- [ ] **Step 2: Update `.env.example` to document OpenRouter key**

Replace the full contents of `.env.example` with:

```
GROQ_API_KEY=gsk_your_key_here
DEEPSEEK_API_KEY=sk_your_key_here
OPENAI_API_KEY=sk-your_key_here
OPENROUTER_API_KEY=sk-or-your-key-here
SYSTEM_PROMPT=You are a helpful AI assistant.
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd c:\workspace\ai-tool-template
npm run build
```

Expected: `✓ built in Xs` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/chat.mts .env.example
git commit -m "feat: streaming SSE output + OpenRouter as 4th provider fallback"
git push origin main
```

---

## Task 3: Rewrite `App.tsx` — stream reading, markdown, copy, regenerate

**Files:**
- Modify: `c:\workspace\ai-tool-template\src\App.tsx`

- [ ] **Step 1: Replace `App.tsx` with the full streaming + markdown implementation**

Write the following as the complete contents of `src/App.tsx`:

```tsx
import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { config } from './config'
import type { AppConfig, InputField } from './types'

const ACCENT: Record<AppConfig['accentColor'], string> = {
  cyan:    'bg-cyan-500 hover:bg-cyan-400',
  emerald: 'bg-emerald-500 hover:bg-emerald-400',
  violet:  'bg-violet-500 hover:bg-violet-400',
  orange:  'bg-orange-500 hover:bg-orange-400',
  rose:    'bg-rose-500 hover:bg-rose-400',
  blue:    'bg-blue-500 hover:bg-blue-400',
}

const ACCENT_TEXT: Record<AppConfig['accentColor'], string> = {
  cyan:    'text-cyan-400',
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  blue:    'text-blue-400',
}

const ACCENT_BORDER: Record<AppConfig['accentColor'], string> = {
  cyan:    'border-cyan-500 text-cyan-400 hover:bg-cyan-950',
  emerald: 'border-emerald-500 text-emerald-400 hover:bg-emerald-950',
  violet:  'border-violet-500 text-violet-400 hover:bg-violet-950',
  orange:  'border-orange-500 text-orange-400 hover:bg-orange-950',
  rose:    'border-rose-500 text-rose-400 hover:bg-rose-950',
  blue:    'border-blue-500 text-blue-400 hover:bg-blue-950',
}

function buildUserMessage(fields: InputField[], values: Record<string, string>): string {
  return fields
    .filter(f => (values[f.id] ?? '').trim().length > 0)
    .map(f => `${f.label}:\n${values[f.id]}`)
    .join('\n\n')
}

export default function App() {
  const [values,    setValues]    = useState<Record<string, string>>({})
  const [output,    setOutput]    = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const accent       = ACCENT[config.accentColor]
  const accentText   = ACCENT_TEXT[config.accentColor]
  const accentBorder = ACCENT_BORDER[config.accentColor]
  const hasInput     = config.inputs.some(f => (values[f.id] ?? '').trim().length > 0)

  async function runStream() {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setDone(false)
    setOutput('')
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: buildUserMessage(config.inputs, values) },
          ],
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done: readerDone, value } = await reader.read()
        if (readerDone) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const token = trimmed.slice(6)
          if (token === '[DONE]') {
            setDone(true)
            setStreaming(false)
            return
          }
          setOutput(prev => prev + token)
        }
      }

      // Stream ended without [DONE] — treat as complete
      setDone(true)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setStreaming(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runStream()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Markdown component map — dark theme styles
  const mdComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-bold mt-4 mb-2 text-gray-100">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-bold mt-4 mb-2 text-gray-100">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-semibold mt-3 mb-1 text-gray-100">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-3 last:mb-0 text-gray-100 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-gray-100">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-100">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-gray-200">{children}</li>
    ),
    code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
      inline ? (
        <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      ) : (
        <code className="block bg-gray-800 text-gray-200 p-4 rounded-lg text-xs font-mono overflow-x-auto mb-3">
          {children}
        </code>
      ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="mb-3">{children}</pre>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${accentText} hover:underline`}
      >
        {children}
      </a>
    ),
    hr: () => <hr className="border-gray-700 my-4" />,
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-gray-100">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-gray-200">{children}</em>
    ),
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
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={streaming || !hasInput}
            className={`w-full ${accent} disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-colors`}
          >
            {streaming ? 'Generating…' : 'Generate'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Output panel */}
        {(output || streaming) && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">{config.outputLabel}</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 text-sm min-h-[80px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents}
              >
                {streaming ? output + '▍' : output}
              </ReactMarkdown>
            </div>

            {/* Copy + Regenerate — shown only when done */}
            {done && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${accentBorder}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={runStream}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            )}
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

- [ ] **Step 2: Verify TypeScript compiles and build passes**

```bash
cd c:\workspace\ai-tool-template
npm run build
```

Expected: `✓ built in Xs` with no TypeScript errors. If you see a type error on `inline` prop of `code`, add `children?: React.ReactNode` to the type — it's already included above.

- [ ] **Step 3: Test locally with dev server**

```bash
npm run dev
```

Open http://localhost:5173. Type something in the input. Click Generate. Because there's no local API key, it will error — that's expected. The UI should show the form correctly, the Generate button should be disabled when input is empty, and the output panel should not be visible yet.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: streaming output with markdown rendering, copy, and regenerate"
git push origin main
```

---

## Task 4: Update `.env.cli.example` in portfolio repo

**Files:**
- Modify: `c:\workspace\sateesh-gana-portfolio\scripts\.env.cli.example`

- [ ] **Step 1: Add OPENROUTER_API_KEY to the example file**

Replace the full contents of `scripts/.env.cli.example` with:

```
# Copy this to scripts/.env.cli and fill in your values
GITHUB_TOKEN=ghp_your_github_personal_access_token
NETLIFY_TOKEN=nf_your_netlify_personal_access_token
GROQ_API_KEY=gsk_your_groq_api_key
OPENROUTER_API_KEY=sk-or-your-openrouter-key
GITHUB_USERNAME=sateeshgana
TEMPLATE_REPO=sateeshgana/ai-tool-template
```

- [ ] **Step 2: Commit**

```bash
cd c:\workspace\sateesh-gana-portfolio
git add scripts/.env.cli.example
git commit -m "chore: add OPENROUTER_API_KEY to CLI env example"
```

---

## Task 5: Verify end-to-end on the live Netlify test site

- [ ] **Step 1: Deploy the updated template to Netlify for testing**

Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → select `ai-tool-template`. Build: `npm run build`, publish: `dist`. Deploy.

- [ ] **Step 2: Add env vars to the test site**

Site configuration → Environment variables. Add:
- `GROQ_API_KEY` — your Groq key
- `SYSTEM_PROMPT` — `You are a creative chef. The user provides ingredients. Generate a complete recipe with title, ingredients list, and numbered steps.`

Trigger a redeploy.

- [ ] **Step 3: Test streaming**

Open the live URL. Type `eggs, flour, milk, butter` and click Generate. You should see text appearing word-by-word within ~300ms of clicking. The output should render with markdown formatting (bold title, numbered steps, bullet lists).

- [ ] **Step 4: Test Copy button**

When generation completes, click Copy. The button should say "Copied!" for 2 seconds. Paste into a text editor — you should get the raw markdown text.

- [ ] **Step 5: Test Regenerate button**

Click Regenerate. The output should clear and a fresh stream should start with a different recipe variation.

- [ ] **Step 6: Delete the test site when done**

Once all 5 tests pass, delete the test Netlify site (Settings → Danger zone → Delete site). The CLI will create the real per-app sites later.

---

## Task 6: Regenerate all 227 local app folders with the updated template

**Files:**
- Run: `c:\workspace\sateesh-gana-portfolio\scripts\generate-local.mjs`

- [ ] **Step 1: Delete existing app folders and regenerate**

The existing 227 folders in `c:\workspace\apps\` were created from the old template (no streaming). Delete them and regenerate:

```bash
cd c:\workspace\sateesh-gana-portfolio
Remove-Item -Recurse -Force c:\workspace\apps
node scripts/generate-local.mjs
```

Expected output ends with: `Done. 227 created, 0 skipped.`

- [ ] **Step 2: Spot-check one app**

```bash
cd c:\workspace\apps\recipe-generator-ai
npm install
npm run build
```

Expected: `✓ built in Xs` — confirms the updated template (with react-markdown) builds correctly in a generated app folder.

- [ ] **Step 3: Commit portfolio repo changes**

```bash
cd c:\workspace\sateesh-gana-portfolio
git add scripts/.env.cli.example
git commit -m "feat: output UX features complete — streaming, markdown, copy, regenerate, OpenRouter"
git push origin main
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| SSE streaming from chat.mts | Task 2 |
| Groq → DeepSeek → OpenAI → OpenRouter provider chain | Task 2 |
| OpenRouter model `meta-llama/llama-3.3-70b-instruct:free` | Task 2 |
| AbortController 20s timeout preserved | Task 2 |
| SYSTEM_PROMPT env var preserved (server-side) | Task 2 |
| react-markdown + remark-gfm installed | Task 1 |
| Live markdown rendering during stream | Task 3 |
| Blinking cursor `▍` during stream | Task 3 |
| Copy button — raw markdown, 2s feedback | Task 3 |
| Regenerate button — same inputs, fresh stream | Task 3 |
| Copy + Regenerate appear only when done | Task 3 |
| AbortController on frontend (cancel in-flight) | Task 3 |
| `.env.example` updated with OpenRouter | Task 2 |
| `scripts/.env.cli.example` updated | Task 4 |
| End-to-end live test | Task 5 |
| All 227 local app folders regenerated | Task 6 |

All spec requirements covered. No placeholders. Type names consistent across tasks (`AppConfig`, `InputField`, `ACCENT`, `ACCENT_TEXT`, `ACCENT_BORDER`).
