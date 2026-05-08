'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ArrayFieldInput from '@/components/admin/ArrayFieldInput'
import SlugInput from '@/components/admin/SlugInput'
import PublishToggle from '@/components/admin/PublishToggle'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Protocol, ProtocolStep } from '@/types/database'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().optional(),
  duration: z.string().optional(),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props { protocol?: Protocol }

export default function ProtocolForm({ protocol }: Props) {
  const router = useRouter()
  const [steps, setSteps] = useState<ProtocolStep[]>(
    (protocol?.steps as ProtocolStep[] | null) ?? []
  )

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: protocol?.title ?? '',
      slug: protocol?.slug ?? '',
      summary: protocol?.summary ?? '',
      duration: protocol?.duration ?? '',
      goal: protocol?.goal ?? '',
      difficulty: protocol?.difficulty ?? '',
      tags: protocol?.tags ?? [],
      published: protocol?.published ?? false,
    },
  })

  const title = watch('title')
  useEffect(() => { if (!protocol) setValue('slug', slugify(title)) }, [title, protocol, setValue])

  const addStep = () => setSteps([...steps, { title: '', body: '', linked_recipe_slug: '' }])
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i: number, field: keyof ProtocolStep, value: string) => {
    setSteps(steps.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const cleanedSteps = steps.map(s => ({
      title: s.title,
      body: s.body,
      ...(s.linked_recipe_slug ? { linked_recipe_slug: s.linked_recipe_slug } : {}),
    }))
    const payload = { ...data, steps: cleanedSteps }

    const { error } = protocol
      ? await supabase.from('protocols').update(payload).eq('id', protocol.id)
      : await supabase.from('protocols').insert(payload)

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: protocol ? 'Protocol updated!' : 'Protocol created!', variant: 'success' as never })
    router.push('/admin/protocols')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <h2 className="font-semibold text-charcoal">Basic Info</h2>

        <div>
          <Label>Title *</Label>
          <Input className="mt-1.5" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <Controller name="slug" control={control} render={({ field }) => (
          <SlugInput value={field.value} onChange={field.onChange} sourceTitle={title} error={errors.slug?.message} />
        )} />

        <div>
          <Label>Summary</Label>
          <Textarea className="mt-1.5" rows={3} {...register('summary')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Duration</Label>
            <Input className="mt-1.5" placeholder="e.g. 7 days" {...register('duration')} />
          </div>
          <div>
            <Label>Goal</Label>
            <Input className="mt-1.5" placeholder="e.g. Gut reset" {...register('goal')} />
          </div>
          <Controller name="difficulty" control={control} render={({ field }) => (
            <div>
              <Label>Difficulty</Label>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} />
        </div>

        <Controller name="tags" control={control} render={({ field }) => (
          <ArrayFieldInput label="Tags" value={field.value} onChange={field.onChange} />
        )} />
      </div>

      {/* Day-by-day steps */}
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-charcoal">Day-by-Day Steps</h2>
          <Button type="button" size="sm" variant="outline" onClick={addStep}>
            <Plus className="h-4 w-4 mr-1" /> Add Day
          </Button>
        </div>
        {steps.length === 0 && (
          <p className="text-sm text-charcoal-muted text-center py-4">No steps yet. Click &ldquo;Add Day&rdquo; to begin.</p>
        )}
        {steps.map((step, i) => (
          <div key={i} className="border border-cream-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sage text-sm">Day {i + 1}</span>
              <button type="button" onClick={() => removeStep(i)} className="text-charcoal-muted hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div>
              <Label>Step Title</Label>
              <Input
                className="mt-1"
                value={step.title}
                onChange={(e) => updateStep(i, 'title', e.target.value)}
                placeholder="e.g. Morning detox ritual"
              />
            </div>
            <div>
              <Label>Step Body</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={step.body}
                onChange={(e) => updateStep(i, 'body', e.target.value)}
                placeholder="What to do / eat / focus on today…"
              />
            </div>
            <div>
              <Label>Linked Recipe Slug (optional)</Label>
              <Input
                className="mt-1"
                value={step.linked_recipe_slug ?? ''}
                onChange={(e) => updateStep(i, 'linked_recipe_slug', e.target.value)}
                placeholder="e.g. turmeric-golden-milk"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <Controller name="published" control={control} render={({ field }) => (
          <PublishToggle value={field.value} onChange={field.onChange} />
        )} />
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="sm:w-36">
            {isSubmitting ? 'Saving…' : protocol ? 'Save Changes' : 'Create Protocol'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
    </form>
  )
}
