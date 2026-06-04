# Input UX Features — Design Spec (Phase 1)

**Date:** 2026-06-04
**Status:** Approved
**Goal:** Add example prefill chips, tone/style selector, word count display, and Cmd/Ctrl+Enter keyboard shortcut to the `ai-tool-template` — making every app feel polished and immediately usable without reading instructions.

---

## Problem

The current template has bare input fields with no guidance for new users. Visitors don't know what to type, how to phrase their input, or how to control output style. Adding examples, tone control, and subtle input feedback dramatically reduces time-to-first-result.

---

## Scope

Changes apply to the `ai-tool-template` repo (`c:\workspace\ai-tool-template`). After updating the template, `generate-local.mjs` is updated to inject examples and tones, then re-run to regenerate all 227 local app folders.

---

## Features

### 1. Example Prefill Chips
- Each `InputField` gains an optional `examples?: string[]` property
- For `text` and `textarea` fields only (not `select` — it already has options)
- Rendered as pill-shaped chip buttons below the field
- Clicking a chip fills that field's value instantly
- Styled as accent-color outlined chips: `border border-accent text-accent hover:bg-accent/10`
- 2–3 examples per field, short enough to fit on one line each
- `domain-inputs.mjs` gains contextually relevant examples for all 15 domains
- `generate-local.mjs` injects examples from domain patterns into generated `config.ts`
- `examples` is optional in the schema — manually authored apps can omit or override

### 2. Tone / Style Selector
- `AppConfig` gains optional `tones?: string[]`
- If absent or empty, the tone selector is hidden — no UI change for apps that don't want it
- Default tone list for all batch-generated apps: `['Formal', 'Casual', 'Detailed', 'Concise']`
- Rendered as a compact row of toggle buttons above the Generate button
- Selected tone is highlighted in the accent color; others are gray outlines
- Default selected tone: first in the array (`'Formal'`)
- Tone instruction appended to the user message client-side:
  `\n\nTone: Write in a {tone} style.`
- No backend changes required

### 3. Word Count on Textareas
- Shown below each `textarea` field only (not `text` or `select`)
- Right-aligned, small gray text: `{N} words · {M} chars`
- Updates on every keystroke
- Hidden when field is empty (shows only once user starts typing)
- Purely frontend, no schema changes

### 4. Keyboard Shortcut: Cmd/Ctrl+Enter
- Pressing `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) on any textarea triggers form submit
- Only fires when `!streaming && hasInput` (same conditions as the Generate button)
- Small hint label inside each textarea: `⌘↵` (bottom-right, light gray, non-interactive)
- Uses `onKeyDown` event on each textarea

---

## Schema Changes

### `src/types.ts`

```ts
interface BaseField {
  id: string
  label: string
  placeholder?: string
}

export type InputField =
  | (BaseField & { type: 'text' | 'textarea'; examples?: string[] })
  | (BaseField & { type: 'select'; options: string[] })

