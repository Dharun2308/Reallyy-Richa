'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChefHat, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CookingModeProps {
  ingredients: string[]
  instructionsHtml: string
  recipeTitle: string
}

interface Step {
  html: string
  ingredients: string[]
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseSteps(html: string): string[] {
  const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1].trim())
  if (liMatches.length > 0) return liMatches

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

function matchIngredients(stepText: string, ingredients: string[]): string[] {
  const lower = stepText.toLowerCase()
  return ingredients.filter((ing) => {
    if (ing.startsWith('##')) return false
    const words = stripHtml(ing)
      .toLowerCase()
      .replace(/^\d[\d/.,½⅓¼¾⅔⅛⅜⅝⅞]*\s*/, '')
      .replace(/^(cup|tbsp|tsp|tablespoon|teaspoon|g|kg|ml|oz|lb|pinch|handful|bunch|slice|clove|can|tin|pkg|package)s?\s+(of\s+)?/i, '')
      .split(/\s+/)
      .filter((w) => w.length > 3)
    return words.some((w) => lower.includes(w))
  })
}

function buildSteps(rawSteps: string[], ingredients: string[]): Step[] {
  return rawSteps.map((html) => ({
    html,
    ingredients: matchIngredients(stripHtml(html), ingredients),
  }))
}

export default function CookingMode({ ingredients, instructionsHtml, recipeTitle }: CookingModeProps) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const rawSteps = useMemo(() => parseSteps(instructionsHtml), [instructionsHtml])
  const steps = useMemo(() => buildSteps(rawSteps, ingredients), [rawSteps, ingredients])

  const stepRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    stepRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeIdx])

  // Wake Lock
  useEffect(() => {
    if (!open) return
    let wakeLock: WakeLockSentinel | null = null
    const request = async () => {
      try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen')
      } catch {}
    }
    request()
    const onVisibility = () => { if (document.visibilityState === 'visible') request() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release().catch(() => {})
    }
  }, [open])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setActiveIdx((i) => Math.min(i + 1, steps.length - 1))
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setActiveIdx((i) => Math.max(i - 1, 0))
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, steps.length])

  // Lock body scroll
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const toggleIngredient = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <>
      <Button variant="default" onClick={() => { setActiveIdx(0); setOpen(true) }} className="gap-2">
        <ChefHat className="h-4 w-4" />
        Start Cooking Mode
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1c1712', color: '#e8e0d5' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b shrink-0" style={{ background: '#141210', borderColor: '#3a2f24' }}>
            <div>
              <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#a07850' }}>
                Cooking Mode
              </p>
              <h2 className="font-playfair text-lg md:text-xl font-semibold" style={{ color: '#f0e8dc' }}>
                {recipeTitle}
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full transition-colors"
              style={{ color: '#8a7060' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2c2218')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Exit cooking mode"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

            {/* Left — all ingredients */}
            <aside className="lg:w-72 xl:w-80 flex flex-col border-b lg:border-b-0 lg:border-r max-h-[38vh] lg:max-h-none" style={{ background: '#161310', borderColor: '#3a2f24' }}>
              <div className="px-5 pt-5 pb-2 shrink-0">
                <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#a07850' }}>
                  Ingredients
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6b5a48' }}>Tap to mark used</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5">
                <ul className="space-y-1 mt-2">
                  {ingredients.map((ing, i) => {
                    if (ing.startsWith('##')) {
                      return (
                        <li key={i} className="pt-3 pb-1 first:pt-1">
                          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#7a6040' }}>
                            {ing.replace(/^##\s*/, '')}
                          </p>
                        </li>
                      )
                    }
                    const isChecked = checked.has(i)
                    return (
                      <li key={i}>
                        <button
                          onClick={() => toggleIngredient(i)}
                          className="w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
                          style={isChecked
                            ? { color: '#5a4a38', textDecoration: 'line-through' }
                            : { color: '#d4c4b0' }
                          }
                        >
                          <span
                            className="mt-0.5 h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center"
                            style={isChecked
                              ? { background: '#7a5c3a', borderColor: '#7a5c3a' }
                              : { borderColor: '#4a3a2a' }
                            }
                          >
                            {isChecked && <Check className="h-2.5 w-2.5" style={{ color: '#f0e8dc' }} />}
                          </span>
                          <span>{ing}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </aside>

            {/* Right — all steps */}
            <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-3">
              {steps.map((step, i) => {
                const isActive = i === activeIdx
                const isDone = i < activeIdx
                return (
                  <button
                    key={i}
                    ref={(el) => { stepRefs.current[i] = el }}
                    onClick={() => setActiveIdx(i)}
                    className="w-full text-left rounded-2xl transition-all border"
                    style={isActive
                      ? { background: '#2a2018', borderColor: '#7a5c3a', boxShadow: '0 4px 24px rgba(90,60,20,0.25)' }
                      : isDone
                      ? { background: '#1e1a15', borderColor: '#2e261c', opacity: 0.5 }
                      : { background: '#1e1a15', borderColor: '#2e261c' }
                    }
                  >
                    <div className="flex items-start gap-0 p-5">
                      {/* Step number */}
                      <span
                        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5"
                        style={isActive
                          ? { background: '#7a5c3a', color: '#f0e8dc' }
                          : isDone
                          ? { background: '#3a2e22', color: '#7a6040' }
                          : { background: '#2a2018', color: '#6b5a48' }
                        }
                      >
                        {isDone ? <Check className="h-4 w-4" /> : i + 1}
                      </span>

                      {/* Step text */}
                      <div
                        className="flex-1 min-w-0 leading-relaxed"
                        style={isActive ? { color: '#f0e8dc', fontSize: '1.125rem' } : { color: '#7a6a58', fontSize: '0.9375rem' }}
                        dangerouslySetInnerHTML={{ __html: step.html }}
                      />

                      {/* Per-step ingredients panel */}
                      {step.ingredients.length > 0 && (
                        <div
                          className="shrink-0 ml-5 rounded-xl p-3 hidden md:block"
                          style={{
                            width: '11rem',
                            background: isActive ? '#231c13' : '#1a1610',
                            border: `1px solid ${isActive ? '#4a3828' : '#2a2018'}`,
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#7a5c3a' }}>
                            This step
                          </p>
                          <ul className="space-y-1.5">
                            {step.ingredients.map((ing) => (
                              <li key={ing} className="text-xs leading-snug" style={{ color: isActive ? '#c4a882' : '#5a4a38' }}>
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}

              {/* End card */}
              <div className="rounded-2xl border px-6 py-5 text-center text-sm" style={{ background: '#1e1a15', borderColor: '#2e261c', color: '#5a4a38' }}>
                <ChefHat className="h-6 w-6 mx-auto mb-2 opacity-30" />
                All steps complete — enjoy!
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  )
}
