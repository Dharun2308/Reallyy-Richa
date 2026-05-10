'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChefHat, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CookingModeProps {
  ingredients: string[]
  instructionsHtml: string
  recipeTitle: string
}

function parseSteps(html: string): string[] {
  // Prefer <li> items (the recipes use <ol><li>…</li></ol>)
  const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1].trim())
  if (liMatches.length > 0) return liMatches

  // Otherwise split on h2 sections, taking each section's <p> text(s) joined.
  const sections = html.split(/<h2[^>]*>/i).slice(1)
  if (sections.length > 0) {
    return sections.map((sec) => {
      const headingEnd = sec.indexOf('</h2>')
      const heading = headingEnd >= 0 ? sec.slice(0, headingEnd).trim() : ''
      const body = headingEnd >= 0 ? sec.slice(headingEnd + 5) : sec
      return `<strong>${heading}</strong>${body}`.trim()
    })
  }

  return [html]
}

export default function CookingMode({
  ingredients,
  instructionsHtml,
  recipeTitle,
}: CookingModeProps) {
  const [open, setOpen] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const steps = useMemo(() => parseSteps(instructionsHtml), [instructionsHtml])

  // Wake Lock — keep the screen on while in cooking mode
  useEffect(() => {
    if (!open) return
    let wakeLock: WakeLockSentinel | null = null
    const request = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // ignore — wake lock is best-effort
      }
    }
    request()
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && open) request()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release().catch(() => {})
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setStepIdx((i) => Math.min(i + 1, steps.length - 1))
      else if (e.key === 'ArrowLeft') setStepIdx((i) => Math.max(i - 1, 0))
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, steps.length])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const toggleIngredient = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <>
      <Button
        variant="default"
        onClick={() => {
          setStepIdx(0)
          setOpen(true)
        }}
        className="gap-2"
      >
        <ChefHat className="h-4 w-4" />
        Start Cooking Mode
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-cream-200 bg-white">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-sage font-medium">
                Cooking Mode
              </p>
              <h2 className="font-playfair text-lg md:text-xl font-semibold text-charcoal truncate">
                {recipeTitle}
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-cream-100 text-charcoal"
              aria-label="Exit cooking mode"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Ingredients column */}
            <aside className="lg:w-80 xl:w-96 lg:border-r border-cream-200 bg-white p-4 md:p-6 lg:overflow-y-auto max-h-[40vh] lg:max-h-none">
              <h3 className="font-playfair text-lg font-semibold text-charcoal mb-3">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {ingredients.map((ing, i) => {
                  const isChecked = checked.has(i)
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggleIngredient(i)}
                        className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-colors ${
                          isChecked ? 'bg-sage-50 text-charcoal-muted line-through' : 'hover:bg-cream-100 text-charcoal'
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center ${
                            isChecked ? 'bg-sage border-sage' : 'border-cream-300'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                        </span>
                        <span className="text-sm">{ing}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            {/* Step display */}
            <main className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 md:py-16 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                  <p className="text-sage text-sm font-medium uppercase tracking-widest mb-4 text-center">
                    Step {stepIdx + 1} of {steps.length}
                  </p>
                  <div
                    className="prose prose-lg md:prose-xl max-w-none prose-headings:font-playfair prose-a:text-sage text-charcoal text-center leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: steps[stepIdx] }}
                  />
                </div>
              </div>

              {/* Step nav */}
              <div className="border-t border-cream-200 bg-white px-4 md:px-8 py-4 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStepIdx((i) => Math.max(i - 1, 0))}
                  disabled={stepIdx === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                {/* Progress dots */}
                <div className="hidden sm:flex gap-1.5 flex-1 justify-center">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStepIdx(i)}
                      aria-label={`Go to step ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === stepIdx ? 'w-8 bg-sage' : 'w-2 bg-cream-300 hover:bg-cream-400'
                      }`}
                    />
                  ))}
                </div>

                {stepIdx < steps.length - 1 ? (
                  <Button
                    onClick={() => setStepIdx((i) => Math.min(i + 1, steps.length - 1))}
                    className="gap-2"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setOpen(false)} className="gap-2">
                    Finish <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  )
}
