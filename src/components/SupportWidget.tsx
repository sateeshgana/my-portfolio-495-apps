import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, Send, Loader2 } from 'lucide-react'

const PORTAL_ID = '244822982'
const FORM_ID   = 'ca72e09c-f5a9-452d-940b-30b2a6e6962f'

const COUNTRY_CODES = [
  { code: 'US', dial: '+1' },
  { code: 'IN', dial: '+91' },
  { code: 'GB', dial: '+44' },
  { code: 'AU', dial: '+61' },
  { code: 'CA', dial: '+1' },
  { code: 'SG', dial: '+65' },
  { code: 'AE', dial: '+971' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function SupportWidget() {
  const [open, setOpen]         = useState(false)
  const [status, setStatus]     = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dialCode, setDialCode] = useState('+91')
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const phone = `${dialCode} ${fd.get('phone') ?? ''}`.trim()

    const fields = [
      { objectTypeId: '0-1', name: 'firstname',    value: fd.get('firstname')    ?? '' },
      { objectTypeId: '0-1', name: 'lastname',     value: fd.get('lastname')     ?? '' },
      { objectTypeId: '0-1', name: 'email',        value: fd.get('email')        ?? '' },
      { objectTypeId: '0-1', name: 'phone',        value: phone },
      { objectTypeId: '0-1', name: 'message',      value: fd.get('message')      ?? '' },
    ].filter(f => String(f.value).trim() !== '')

    try {
      const res = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields,
            context: { pageUri: window.location.href, pageName: document.title },
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? `HTTP ${res.status}`)
      }

      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setStatus('error')
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(o => !o); setStatus('idle') }}
        aria-label="Contact support"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Slide-in panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-cyan-600 px-5 py-4">
            <h2 className="text-white font-semibold text-lg">Contact Us</h2>
            <p className="text-cyan-100 text-xs mt-0.5">We'll get back to you as soon as possible.</p>
          </div>

          {status === 'success' ? (
            <div className="px-5 py-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-700 font-medium">Message sent!</p>
              <p className="text-gray-500 text-sm mt-1">We'll be in touch shortly.</p>
              <button
                onClick={() => { setStatus('idle'); setOpen(false) }}
                className="mt-5 text-cyan-600 text-sm hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              {/* First / Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                  <input name="firstname" type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input name="lastname" type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <select
                    value={dialCode}
                    onChange={e => setDialCode(e.target.value)}
                    className="bg-gray-100 border-r border-gray-200 px-2 py-2 text-xs text-gray-700 focus:outline-none"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code + c.dial} value={c.dial}>{c.code} {c.dial}</option>
                    ))}
                  </select>
                  <input name="phone" type="tel"
                    className="flex-1 px-3 py-2 text-sm text-gray-800 bg-transparent focus:outline-none"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea name="message" rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-xs">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {status === 'submitting'
                  ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                  : <><Send size={15} /> Submit</>
                }
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
