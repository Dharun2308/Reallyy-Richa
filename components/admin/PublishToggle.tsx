'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  value: boolean
  onChange: (v: boolean) => void
  label?: string
}

export default function PublishToggle({ value, onChange, label = 'Published' }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-md border border-cream-200">
      <Switch id="publish" checked={value} onCheckedChange={onChange} />
      <div>
        <Label htmlFor="publish" className="cursor-pointer">
          {label}
        </Label>
        <p className={cn('text-xs', value ? 'text-sage-500' : 'text-charcoal-muted')}>
          {value ? 'Visible to public' : 'Draft — not visible to public'}
        </p>
      </div>
    </div>
  )
}
