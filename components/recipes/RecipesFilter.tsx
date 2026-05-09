'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

const TAGS = ['vegan', 'gluten-free', 'dairy-free', 'high-protein', 'quick']
const ALL_VALUE = '__all__'
const TIME_OPTIONS = [
  { label: 'Any time', value: ALL_VALUE },
  { label: 'Under 15 min', value: '15' },
  { label: 'Under 30 min', value: '30' },
  { label: 'Under 60 min', value: '60' },
]

interface RecipesFilterProps {
  categories: string[]
  currentParams: Record<string, string | undefined>
}

export default function RecipesFilter({ categories, currentParams }: RecipesFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next: Record<string, string | undefined> = { ...currentParams, ...updates, page: '1' }
      Object.keys(next).forEach((k) => {
        if (!next[k]) delete next[k]
      })
      const sp = new URLSearchParams(next as Record<string, string>)
      router.push(`${pathname}?${sp}`)
    },
    [currentParams, pathname, router]
  )

  const hasFilters = !!(
    currentParams.q ||
    currentParams.category ||
    currentParams.tag ||
    currentParams.max_time
  )

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-cream-200">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search recipes…"
            defaultValue={currentParams.q ?? ''}
            onChange={(e) => {
              const val = e.target.value
              if (val === '' || val.length >= 2) update({ q: val || undefined })
            }}
            className="h-11"
            aria-label="Search recipes"
          />
        </div>

        {/* Category */}
        <Select
          value={currentParams.category ?? ALL_VALUE}
          onValueChange={(v) => update({ category: v === ALL_VALUE ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-44 h-11" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Prep time */}
        <Select
          value={currentParams.max_time ?? ALL_VALUE}
          onValueChange={(v) => update({ max_time: v === ALL_VALUE ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-44 h-11" aria-label="Filter by prep time">
            <SelectValue placeholder="Prep time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() =>
              update({ tag: currentParams.tag === tag ? undefined : tag })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentParams.tag === tag
                ? 'bg-sage text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            }`}
          >
            {tag}
          </button>
        ))}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-charcoal-muted hover:text-charcoal"
            onClick={() =>
              router.push(pathname)
            }
          >
            <X className="h-3.5 w-3.5 mr-1" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
