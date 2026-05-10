'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'

export default function ScoreInfoPopover() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="How is the score calculated?"
        className="text-sage-400 hover:text-sage transition-colors"
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div className="absolute right-0 top-6 z-20 w-72 bg-white border border-sage-200 rounded-xl shadow-lg p-4 text-sm text-charcoal">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-charcoal">How it&apos;s calculated</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-charcoal-muted hover:text-charcoal"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-charcoal-muted leading-relaxed mb-2">
              Each ingredient is rated for its anti-inflammatory potential based on peer-reviewed
              nutritional research. We look at:
            </p>
            <ul className="space-y-1 text-charcoal-muted">
              <li className="flex gap-2"><span className="text-sage shrink-0">→</span>Omega-3 to Omega-6 ratio</li>
              <li className="flex gap-2"><span className="text-sage shrink-0">→</span>Antioxidant &amp; polyphenol content</li>
              <li className="flex gap-2"><span className="text-sage shrink-0">→</span>Glycaemic load</li>
              <li className="flex gap-2"><span className="text-sage shrink-0">→</span>Fibre &amp; micronutrient density</li>
              <li className="flex gap-2"><span className="text-sage shrink-0">→</span>Presence of known inflammatory triggers</li>
            </ul>
            <p className="text-[10px] text-charcoal-muted mt-3 border-t border-sage-100 pt-2">
              Scores are estimates and not a substitute for personalised medical advice.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
