import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Target, ChevronLeft, BookOpen } from 'lucide-react'
import FadeIn from '@/components/layout/FadeIn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import StartProtocolButton from '@/components/protocols/StartProtocolButton'
import type { ProtocolStep, Protocol, Recipe } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const metaResult = await supabase
    .from('protocols')
    .select('title, summary')
    .eq('slug', slug)
    .single()
  const data = metaResult.data as { title: string; summary: string | null } | null
  if (!data) return { title: 'Protocol not found' }
  return { title: data.title, description: data.summary ?? undefined }
}

export default async function ProtocolPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const protocolResult = await supabase
    .from('protocols')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  const protocol = protocolResult.data as Protocol | null

  if (!protocol) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isActive = false
  if (user) {
    const { data: up } = await supabase
      .from('user_protocols')
      .select('id')
      .eq('user_id', user.id)
      .eq('protocol_id', protocol.id)
      .single()
    isActive = !!up
  }

  const steps = (protocol.steps as ProtocolStep[] | null) ?? []

  // Fetch linked recipes for step slugs
  const linkedSlugs = steps
    .map((s) => s.linked_recipe_slug)
    .filter(Boolean) as string[]
  type LinkedRecipe = Pick<Recipe, 'id' | 'title' | 'slug' | 'cover_image_url' | 'prep_time_mins'>
  const linkedResult = linkedSlugs.length
    ? await supabase
        .from('recipes')
        .select('id, title, slug, cover_image_url, prep_time_mins')
        .in('slug', linkedSlugs)
    : { data: [] }
  const linkedRecipes = (linkedResult.data ?? []) as LinkedRecipe[]

  const recipeMap = Object.fromEntries(
    (linkedRecipes ?? []).map((r) => [r.slug, r])
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal-light py-12 md:py-20">
        <div className="container-wide">
          <Link
            href="/protocols"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> All Protocols
          </Link>
          <FadeIn>
            <div className="flex flex-wrap gap-2 mb-4">
              {protocol.duration && (
                <Badge className="bg-white/20 text-white border-0">
                  <Calendar className="h-3 w-3 mr-1" /> {protocol.duration}
                </Badge>
              )}
              {protocol.difficulty && (
                <Badge className="bg-sage/80 text-white border-0">
                  {protocol.difficulty}
                </Badge>
              )}
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {protocol.title}
            </h1>
            {protocol.goal && (
              <div className="flex items-center gap-2 text-sage-300 mb-4">
                <Target className="h-4 w-4" />
                <span className="font-medium">Goal: {protocol.goal}</span>
              </div>
            )}
            {protocol.summary && (
              <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                {protocol.summary}
              </p>
            )}
          </FadeIn>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-sage" />
                  <h2 className="font-playfair text-2xl font-semibold text-charcoal">
                    Day-by-Day Plan
                  </h2>
                </div>
                <span className="text-sm text-charcoal-muted">
                  {steps.length} {steps.length === 1 ? 'day' : 'days'}
                </span>
              </div>
            </FadeIn>

            {steps.length > 0 ? (
              <div className="space-y-4">
                {steps.map((step, i) => {
                  const linked = step.linked_recipe_slug
                    ? recipeMap[step.linked_recipe_slug]
                    : null
                  return (
                    <FadeIn key={i} delay={i * 0.07}>
                      <Card className="overflow-hidden">
                        <div className="flex items-center gap-0">
                          <div className="w-16 shrink-0 bg-sage-50 self-stretch flex items-center justify-center">
                            <span className="font-playfair text-2xl font-bold text-sage">
                              {i + 1}
                            </span>
                          </div>
                          <CardContent className="p-5 flex-1">
                            <h3 className="font-semibold text-charcoal mb-2">
                              {step.title}
                            </h3>
                            <p className="text-sm text-charcoal-muted leading-relaxed mb-3">
                              {step.body}
                            </p>
                            {linked && (
                              <Link
                                href={`/recipes/${linked.slug}`}
                                className="inline-flex items-center gap-2 text-xs font-medium text-sage hover:text-sage-500 transition-colors bg-sage-50 px-3 py-1.5 rounded-full"
                              >
                                <span>🍽️</span>
                                Featured: {linked.title}
                                {linked.prep_time_mins && (
                                  <span className="text-charcoal-muted">
                                    · {linked.prep_time_mins}min
                                  </span>
                                )}
                              </Link>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-charcoal-muted bg-white rounded-xl">
                Day-by-day plan being finalised…
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FadeIn direction="left" delay={0.1} className="sticky top-24 space-y-6">
              {/* Start button */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-playfair font-semibold text-charcoal mb-3">
                    {isActive ? 'Currently Active' : 'Start This Protocol'}
                  </h3>
                  <p className="text-sm text-charcoal-muted mb-4">
                    {isActive
                      ? 'You\'re already on this journey. Keep going!'
                      : 'Track your progress and get reminders by starting the protocol.'}
                  </p>
                  <StartProtocolButton
                    protocolId={protocol.id}
                    isActive={isActive}
                    userId={user?.id}
                  />
                </CardContent>
              </Card>

              {/* Overview */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-playfair font-semibold text-charcoal">
                    Quick Overview
                  </h3>
                  {[
                    { label: 'Duration', value: protocol.duration },
                    { label: 'Difficulty', value: protocol.difficulty },
                    { label: 'Goal', value: protocol.goal },
                    { label: 'Total days', value: steps.length > 0 ? `${steps.length} days` : null },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-charcoal-muted">{item.label}</span>
                        <span className="font-medium text-charcoal">{item.value}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Tags */}
              {protocol.tags && protocol.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-playfair font-semibold text-charcoal mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {protocol.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
