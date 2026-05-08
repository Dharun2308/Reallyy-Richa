import type { Metadata } from 'next'
import Image from 'next/image'
import { AlertTriangle, Leaf } from 'lucide-react'
import FadeIn from '@/components/layout/FadeIn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME, UNSPLASH_FOOD } from '@/lib/config'
import type { Food } from '@/types/database'

export const metadata: Metadata = {
  title: 'Anti-Inflammatory Foods',
  description: `Discover the most powerful anti-inflammatory foods, how to use them, and what to avoid — by ${BRAND_NAME}.`,
}

const CATEGORY_ORDER = [
  'Spices & Herbs',
  'Fruits & Vegetables',
  'Healthy Fats',
  'Proteins',
  'Teas & Drinks',
]

const FOODS_TO_AVOID = [
  { name: 'Refined Sugar', reason: 'Spikes blood glucose, promotes cytokine production' },
  { name: 'Processed Seed Oils', reason: 'High omega-6 linoleic acid drives oxidative stress' },
  { name: 'Refined Grains', reason: 'Rapidly absorbed, promote insulin resistance' },
  { name: 'Trans Fats', reason: 'Directly increase inflammatory markers (CRP)' },
  { name: 'Alcohol (excess)', reason: 'Disrupts gut microbiome balance and liver function' },
  { name: 'Artificial Additives', reason: 'Many emulsifiers and sweeteners alter gut flora' },
]

export default async function AntiInflammatoryFoodsPage() {
  const supabase = await createClient()
  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('published', true)
    .order('score', { ascending: false })

  const grouped = (foods ?? []).reduce<Record<string, Food[]>>((acc, food) => {
    const cat = food.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(food)
    return acc
  }, {})

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative h-56 sm:h-64 md:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1600&q=80"
          alt="Colorful anti-inflammatory foods"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 to-sage/30" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container-wide pb-8 md:pb-12">
            <p className="text-sage-200 text-sm font-medium uppercase tracking-widest mb-2">
              Food as Medicine
            </p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white">
              Anti-Inflammatory Foods
            </h1>
          </div>
        </div>
      </section>

      <div className="container-wide py-10 md:py-16">
        {/* Philosophy intro */}
        <FadeIn className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
          <p className="text-charcoal-muted text-lg leading-relaxed mb-4">
            Inflammation is a natural, protective response — but when it becomes chronic, it&apos;s the silent driver of most modern diseases. The right foods can either fan those flames or extinguish them.
          </p>
          <p className="font-lora italic text-xl text-charcoal border-l-4 border-sage pl-4 text-left">
            &ldquo;Think of your plate as a daily vote for or against inflammation. I built this guide so every vote counts.&rdquo;
          </p>
        </FadeIn>

        {/* Foods by category */}
        {sortedCategories.length > 0 ? (
          <div className="space-y-14 md:space-y-20">
            {sortedCategories.map((category) => (
              <section key={category}>
                <FadeIn>
                  <div className="flex items-center gap-3 mb-8">
                    <Leaf className="h-5 w-5 text-sage shrink-0" />
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal">
                      {category}
                    </h2>
                    <div className="flex-1 h-px bg-cream-200" />
                  </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {grouped[category].map((food, i) => (
                    <FadeIn key={food.id} delay={i * 0.07}>
                      <FoodCard food={food} />
                    </FadeIn>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal-muted text-lg mb-2">Food guide coming soon!</p>
            <p className="text-charcoal-muted text-sm">
              Richa is curating the most powerful anti-inflammatory foods for you.
            </p>
          </div>
        )}

        {/* What to avoid */}
        <FadeIn>
          <section className="mt-20 md:mt-28">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal">
                  What to Avoid (or Minimise)
                </h2>
              </div>
              <p className="text-charcoal-muted mb-8 max-w-2xl">
                These foods are consistently linked to increased inflammatory markers. You don&apos;t need to be perfect — but awareness is the first step.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FOODS_TO_AVOID.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-xl p-4 border border-amber-100"
                  >
                    <h3 className="font-semibold text-charcoal mb-1">{item.name}</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* PDF Placeholder */}
        <FadeIn delay={0.1}>
          <div className="mt-14 md:mt-20 bg-gradient-to-br from-sage to-sage-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-3">
              Free Anti-Inflammatory Food Guide
            </h2>
            <p className="text-sage-100 mb-6 max-w-lg mx-auto">
              The complete printable guide — all foods, scores, and usage tips in one beautiful PDF. Coming soon!
            </p>
            <button
              className="bg-white text-sage font-semibold px-8 py-3 rounded-lg hover:bg-cream-100 transition-colors cursor-not-allowed opacity-75"
              disabled
              aria-label="Download guide (coming soon)"
            >
              Coming Soon — Download Free Guide
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

function FoodCard({ food }: { food: Food }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="relative h-36">
        <Image
          src={food.image_url ?? UNSPLASH_FOOD}
          alt={food.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {food.score != null && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-semibold text-sage-500">
            <Leaf className="h-3 w-3" />
            {food.score}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-playfair font-semibold text-charcoal mb-2">{food.name}</h3>
        {food.description && (
          <p className="text-xs text-charcoal-muted line-clamp-2 mb-3">{food.description}</p>
        )}
        {food.benefits && food.benefits.length > 0 && (
          <div>
            <p className="text-xs font-medium text-charcoal mb-1.5">Key benefits:</p>
            <ul className="space-y-1">
              {food.benefits.slice(0, 3).map((b, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-charcoal-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sage shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
        {food.avoid_if && food.avoid_if.length > 0 && (
          <div className="mt-3 p-2 bg-amber-50 rounded-lg">
            <p className="text-xs font-medium text-amber-700 mb-1">Avoid if:</p>
            <p className="text-xs text-amber-600">{food.avoid_if.slice(0, 2).join(', ')}</p>
          </div>
        )}
        {food.category && (
          <Badge variant="sage" className="mt-3 text-xs">{food.category}</Badge>
        )}
      </CardContent>
    </Card>
  )
}
