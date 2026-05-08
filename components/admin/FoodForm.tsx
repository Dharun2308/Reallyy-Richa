'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ArrayFieldInput from '@/components/admin/ArrayFieldInput'
import ImageUploader from '@/components/admin/ImageUploader'
import SlugInput from '@/components/admin/SlugInput'
import PublishToggle from '@/components/admin/PublishToggle'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Food } from '@/types/database'

const CATEGORIES = ['Spices & Herbs', 'Fruits & Vegetables', 'Healthy Fats', 'Proteins', 'Teas & Drinks', 'Other']

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().optional(),
  description: z.string().optional(),
  benefits: z.array(z.string()),
  avoid_if: z.array(z.string()),
  score: z.number().int().min(0).max(100).optional().nullable(),
  image_url: z.string().optional(),
  references: z.array(z.string()),
  published: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props { food?: Food }

export default function FoodForm({ food }: Props) {
  const router = useRouter()
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: food?.name ?? '',
      slug: food?.slug ?? '',
      category: food?.category ?? '',
      description: food?.description ?? '',
      benefits: food?.benefits ?? [],
      avoid_if: food?.avoid_if ?? [],
      score: food?.score ?? null,
      image_url: food?.image_url ?? '',
      references: food?.references ?? [],
      published: food?.published ?? false,
    },
  })

  const name = watch('name')
  useEffect(() => { if (!food) setValue('slug', slugify(name)) }, [name, food, setValue])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = { ...data, image_url: data.image_url || null, category: data.category || null }

    const { error } = food
      ? await supabase.from('foods').update(payload).eq('id', food.id)
      : await supabase.from('foods').insert(payload)

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: food ? 'Food updated!' : 'Food created!', variant: 'success' as never })
    router.push('/admin/foods')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <div>
          <Label>Name *</Label>
          <Input className="mt-1.5" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <Controller name="slug" control={control} render={({ field }) => (
          <SlugInput value={field.value} onChange={field.onChange} sourceTitle={name} error={errors.slug?.message} />
        )} />

        <Controller name="category" control={control} render={({ field }) => (
          <div>
            <Label>Category</Label>
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category…" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )} />

        <div>
          <Label>Description</Label>
          <Textarea className="mt-1.5" rows={3} {...register('description')} />
        </div>

        <div>
          <Label>Anti-inflammatory Score (0–100)</Label>
          <Input type="number" min={0} max={100} className="mt-1.5 w-32" {...register('score', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-cream-200">
        <Controller name="image_url" control={control} render={({ field }) => (
          <ImageUploader value={field.value ?? ''} onChange={field.onChange} folder="foods" label="Food Image" />
        )} />
      </div>

      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <Controller name="benefits" control={control} render={({ field }) => (
          <ArrayFieldInput label="Key Benefits" value={field.value} onChange={field.onChange} placeholder="e.g. Reduces CRP levels" />
        )} />
        <Controller name="avoid_if" control={control} render={({ field }) => (
          <ArrayFieldInput label="Avoid If (conditions)" value={field.value} onChange={field.onChange} placeholder="e.g. Thyroid issues" />
        )} />
        <Controller name="references" control={control} render={({ field }) => (
          <ArrayFieldInput label="References / Sources" value={field.value} onChange={field.onChange} placeholder="e.g. PubMed ID or URL" />
        )} />
      </div>

      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <Controller name="published" control={control} render={({ field }) => (
          <PublishToggle value={field.value} onChange={field.onChange} />
        )} />
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="sm:w-36">
            {isSubmitting ? 'Saving…' : food ? 'Save Changes' : 'Create Food'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
    </form>
  )
}
