'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  sourceTitle?: string
  error?: string
}

export default function SlugInput({ value, onChange, sourceTitle, error }: Props) {
  const regenerate = () => {
    if (sourceTitle) onChange(slugify(sourceTitle))
  }

  return (
    <div>
      <Label htmlFor="slug">Slug (URL path)</Label>
      <div className="flex gap-2 mt-1.5">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted text-sm pointer-events-none">
            /
          </span>
          <Input
            id="slug"
            value={value}
            onChange={(e) => onChange(slugify(e.target.value))}
            className="pl-6"
            placeholder="my-recipe-slug"
          />
        </div>
        {sourceTitle && (
          <button
            type="button"
            onClick={regenerate}
            className="shrink-0 px-3 border border-cream-200 rounded-md text-charcoal-muted hover:text-sage hover:border-sage transition-colors"
            title="Re-generate from title"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-charcoal-muted">
        Preview: /{value || 'your-slug-here'}
      </p>
    </div>
  )
}
