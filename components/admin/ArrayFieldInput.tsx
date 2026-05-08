'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  label: string
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}

export default function ArrayFieldInput({ label, value, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setDraft('')
  }

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}…`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add() }
          }}
        />
        <Button type="button" onClick={add} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1 mt-2">
          {value.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 bg-cream-50 border border-cream-200 rounded-md px-3 py-2 text-sm"
            >
              <span className="flex-1 min-w-0 truncate">{item}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 text-charcoal-muted hover:text-red-500 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