export interface AppConfig {
  name: string
  tagline: string
  systemPrompt: string
  inputs: InputField[]
  outputLabel: string
  accentColor: 'cyan' | 'emerald' | 'violet' | 'orange' | 'rose' | 'blue'
  tones?: string[]
}
```

---

## `domain-inputs.mjs` Changes

Each domain's input fields gain an `examples` array. Representative examples:

| Domain | Field | Examples |
|---|---|---|
| food | ingredients | `"eggs, flour, milk"` · `"chicken, rice, garlic"` · `"oats, banana, honey"` |
| travel | destination | `"Tokyo, Japan"` · `"Paris, France"` · `"Bali, Indonesia"` |
| travel | duration | `"7 days"` · `"2 weeks"` · `"long weekend"` |
| health | topic | `"lower back pain"` · `"sleep problems"` · `"stress management"` |
| creative | prompt | `"a mystery set in space"` · `"a birthday poem for my mum"` |
| science | question | `"How does CRISPR work?"` · `"What is quantum entanglement?"` |
| finance | question | `"Should I pay off debt or invest?"` · `"How do index funds work?"` |
| legal | situation | `"My landlord won't return my deposit"` · `"I need to write an NDA"` |
| business | details | `"SaaS startup targeting SMBs"` · `"ecommerce store selling handmade goods"` |
| marketing | product | `"AI writing assistant"` · `"organic skincare brand"` |
| marketing | audience | `"freelance designers"` · `"small business owners"` |
| dev-tools | input | `"function that sorts a list of objects by date"` |
| education | question | `"Explain photosynthesis to a 10-year-old"` · `"What caused WW1?"` |
| productivity | task | `"Plan my week"` · `"Write a project proposal"` |
| hr | situation | `"Employee performance review template"` · `"Remote team onboarding"` |
| civic | topic | `"How to write to my local councillor"` · `"Understanding my voting rights"` |
| real-estate | details | `"3-bed house in Austin TX, asking $450k"` |

All other domains (`science`, `real-estate`, `civic`, `creative`, etc.) follow the same pattern with 2–3 contextually relevant examples per field.

---

## `generate-local.mjs` Changes

`buildConfigTs(app)` gains two additions:

1. **Examples injected per field** — the domain input pattern now includes `examples`, which are serialised into the generated `config.ts` alongside `id`, `label`, `type`, `placeholder`.

2. **Tones added** — every generated `config.ts` includes:
   ```ts
   tones: ['Formal', 'Casual', 'Detailed', 'Concise'],
   ```

---

## `App.tsx` Changes

### New state
```ts
const [tone, setTone] = useState<string>(() => config.tones?.[0] ?? '')
```

### Tone selector (rendered above Generate button)
```tsx
{config.tones && config.tones.length > 0 && (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs text-gray-500">Tone:</span>
    {config.tones.map(t => (
      <button key={t} type="button" onClick={() => setTone(t)}
        className={tone === t ? `...accent active` : `...gray inactive`}>
        {t}
      </button>
    ))}
  </div>
)}
```

### Example chips (rendered below each field)
```tsx
{field.examples && field.examples.length > 0 && (
  <div className="flex gap-2 flex-wrap mt-1.5">
    {field.examples.map(ex => (
      <button key={ex} type="button"
        onClick={() => setValues(v => ({ ...v, [field.id]: ex }))}>
        {ex}
      </button>
    ))}
  </div>
)}
```

### Word count (rendered below each textarea)
```tsx
{field.type === 'textarea' && values[field.id] && (
  <p className="text-right text-xs text-gray-600 mt-1">
    {wordCount(values[field.id])} words · {values[field.id].length} chars
  </p>
)}
```

### Keyboard shortcut on each textarea
```tsx
onKeyDown={e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !streaming && hasInput) {
    e.preventDefault()
    runStream()
  }
}}
```

### Tone appended to user message in `buildUserMessage`
```ts
function buildUserMessage(
  fields: InputField[],
  values: Record<string, string>,
  tone: string
): string {
  const fieldText = fields
    .filter(f => (values[f.id] ?? '').trim().length > 0)
    .map(f => `${f.label}:\n${values[f.id]}`)
    .join('\n\n')
  return tone ? `${fieldText}\n\nTone: Write in a ${tone} style.` : fieldText
}
```

---

## Files Changed

| File | Change |
|---|---|
| `src/types.ts` | Add `examples?: string[]` to text/textarea InputField; add `tones?: string[]` to AppConfig |
| `src/App.tsx` | Tone selector, example chips, word count, Cmd+Enter handler, tone in message |
| `scripts/domain-inputs.mjs` (portfolio repo) | Add `examples` arrays to all 15 domains |
| `scripts/generate-local.mjs` (portfolio repo) | Inject examples + tones into generated config.ts; re-run to regenerate 227 folders |

---

## Out of Scope

- Per-app custom tone labels (all apps use same 4 tones)
- Tone affecting system prompt server-side (client-side append only)
- Example images or multi-media examples
- Example suggestions fetched from an API
