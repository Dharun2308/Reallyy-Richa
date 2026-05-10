'use client'

import { useState } from 'react'
import { Minus, Plus, ArrowLeftRight, X } from 'lucide-react'
import { scaleIngredient, scaleAllQuantities, findSubstitutes } from '@/lib/ingredient-utils'

interface IngredientsBlockProps {
  ingredients: string[]
  baseServings: number | null
}

export default function IngredientsBlock({ ingredients, baseServings }: IngredientsBlockProps) {
  const minServings = 1
  const initial = baseServings ?? 1
  const [servings, setServings] = useState(initial)
  const [openSub, setOpenSub] = useState<number | null>(null)

  const factor = baseServings ? servings / baseServings : 1

  return (
    <div className="bg-white rounded-xl p-5 md:p-7 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <h2 className="font-playfair text-2xl font-semibold text-charcoal">
          Ingredients
        </h2>
        {baseServings != null && (
          <div className="flex items-center gap-2 bg-cream-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(minServings, s - 1))}
              disabled={servings <= minServings}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm disabled:opacity-40 hover:bg-sage-50 transition-colors"
              aria-label="Decrease servings"
            >
              <Minus className="h-4 w-4 text-charcoal" />
            </button>
            <span className="text-sm font-medium text-charcoal min-w-[5.5rem] text-center">
              {servings} {servings === 1 ? 'serving' : 'servings'}
            </span>
            <button
              type="button"
              onClick={() => setServings((s) => s + 1)}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm hover:bg-sage-50 transition-colors"
              aria-label="Increase servings"
            >
              <Plus className="h-4 w-4 text-charcoal" />
            </button>
          </div>
        )}
      </div>

      <ul className="space-y-2.5">
        {ingredients.map((raw, i) => {
          const scaled = scaleIngredient(raw, factor)
          const sub = findSubstitutes(raw)
          const isOpen = openSub === i

          return (
            <li key={i} className="flex flex-col">
              <div className="flex items-start gap-3 text-charcoal">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-sage shrink-0" />
                <span className="flex-1">{scaled}</span>
                {sub && (
                  <button
                    type="button"
                    onClick={() => setOpenSub(isOpen ? null : i)}
                    className="text-xs text-sage hover:text-sage-700 inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-md hover:bg-sage-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                    Subs
                  </button>
                )}
              </div>
              {sub && isOpen && (
                <div className="mt-2 ml-5 bg-sage-50 border border-sage-200 rounded-lg p-3 relative">
                  <button
                    type="button"
                    onClick={() => setOpenSub(null)}
                    className="absolute top-2 right-2 text-charcoal-muted hover:text-charcoal"
                    aria-label="Close substitutions"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 pr-6">
                    Substitutes for {sub.label}
                  </p>
                  <ul className="space-y-1">
                    {sub.options.map((opt, j) => (
                      <li key={j} className="text-sm text-charcoal-muted flex gap-2">
                        <span className="text-sage shrink-0">→</span>
                        <span>{scaleAllQuantities(opt, factor)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {baseServings != null && servings !== baseServings && (
        <p className="mt-4 text-xs text-charcoal-muted">
          Scaled from {baseServings} serving{baseServings === 1 ? '' : 's'}. Cooking times may need adjusting.
        </p>
      )}
    </div>
  )
}
