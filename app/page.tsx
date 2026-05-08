import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Flame, Heart, Leaf } from 'lucide-react'
import Hero from '@/components/home/Hero'
import NewsletterCapture from '@/components/home/NewsletterCapture'
import RecipeCard from '@/components/recipes/RecipeCard'
import FadeIn from '@/components/layout/FadeIn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME, BRAND_AUTHOR } from '@/lib/config'
import type { Recipe, Protocol } from '@/types/database'

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Eat to Heal. Live to Thrive.`,
  description: 'Anti-inflammatory recipes, healing food guides, and wellness protocols by Richa.',
}

const philosophyPillars = [
  {
    icon: Leaf,
    title: 'Whole Foods First',
    body: 'Every recipe starts with minimally processed, nutrient-dense ingredients your body recognises and thrives on.',
  },
  {
    icon: Flame,
    title: 'Reduce Inflammation',
    body: 'Science-backed ingredients rated on an anti-inflammatory score so you know exactly what you\'re eating.',
  },
  {
    icon: Heart,
    title: 'Sustainable for Life',
    body: 'Delicious, practical meals that fit a real lifestyle — no extreme restrictions, just lasting transformation.',
  },
]

export default async function HomePage() {
  let featuredRecipes: Recipe[] | null = null
  let featuredProtocol: Protocol | null = null

  try {
    const supabase = await createClient()

    const recipesResult = await supabase
      .from('recipes')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
    featuredRecipes = recipesResult.data as Recipe[] | null

    const protocolResult = await supabase
      .from('protocols')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    featuredProtocol = protocolResult.data as Protocol | null
  } catch {
    // Supabase not configured — render page without dynamic content
  }

  return (
    <>
      <Hero />

      {/* Philosophy pillars */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
              The {BRAND_AUTHOR} Philosophy
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
              Nourish. Heal. Thrive.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {philosophyPillars.map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.1}>
                <Card className="p-6 md:p-8 text-center h-full border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sage-50 mb-5">
                      <pillar.icon className="h-7 w-7 text-sage" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-charcoal mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-charcoal-muted text-sm leading-relaxed">
                      {pillar.body}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 md:mb-14">
            <div>
              <p className="text-sage text-sm font-medium uppercase tracking-widest mb-2">
                Fresh from the Kitchen
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal">
                Featured Recipes
              </h2>
            </div>
            <Link href="/recipes">
              <Button variant="outline" className="shrink-0">
                View All Recipes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>

          {featuredRecipes && featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredRecipes.map((recipe, i) => (
                <FadeIn key={recipe.id} delay={i * 0.1}>
                  <RecipeCard recipe={recipe} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-charcoal-muted text-lg mb-4">Recipes coming soon!</p>
              <p className="text-charcoal-muted text-sm">
                Check back after the admin has published some recipes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Anti-inflammatory teaser */}
      <section className="section-padding bg-cream-100">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="right">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80"
                  alt="Colorful anti-inflammatory foods"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.15}>
              <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
                Food as Medicine
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal mb-5">
                Why Anti-Inflammatory?
              </h2>
              <p className="text-charcoal-muted leading-relaxed mb-5">
                Chronic inflammation is the root of many modern ailments — from fatigue and joint pain to digestive issues and brain fog. The right foods can dramatically shift your body&apos;s response.
              </p>
              <p className="font-lora italic text-lg text-charcoal border-l-4 border-sage pl-4 mb-6">
                &ldquo;Every meal is an opportunity to heal — or to harm. I&apos;ll show you how to make it heal.&rdquo;
              </p>
              <Link href="/anti-inflammatory-foods">
                <Button>
                  Explore Healing Foods <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured Protocol */}
      {featuredProtocol && (
        <section className="section-padding bg-white">
          <div className="container-wide">
            <FadeIn className="text-center mb-10">
              <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
                Transform Your Habits
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal">
                Featured Protocol
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="max-w-3xl mx-auto">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div className="bg-gradient-to-br from-sage to-sage-500 p-8 md:p-12 text-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredProtocol.duration && (
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {featuredProtocol.duration}
                        </span>
                      )}
                      {featuredProtocol.difficulty && (
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {featuredProtocol.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-3">
                      {featuredProtocol.title}
                    </h3>
                    {featuredProtocol.summary && (
                      <p className="text-sage-100 leading-relaxed mb-6">
                        {featuredProtocol.summary}
                      </p>
                    )}
                    {featuredProtocol.goal && (
                      <p className="text-sm font-medium text-white/80 mb-6">
                        Goal: {featuredProtocol.goal}
                      </p>
                    )}
                    <Link href={`/protocols/${featuredProtocol.slug}`}>
                      <Button variant="secondary" className="bg-white text-sage hover:bg-cream-100">
                        Start This Protocol <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="section-padding bg-cream">
        <div className="container-narrow text-center">
          <FadeIn>
            <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&q=80&fit=crop&crop=face"
                alt={BRAND_AUTHOR}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
              The Person Behind the Food
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal mb-5">
              Hi, I&apos;m Richa
            </h2>
            <p className="text-charcoal-muted text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Former management consultant turned full-time wellness advocate. After years of chronic fatigue and inflammatory flare-ups, I discovered that food could be the most powerful medicine available. Now I share everything I&apos;ve learned.
            </p>
            <Link href="/about">
              <Button variant="outline">
                Read My Story <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterCapture />
    </>
  )
}
