import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Users, Leaf, ChevronLeft, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { findStaticRecipe, STATIC_RECIPES } from '@/lib/static-recipes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import FadeIn from '@/components/layout/FadeIn'
import RecipeCard from '@/components/recipes/RecipeCard'
import SaveRecipeButton from '@/components/recipes/SaveRecipeButton'
import { formatTime, scoreLabel } from '@/lib/utils'
import { UNSPLASH_FOOD } from '@/lib/config'
import type { Nutrition, Recipe } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let data: { title: string; description: string | null } | null = null
  try {
    const supabase = await createClient()
    const metaResult = await supabase
      .from('recipes')
      .select('title, description')
      .eq('slug', slug)
      .single()
    data = metaResult.data as { title: string; description: string | null } | null
  } catch {}

  if (!data) {
    const stat = findStaticRecipe(slug)
    if (stat) data = { title: stat.title, description: stat.description }
  }

  if (!data) return { title: 'Recipe not found' }
  return {
    title: data.title,
    description: data.description ?? undefined,
  }
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params

  let recipe: Recipe | null = null
  let user: { id: string } | null = null
  let related: Recipe[] | null = null

  try {
    const supabase = await createClient()
    const recipeResult = await supabase
      .from('recipes')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    recipe = recipeResult.data as Recipe | null

    if (recipe) {
      const userResult = await supabase.auth.getUser()
      user = userResult.data.user

      const relatedResult = await supabase
        .from('recipes')
        .select('*')
        .eq('published', true)
        .eq('category', recipe.category ?? '')
        .neq('id', recipe.id)
        .limit(3)
      related = relatedResult.data as Recipe[] | null
    }
  } catch {}

  if (!recipe) {
    recipe = findStaticRecipe(slug) ?? null
    if (recipe) {
      related = STATIC_RECIPES.filter(
        (r) => r.category === recipe!.category && r.slug !== recipe!.slug
      ).slice(0, 3)
    }
  }

  if (!recipe) notFound()

  // Check if saved
  let isSaved = false
  if (user) {
    try {
      const supabase = await createClient()
      const { data: savedData } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id)
        .single()
      isSaved = !!savedData
    } catch {}
  }

  const score = recipe.anti_inflammatory_score
  const scoreInfo = score != null ? scoreLabel(score) : null
  const nutrition = recipe.nutrition as Nutrition | null

  return (
    <article className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
        <Image
          src={recipe.cover_image_url ?? UNSPLASH_FOOD}
          alt={recipe.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container-wide">
            <Link
              href="/recipes"
              className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> All Recipes
            </Link>
            {recipe.category && (
              <p className="text-sage-300 text-sm font-medium uppercase tracking-wider mb-2">
                {recipe.category}
              </p>
            )}
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {recipe.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta + actions */}
            <FadeIn>
              <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-4 text-sm text-charcoal-muted">
                  {recipe.prep_time_mins != null && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-sage" />
                      Prep: {formatTime(recipe.prep_time_mins)}
                    </span>
                  )}
                  {recipe.cook_time_mins != null && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-terracotta" />
                      Cook: {formatTime(recipe.cook_time_mins)}
                    </span>
                  )}
                  {recipe.servings != null && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-sage" />
                      {recipe.servings} servings
                    </span>
                  )}
                  {scoreInfo && (
                    <span className={`flex items-center gap-1.5 font-medium ${scoreInfo.color}`}>
                      <Leaf className="h-4 w-4" />
                      AI Score: {score} — {scoreInfo.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <SaveRecipeButton
                    recipeId={recipe.id}
                    initialSaved={isSaved}
                    userId={user?.id}
                  />
                  <Button variant="ghost" size="icon" aria-label="Share recipe">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Description */}
            {recipe.description && (
              <FadeIn delay={0.05}>
                <p className="text-lg text-charcoal-muted leading-relaxed italic font-lora">
                  {recipe.description}
                </p>
              </FadeIn>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <FadeIn delay={0.07}>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Link key={tag} href={`/recipes?tag=${tag}`}>
                      <Badge variant="sage">{tag}</Badge>
                    </Link>
                  ))}
                </div>
              </FadeIn>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <FadeIn delay={0.1}>
                <div className="bg-white rounded-xl p-5 md:p-7 shadow-sm">
                  <h2 className="font-playfair text-2xl font-semibold text-charcoal mb-5">
                    Ingredients
                  </h2>
                  <ul className="space-y-2.5">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3 text-charcoal">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-sage shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <FadeIn delay={0.15}>
                <div className="bg-white rounded-xl p-5 md:p-7 shadow-sm">
                  <h2 className="font-playfair text-2xl font-semibold text-charcoal mb-5">
                    Instructions
                  </h2>
                  <div
                    className="prose prose-slate max-w-none prose-headings:font-playfair prose-a:text-sage"
                    dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                  />
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutritional highlights */}
            {nutrition && (
              <FadeIn delay={0.2} direction="left">
                <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
                  <h3 className="font-playfair text-lg font-semibold text-charcoal mb-4">
                    Nutritional Highlights
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
                      { label: 'Protein', value: nutrition.protein, unit: 'g' },
                      { label: 'Carbs', value: nutrition.carbs, unit: 'g' },
                      { label: 'Fat', value: nutrition.fat, unit: 'g' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-cream-100 rounded-lg">
                        <p className="text-xl font-bold text-charcoal">
                          {item.value}
                          <span className="text-xs font-normal text-charcoal-muted ml-0.5">
                            {item.unit}
                          </span>
                        </p>
                        <p className="text-xs text-charcoal-muted mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Anti-inflammatory callout */}
            {score != null && (
              <FadeIn delay={0.25} direction="left">
                <div className="bg-sage-50 border border-sage-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="h-5 w-5 text-sage" />
                    <h3 className="font-semibold text-charcoal">Anti-Inflammatory Score</h3>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className={`text-4xl font-bold ${scoreInfo?.color}`}>{score}</span>
                    <span className="text-charcoal-muted text-sm mb-1">/100</span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-charcoal-muted mt-3">
                    Scored based on ingredient anti-inflammatory properties and nutrient density.
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>

        {/* Related recipes */}
        {related && related.length > 0 && (
          <section className="mt-16 md:mt-20">
            <FadeIn>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal mb-8">
                You Might Also Love
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <FadeIn key={r.id} delay={i * 0.1}>
                  <RecipeCard recipe={r} />
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
