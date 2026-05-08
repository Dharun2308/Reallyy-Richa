import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import RecipeForm from '@/components/admin/RecipeForm'

export const metadata: Metadata = { title: `Edit Recipe — Admin — ${BRAND_NAME}` }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const result = await supabase.from('recipes').select('*').eq('id', id).single()
  const recipe = result.data as import('@/types/database').Recipe | null

  if (!recipe) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">Edit Recipe</h1>
      <RecipeForm recipe={recipe} />
    </div>
  )
}
