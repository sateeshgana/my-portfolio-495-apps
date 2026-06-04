# Output UX Features — Design Spec

**Date:** 2026-06-04
**Status:** Approved
**Goal:** Upgrade the `ai-tool-template` with real streaming output, markdown rendering, copy to clipboard, regenerate button, and OpenRouter as a fourth LLM fallback provider — making every deployed app feel competitive with leading AI tools.

---

## Problem

The current template displays AI output as a plain text dump that appears all at once after a 3–5 second wait. Competing tools (ChatGPT, Claude, Perplexity) stream output word-by-word and render markdown. Our apps look unpolished by comparison.

---

## Scope

Changes apply to the `ai-tool-template` repo (`c:\workspace\ai-tool-template`). After updating the template, `generate-local.mjs` is re-run to regenerate all 227 local app folders.

---

## Features

### 1. Real Streaming Output
- `chat.mts` calls the LLM with `stream: true`
- Pipes the response back as `text/event-stream` (SSE)
- Each chunk: `data: <token>\n\n`
- Terminator: `data: [DONE]\n\n`
- App reads with `fetch` + `ReadableStream` + `TextDecoder`
- Each token appended to `output` state → UI re-renders on each token
- User sees first word in ~300ms instead of waiting for the full response

### 2. Markdown Rendering
- Dependency: `react-markdown` + `remark-gfm`
- Output panel renders markdown live as tokens stream in
- Styles (dark theme compatible):
  - `h1`–`h3`: slightly larger, bold, with bottom margin
  - `strong` / `em`: native bold/italic
  - `ul` / `ol`: indented with bullets/numbers
  - `code` (inline): monospace, slightly lighter background (`gray-800`)
  - `pre` / code blocks: `gray-800` background, rounded, padded, scrollable
  - `a`: accent color, opens in new tab
  - `hr`: `gray-700` border
- Blinking cursor (`▍`) appended to output while streaming, removed when done

### 3. Copy to Clipboard
- Appears below output panel when streaming is complete
- `navigator.clipboard.writeText(output)`
- Button label: "Copy" → "Copied!" for 2 seconds → back to "Copy"
- Copies the raw markdown text (not rendered HTML)

### 4. Regenerate Button
- Appears beside Copy when streaming is complete
- Re-submits the same current input values without clearing them
- Clears `output` state and starts a fresh stream
- Useful for getting a different result or after editing inputs

### 5. OpenRouter Fallback (4th Provider)
- Provider chain: `GROQ_API_KEY` → `DEEPSEEK_API_KEY` → `OPENAI_API_KEY` → `OPENROUTER_API_KEY`
- Base URL: `https://openrouter.ai/api/v1`
- Default model: `meta-llama/llama-3.3-70b-instruct:free`
- Same OpenAI-compatible API format — minimal code change
- `.env.example` gains: `OPENROUTER_API_KEY=sk-or-your-key-here`
- `scripts/.env.cli.example` gains: `OPENROUTER_API_KEY=sk-or-your-key-here`

---

## Architecture

### `netlify/functions/chat.mts` changes

**Before:** Calls LLM with `stream: false`, returns `Response(JSON.stringify({ content }))`.

**After:**
1. Detects provider from env vars (Groq → DeepSeek → OpenAI → OpenRouter)
2. Calls provider with `stream: true`
3. Creates a `TransformStream` to pipe SSE chunks
4. Returns `new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } })`
5. Each chunk extracted from provider SSE → forwarded as `data: <token>\n\n`
6. On stream end → sends `data: [DONE]\n\n`
7. AbortController timeout (20s) remains
8. On error: returns `{ error: string }` JSON with appropriate status code

### `src/App.tsx` changes

**New state:**
```ts
const [output,    setOutput]    = useState('')
const [streaming, setStreaming] = useState(false)
const [done,      setDone]      = useState(false)
const [copied,    setCopied]    = useState(false)
```

**Stream reading in `handleSubmit`:**
```
fetch('/api/chat') →
  if !res.ok → throw error (same as before)
  if res.ok  → read res.body as ReadableStream
    TextDecoder decodes each chunk
    Split on '\n', find lines starting with 'data: '
    Strip 'data: ' prefix
    If token === '[DONE]' → setDone(true), setStreaming(false)
    Else → setOutput(prev => prev + token)
```

**Output panel states:**

| State | What renders |
|---|---|
| Empty (`!output && !streaming`) | Nothing |
| Streaming (`streaming`) | Markdown output + blinking cursor `▍` |
| Done (`done`) | Markdown output + Copy + Regenerate buttons |
| Error | Red error box (unchanged) |

### `package.json` changes

```json
"react-markdown": "^9.0.1",
"remark-gfm": "^4.0.0"
```

---

## Files Changed

| File | Change |
|---|---|
| `netlify/functions/chat.mts` | Full rewrite — streaming SSE + OpenRouter provider |
| `src/App.tsx` | Stream reading, markdown rendering, copy, regenerate |
| `package.json` | Add react-markdown, remark-gfm |
| `.env.example` | Add OPENROUTER_API_KEY |
| `scripts/.env.cli.example` (portfolio repo) | Add OPENROUTER_API_KEY |

---

## Out of Scope

- Export to PDF or .txt (future Group B feature)
- Share result link (future Group B feature)
- Tone/style selector (future Group B feature)
- Per-app markdown style customisation via config
- Streaming retry on network drop
