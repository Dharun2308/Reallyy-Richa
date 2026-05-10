import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Users, Leaf, ChevronLeft, Timer, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { findStaticRecipe, type RecipeWithNotes } from '@/lib/static-recipes'
import { Badge } from '@/components/ui/badge'
import FadeIn from '@/components/layout/FadeIn'
import SaveRecipeButton from '@/components/recipes/SaveRecipeButton'
import CookingMode from '@/components/recipes/CookingMode'
import IngredientsBlock from '@/components/recipes/IngredientsBlock'
import ShareButton from '@/components/recipes/ShareButton'
import NutritionLabel from '@/components/recipes/NutritionLabel'
import ScoreInfoPopover from '@/components/recipes/ScoreInfoPopover'
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
    }
  } catch {}

  if (!recipe) {
    recipe = findStaticRecipe(slug) ?? null
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
  const recipeWithNotes = recipe as RecipeWithNotes
  const notes = recipeWithNotes.notes ?? null
  const totalTime =
    (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0) || null

  return (
    <article className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="container-wide py-4 md:py-6">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-1 text-charcoal-muted hover:text-charcoal text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> All Recipes
          </Link>
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal leading-tight">
            {recipe.title}
          </h1>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="sage">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-wide py-4 md:py-6">
        {/* Mobile recipe image — sits under the title */}
        <div className="lg:hidden mb-6">
          <FadeIn>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
              <Image
                src={recipe.cover_image_url ?? UNSPLASH_FOOD}
                alt={recipe.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta + actions */}
            <FadeIn>
              <div className="bg-white rounded-xl px-5 py-3 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-charcoal-muted items-center">
                    {totalTime != null && (
                      <span className="inline-flex items-center gap-2 bg-sage-50 text-sage px-3 py-1.5 rounded-full text-sm font-semibold">
                        <Timer className="h-4 w-4" />
                        {formatTime(totalTime)} total
                      </span>
                    )}
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
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <SaveRecipeButton
                      recipeId={recipe.id}
                      initialSaved={isSaved}
                      userId={user?.id}
                    />
                    <ShareButton title={recipe.title} text={recipe.description ?? undefined} />
                  </div>
              </div>
            </FadeIn>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <FadeIn delay={0.1}>
                <IngredientsBlock
                  ingredients={recipe.ingredients}
                  baseServings={recipe.servings}
                />
              </FadeIn>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <FadeIn delay={0.15}>
                <div className="bg-white rounded-xl p-5 md:p-7 shadow-sm">
                  <div className="flex items-start sm:items-center justify-between gap-4 mb-5 flex-col sm:flex-row">
                    <h2 className="font-playfair text-2xl font-semibold text-charcoal">
                      Instructions
                    </h2>
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <CookingMode
                        ingredients={recipe.ingredients}
                        instructionsHtml={recipe.instructions}
                        recipeTitle={recipe.title}
                      />
                    )}
                  </div>
                  <div
                    className="text-charcoal max-w-none leading-relaxed
                      [&>h2]:font-playfair [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:first:mt-0
                      [&>p]:my-4 [&>p]:leading-relaxed
                      [&_strong]:font-semibold [&_strong]:text-charcoal
                      [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-4 [&>ol]:space-y-3
                      [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-4 [&>ul]:space-y-3
                      [&_li]:leading-relaxed [&_li]:pl-1
                      [&_a]:text-sage [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                  />
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipe image — desktop sidebar */}
            <FadeIn direction="left" className="hidden lg:block">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                <Image
                  src={recipe.cover_image_url ?? UNSPLASH_FOOD}
                  alt={recipe.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            </FadeIn>

            {/* Anti-inflammatory callout */}
            {score != null && (
              <FadeIn delay={0.25} direction="left">
                <div className="bg-sage-50 border border-sage-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="h-5 w-5 text-sage" />
                    <h3 className="font-semibold text-charcoal flex-1">Anti-Inflammatory Score</h3>
                    <ScoreInfoPopover />
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

            {/* Cook's Notes */}
            {notes && (
              <FadeIn delay={0.3} direction="left">
                <div className="bg-white border-l-4 border-sage rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-sage" />
                    <h3 className="font-playfair text-lg font-semibold text-charcoal">
                      Cook&apos;s Notes
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal leading-relaxed font-lora">{notes}</p>
                </div>
              </FadeIn>
            )}

            {/* Nutrition Facts label */}
            {nutrition && (
              <FadeIn delay={0.35} direction="left">
                <NutritionLabel nutrition={nutrition} servings={recipe.servings} />
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
