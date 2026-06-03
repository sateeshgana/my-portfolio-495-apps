# AI Tool Template + CLI — Design Spec

**Date:** 2026-06-03  
**Status:** Approved  
**Goal:** Build a reusable template and CLI to mass-deploy the remaining 148 coming-soon apps from the portfolio, each as its own Netlify site, with near-zero manual work per app.

---

## Problem

The portfolio has 227 `coming-soon` apps registered with placeholder URLs. Building each one manually (scaffold, configure, push, deploy) would take weeks. A config-driven template + automation script reduces each new app to a single CLI command.

---

## Architecture

### Two deliverables

1. **`ai-tool-template`** — a GitHub template repo. Cloned once per app. Only `src/config.ts` changes between apps.
2. **`create-app.mjs`** — a CLI script living in this portfolio repo under `scripts/`. Automates cloning, config injection, GitHub repo creation, Netlify site creation, env var injection, and deploy trigger.

---

## Template Repo (`ai-tool-template`)

### File structure

```
ai-tool-template/
  src/
    config.ts            ← single file changed per app
    App.tsx              ← renders UI entirely from config
    main.tsx
  netlify/
    functions/
      chat.mts           ← Groq API proxy (server-side key)
  netlify.toml
  package.json           ← React 19 + Vite 8 + Tailwind v4
  vite.config.ts
  .env.example           ← documents required env vars
```

### `config.ts` schema

```ts
export const config = {
  name: string,           // "Recipe Generator AI"
  tagline: string,        // "Create recipes from ingredients on hand"
  systemPrompt: string,   // full system prompt for the LLM
  inputs: Array<{
    id: string,           // field key sent to LLM
    label: string,        // UI label
    type: 'text' | 'textarea' | 'select',
    placeholder?: string,
    options?: string[],   // for select type only
  }>,
  outputLabel: string,    // "Your Recipe"
  accentColor: 'cyan' | 'emerald' | 'violet' | 'orange' | 'rose' | 'blue',
}
```

### `App.tsx` behaviour

- Renders a centered card with the app name, tagline, and all input fields from config
- Submit button calls the local Netlify Function `/api/chat`
- Streams or displays the LLM response in an output panel
- Loading and error states handled generically
- No routing, no state management library — plain React useState

### `chat.mts` Netlify Function

- Accepts `POST { messages: [{role, content}] }`
- Reads `GROQ_API_KEY` from environment (set per-site via CLI)
- Calls Groq `llama-3.3-70b-versatile` (fast, free tier)
- Falls back to `DEEPSEEK_API_KEY` then `OPENAI_API_KEY` if Groq key absent
- Returns streamed response
- CORS headers set for any origin (apps call each other's endpoints)

### UI design

- Dark background (`gray-950`) matching the portfolio aesthetic
- Accent color driven by `config.accentColor`
- Mobile-first, single column, no navigation
- Footer: "Built by Sateesh Gana · View Portfolio" linking back to the portfolio site

---

## CLI Script (`scripts/create-app.mjs`)

### One-time local setup

The script reads from a local `scripts/.env.cli` file (gitignored):

```
GITHUB_TOKEN=ghp_xxx
NETLIFY_TOKEN=nf_xxx
GROQ_API_KEY=gsk_xxx
GITHUB_USERNAME=sateeshgana
TEMPLATE_REPO=sateeshgana/ai-tool-template
```

### Single-app usage

```bash
node scripts/create-app.mjs \
  --name "Recipe Generator AI" \
  --tagline "Create recipes from ingredients on hand" \
  --prompt "You are a creative chef. Given ingredients, generate a complete recipe." \
  --input "ingredients:textarea:Your ingredients (comma separated)" \
  --output "Your Recipe" \
  --color emerald \
  --domain food
```

### Batch usage (reads from apps.json)

```bash
# Build all coming-soon apps in one domain
node scripts/create-app.mjs --batch --domain food

# Build all coming-soon apps across all domains
node scripts/create-app.mjs --batch --all
```

Batch mode reads `src/apps.json`, filters `status === 'coming-soon'`, and for each entry:
- Derives `systemPrompt` from the app's `name` and `tagline` using a prompt template
- Derives `inputs` from the domain's standard input pattern
- Runs the full create flow
- Updates the app's `status` to `"live"` and `url` to the new Netlify URL in `apps.json`

### What the script does per app (in order)

1. **Clone template** — uses GitHub API to create a new repo from the template (`POST /repos/{template}/generate`)
2. **Inject config** — checks out the repo locally, writes `src/config.ts` with the app's values
3. **Push** — commits and pushes `config.ts` to the new repo
4. **Create Netlify site** — `POST /api/v1/sites` linked to the GitHub repo
5. **Set env var** — `POST /api/v1/sites/{id}/env` sets `GROQ_API_KEY`
6. **Trigger deploy** — Netlify auto-deploys on push; script polls until deploy is `ready`
7. **Update portfolio** — writes the live Netlify URL back to `src/apps.json` and sets `status: "live"`
8. **Log** — prints a summary line: `✓ recipe-generator-ai → https://recipe-generator-ai.netlify.app`

### Error handling

- If GitHub repo creation fails (name conflict), appends `-ai` suffix and retries once
- If Netlify deploy fails after 3 min, marks the app `status: "wip"` in apps.json and continues batch
- Writes a `scripts/create-app.log` with per-app results for post-run review

---

## Domain Input Patterns

Each domain has a default input shape used in batch mode:

| Domain | Default inputs |
|---|---|
| food | ingredients (textarea) |
| travel | destination (text), duration (text) |
| health | symptoms or topic (textarea) |
| creative | topic or prompt (textarea) |
| science | question or topic (textarea) |
| real-estate | property details (textarea) |
| legal | situation (textarea) |
| business | business details (textarea) |
| marketing | product/audience (textarea) |
| dev-tools | code or description (textarea) |
| civic | topic or situation (textarea) |
| finance | financial question (textarea) |
| education | subject/question (textarea) |
| productivity | task description (textarea) |
| hr | situation (textarea) |

---

## Rollout Plan

1. Build and test the template repo with 3 manual apps first
2. Build and test the CLI script with `--domain food` (25 apps)
3. If all 25 deploy cleanly, run `--batch --all` for remaining domains
4. Commit updated `apps.json` back to portfolio (live count goes from 125 → 352+)

---

## Out of Scope

- Custom domains per app (Netlify subdomain is sufficient)
- Analytics per app (GA is on the portfolio; individual apps link back to it)
- Authentication or user accounts on any app
- Database or persistent storage (all apps are stateless)
