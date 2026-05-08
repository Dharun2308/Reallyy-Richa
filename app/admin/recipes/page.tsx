import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import DeleteButton from '@/components/admin/DeleteButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata: Metadata = { title: `Recipes — Admin — ${BRAND_NAME}` }

export default async function AdminRecipesPage() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-charcoal">Recipes</h1>
        <Link href="/admin/recipes/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" /> New Recipe
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {recipes && recipes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden md:table-cell">AI Score</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-charcoal-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-charcoal line-clamp-1">{recipe.title}</p>
                        <p className="text-xs text-charcoal-muted">/{recipe.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {recipe.category ? (
                        <Badge variant="secondary" className="text-xs">{recipe.category}</Badge>
                      ) : (
                        <span className="text-charcoal-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {recipe.anti_inflammatory_score != null ? (
                        <span className="font-medium text-sage">{recipe.anti_inflammatory_score}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TogglePublishButton
                        id={recipe.id}
                        table="recipes"
                        published={recipe.published}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/recipes/${recipe.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/recipes/${recipe.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton id={recipe.id} table="recipes" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-charcoal-muted mb-4">No recipes yet.</p>
            <Link href="/admin/recipes/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Create first recipe</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
