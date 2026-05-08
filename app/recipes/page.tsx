import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Search } from 'lucide-react'
import RecipeCard from '@/components/recipes/RecipeCard'
import FadeIn from '@/components/layout/FadeIn'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import RecipesFilter from '@/components/recipes/RecipesFilter'
import type { Recipe } from '@/types/database'

export const metadata: Metadata = {
  title: 'Recipes',
  description: `Explore anti-inflammatory recipes by ${BRAND_NAME} — filtered by category, tags, prep time, and more.`,
}

interface SearchParams {
  q?: string
  category?: string
  tag?: string
  max_time?: string
  page?: string
}

const PAGE_SIZE = 12

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.q) query = query.ilike('title', `%${params.q}%`)
  if (params.category) query = query.eq('category', params.category)
  if (params.tag) query = query.contains('tags', [params.tag])
  if (params.max_time) query = query.lte('prep_time_mins', Number(params.max_time))

  const queryResult = await query
  const recipes = queryResult.data as Recipe[] | null
  const count = queryResult.count

  const catResult = await supabase
    .from('recipes')
    .select('category')
    .eq('published', true)
    .not('category', 'is', null)
  const categories = catResult.data as { category: string | null }[] | null

  const uniqueCategories = [
    ...new Set(categories?.map((r) => r.category).filter(Boolean)),
  ] as string[]

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-200 py-10 md:py-16">
        <div className="container-wide">
          <FadeIn>
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
              The Recipe Collection
            </p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
              Healing Recipes
            </h1>
          </FadeIn>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        {/* Filters */}
        <FadeIn>
          <RecipesFilter categories={uniqueCategories} currentParams={params} />
        </FadeIn>

        {/* Results */}
        <Suspense fallback={<div className="py-16 text-center text-charcoal-muted">Loading recipes…</div>}>
          {recipes && recipes.length > 0 ? (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe, i) => (
                  <FadeIn key={recipe.id} delay={i * 0.04}>
                    <RecipeCard recipe={recipe} />
                  </FadeIn>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const sp = new URLSearchParams({ ...params, page: String(p) })
                    return (
                      <a
                        key={p}
                        href={`/recipes?${sp}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-sage text-white'
                            : 'bg-white text-charcoal hover:bg-cream-100 border border-cream-200'
                        }`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </a>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="mt-16 text-center py-16">
              <Search className="h-12 w-12 text-charcoal-muted mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-semibold text-charcoal mb-2">
                No recipes found
              </h2>
              <p className="text-charcoal-muted">
                Try adjusting your filters or search term.
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
