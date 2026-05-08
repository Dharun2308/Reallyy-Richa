import type { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/config'
import RecipeForm from '@/components/admin/RecipeForm'

export const metadata: Metadata = { title: `New Recipe — Admin — ${BRAND_NAME}` }

export default function NewRecipePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">New Recipe</h1>
      <RecipeForm />
    </div>
  )
}
