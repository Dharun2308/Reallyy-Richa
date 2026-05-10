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

// Match ingredients mentioned in a step's text
function matchIngredients(stepText: string, ingredients: string[]): string[] {
  const lower = stepText.toLowerCase()
  return ingredients.filter((ing) => {
    if (ing.startsWith('##')) return false
    // Extract the noun part (skip leading quantity/unit words)
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

export default function CookingMode({
  ingredients,
  instructionsHtml,
  recipeTitle,
}: CookingModeProps) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const rawSteps = useMemo(() => parseSteps(instructionsHtml), [instructionsHtml])
  const steps = useMemo(() => buildSteps(rawSteps, ingredients), [rawSteps, ingredients])

  const stepRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Scroll active step into view
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
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
        setActiveIdx((i) => Math.min(i + 1, steps.length - 1))
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
        setActiveIdx((i) => Math.max(i - 1, 0))
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

  const activeStep = steps[activeIdx]

  return (
    <>
      <Button variant="default" onClick={() => { setActiveIdx(0); setOpen(true) }} className="gap-2">
        <ChefHat className="h-4 w-4" />
        Start Cooking Mode
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col text-stone-100">
          {/* Header */}
          <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/10 bg-[#111]">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
                Cooking Mode
              </p>
              <h2 className="font-playfair text-lg md:text-xl font-semibold text-white truncate">
                {recipeTitle}
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              aria-label="Exit cooking mode"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

            {/* Left — ingredients for active step */}
            <aside className="lg:w-72 xl:w-80 bg-[#111] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col max-h-[35vh] lg:max-h-none">
              <div className="px-5 pt-5 pb-2">
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-medium mb-1">
                  Step {activeIdx + 1} ingredients
                </p>
                <p className="text-[11px] text-stone-500">Tap to mark used</p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {activeStep.ingredients.length === 0 ? (
                  <p className="text-sm text-stone-500 italic mt-2">No specific ingredients for this step.</p>
                ) : (
                  <ul className="space-y-1.5 mt-2">
                    {activeStep.ingredients.map((ing) => {
                      const globalIdx = ingredients.indexOf(ing)
                      const isChecked = checked.has(globalIdx)
                      return (
                        <li key={globalIdx}>
                          <button
                            onClick={() => toggleIngredient(globalIdx)}
                            className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-base ${
                              isChecked
                                ? 'bg-emerald-900/30 text-stone-500 line-through'
                                : 'hover:bg-white/5 text-stone-200'
                            }`}
                          >
                            <span className={`mt-0.5 h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center ${
                              isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-600'
                            }`}>
                              {isChecked && <Check className="h-3 w-3 text-white" />}
                            </span>
                            <span>{ing}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </aside>

            {/* Right — all steps list */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-3">
              {steps.map((step, i) => {
                const isActive = i === activeIdx
                const isDone = i < activeIdx
                return (
                  <button
                    key={i}
                    ref={(el) => { stepRefs.current[i] = el }}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left rounded-2xl px-6 py-5 transition-all border ${
                      isActive
                        ? 'bg-[#2a2a2a] border-emerald-500/60 shadow-lg shadow-emerald-900/20'
                        : isDone
                        ? 'bg-[#1e1e1e] border-white/5 opacity-50'
                        : 'bg-[#1e1e1e] border-white/5 hover:border-white/20 hover:bg-[#222]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step number */}
                      <span className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : isDone
                          ? 'bg-emerald-900/40 text-emerald-600'
                          : 'bg-white/10 text-stone-400'
                      }`}>
                        {isDone ? <Check className="h-4 w-4" /> : i + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`leading-relaxed ${
                            isActive ? 'text-white text-xl' : 'text-stone-400 text-base'
                          }`}
                          dangerouslySetInnerHTML={{ __html: step.html }}
                        />

                        {/* Ingredient pills for active step */}
                        {isActive && step.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {step.ingredients.map((ing) => {
                              const globalIdx = ingredients.indexOf(ing)
                              const isChecked = checked.has(globalIdx)
                              return (
                                <span
                                  key={globalIdx}
                                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                    isChecked
                                      ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-700 line-through'
                                      : 'border-emerald-500/30 bg-emerald-900/20 text-emerald-300'
                                  }`}
                                >
                                  {ing}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}

              {/* Done card */}
              <div className="rounded-2xl border border-white/5 bg-[#1e1e1e] px-6 py-5 text-center text-stone-500 text-sm">
                <ChefHat className="h-6 w-6 mx-auto mb-2 opacity-40" />
                All steps complete — enjoy!
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  )
}
