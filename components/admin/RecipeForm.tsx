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
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import SlugInput from '@/components/admin/SlugInput'
import PublishToggle from '@/components/admin/PublishToggle'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Recipe } from '@/types/database'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug required'),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.string().optional(),
  tags: z.array(z.string()),
  category: z.string().optional(),
  prep_time_mins: z.number().int().nonnegative().optional().nullable(),
  cook_time_mins: z.number().int().nonnegative().optional().nullable(),
  servings: z.number().int().positive().optional().nullable(),
  anti_inflammatory_score: z.number().int().min(0).max(100).optional().nullable(),
  published: z.boolean(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert',
  'Salad', 'Soup', 'Smoothie', 'Side Dish', 'Sauce & Dressing',
]

interface Props {
  recipe?: Recipe
}

export default function RecipeForm({ recipe }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: recipe?.title ?? '',
      slug: recipe?.slug ?? '',
      description: recipe?.description ?? '',
      cover_image_url: recipe?.cover_image_url ?? '',
      ingredients: recipe?.ingredients ?? [],
      instructions: recipe?.instructions ?? '',
      tags: recipe?.tags ?? [],
      category: recipe?.category ?? '',
      prep_time_mins: recipe?.prep_time_mins ?? null,
      cook_time_mins: recipe?.cook_time_mins ?? null,
      servings: recipe?.servings ?? null,
      anti_inflammatory_score: recipe?.anti_inflammatory_score ?? null,
      published: recipe?.published ?? false,
    },
  })

  const title = watch('title')

  useEffect(() => {
    if (!recipe) setValue('slug', slugify(title))
  }, [title, recipe, setValue])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = {
      ...data,
      cover_image_url: data.cover_image_url || null,
      description: data.description || null,
      category: data.category || null,
    }

    let error
    if (recipe) {
      const res = await supabase.from('recipes').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', recipe.id)
      error = res.error
    } else {
      const res = await supabase.from('recipes').insert(payload)
      error = res.error
    }

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: recipe ? 'Recipe updated!' : 'Recipe created!', variant: 'success' as never })
    router.push('/admin/recipes')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Basic info */}
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <h2 className="font-semibold text-charcoal">Basic Information</h2>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" className="mt-1.5" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <SlugInput
              value={field.value}
              onChange={field.onChange}
              sourceTitle={title}
              error={errors.slug?.message}
            />
          )}
        />

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" className="mt-1.5" rows={3} placeholder="Brief description of the recipe…" {...register('description')} />
        </div>

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <div>
              <Label>Category</Label>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl p-6 border border-cream-200">
        <Controller
          name="cover_image_url"
          control={control}
          render={({ field }) => (
            <ImageUploader value={field.value ?? ''} onChange={field.onChange} folder="recipes" />
          )}
        />
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl p-6 border border-cream-200">
        <Controller
          name="ingredients"
          control={control}
          render={({ field }) => (
            <ArrayFieldInput
              label="Ingredients"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. 1 cup turmeric powder"
            />
          )}
        />
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-2">
        <Label>Instructions</Label>
        <Controller
          name="instructions"
          control={control}
          render={({ field }) => (
            <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl p-6 border border-cream-200">
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <ArrayFieldInput
              label="Tags"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. vegan, gluten-free"
            />
          )}
        />
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <h2 className="font-semibold text-charcoal">Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="prep_time">Prep time (min)</Label>
            <Input id="prep_time" type="number" min={0} className="mt-1.5" {...register('prep_time_mins', { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="cook_time">Cook time (min)</Label>
            <Input id="cook_time" type="number" min={0} className="mt-1.5" {...register('cook_time_mins', { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="servings">Servings</Label>
            <Input id="servings" type="number" min={1} className="mt-1.5" {...register('servings', { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="ai_score">AI Score (0–100)</Label>
            <Input id="ai_score" type="number" min={0} max={100} className="mt-1.5" {...register('anti_inflammatory_score', { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      {/* Publish + submit */}
      <div className="bg-white rounded-xl p-6 border border-cream-200 space-y-4">
        <Controller
          name="published"
          control={control}
          render={({ field }) => (
            <PublishToggle value={field.value} onChange={field.onChange} />
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:w-32">
            {isSubmitting ? 'Saving…' : recipe ? 'Save Changes' : 'Create Recipe'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
