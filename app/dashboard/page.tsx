import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Heart, Activity, Settings, LogOut } from 'lucide-react'
import FadeIn from '@/components/layout/FadeIn'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import RecipeCard from '@/components/recipes/RecipeCard'
import { BRAND_NAME } from '@/lib/config'
import SignOutButton from '@/components/auth/SignOutButton'
import type { Profile, Recipe, Protocol } from '@/types/database'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: `Your personal ${BRAND_NAME} dashboard.`,
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard')

  const profileResult = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileResult.data as Profile | null

  const savedResult = await supabase
    .from('saved_recipes')
    .select('recipe_id, saved_at, recipes(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })
    .limit(6)
  const savedRecipesRaw = (savedResult.data ?? []) as { recipe_id: string; saved_at: string; recipes: Recipe | null }[]

  const protocolsResult = await supabase
    .from('user_protocols')
    .select('protocol_id, started_at, protocols(*)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
  const activeProtocolsRaw = (protocolsResult.data ?? []) as { protocol_id: string; started_at: string; protocols: Protocol | null }[]

  const savedRecipes = savedRecipesRaw.map((sr) => sr.recipes).filter((r): r is Recipe => r !== null)

  const activeProtocols = activeProtocolsRaw
    .map((up) => ({ protocol: up.protocols, startedAt: up.started_at }))
    .filter((up): up is { protocol: Protocol; startedAt: string } => up.protocol !== null)

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-wide py-8 md:py-12">
        {/* Header */}
        <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal">
              Welcome back, {profile?.name?.split(' ')[0] ?? 'friend'}!
            </h1>
            <p className="text-charcoal-muted mt-1">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">Admin Panel</Button>
              </Link>
            )}
            <SignOutButton />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <FadeIn direction="left">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src={profile?.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name ?? 'U')}&backgroundColor=7C9A6E&textColor=ffffff`}
                      alt={profile?.name ?? 'User'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <h2 className="font-semibold text-charcoal">{profile?.name}</h2>
                  <p className="text-xs text-charcoal-muted mt-1">{user.email}</p>
                  <Badge variant="sage" className="mt-3 capitalize">{profile?.role}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { icon: Heart, label: 'Saved Recipes', href: '#saved' },
                      { icon: Activity, label: 'Active Protocols', href: '#protocols' },
                      { icon: Settings, label: 'Profile Settings', href: '#settings' },
                    ].map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-charcoal hover:bg-cream-100 transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-sage" />
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </FadeIn>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats */}
            <FadeIn>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Saved Recipes', value: savedRecipes.length, icon: Heart },
                  { label: 'Active Protocols', value: activeProtocols.length, icon: Activity },
                  { label: 'Days Active', value: Math.floor((Date.now() - new Date(profile?.created_at ?? Date.now()).getTime()) / 86400000), icon: Activity },
                ].map((stat) => (
                  <Card key={stat.label} className="text-center">
                    <CardContent className="p-5">
                      <stat.icon className="h-6 w-6 text-sage mx-auto mb-2" />
                      <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                      <p className="text-xs text-charcoal-muted">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeIn>

            {/* Saved recipes */}
            <section id="saved">
              <FadeIn>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-2xl font-semibold text-charcoal flex items-center gap-2">
                    <Heart className="h-5 w-5 text-terracotta" /> Saved Recipes
                  </h2>
                  <Link href="/recipes">
                    <Button variant="ghost" size="sm">Browse more</Button>
                  </Link>
                </div>
              </FadeIn>

              {savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {savedRecipes.map((recipe, i) => (
                    <FadeIn key={recipe.id} delay={i * 0.07}>
                      <RecipeCard recipe={recipe} />
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-10 text-center">
                    <Heart className="h-10 w-10 text-cream-300 mx-auto mb-3" />
                    <p className="text-charcoal-muted mb-4">No saved recipes yet.</p>
                    <Link href="/recipes">
                      <Button>Explore Recipes</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Active protocols */}
            <section id="protocols">
              <FadeIn>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-2xl font-semibold text-charcoal flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sage" /> Active Protocols
                  </h2>
                  <Link href="/protocols">
                    <Button variant="ghost" size="sm">Browse protocols</Button>
                  </Link>
                </div>
              </FadeIn>

              {activeProtocols.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {activeProtocols.map(({ protocol, startedAt }, i) => (
                    <FadeIn key={protocol.id} delay={i * 0.07}>
                      <Link href={`/protocols/${protocol.slug}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <h3 className="font-playfair font-semibold text-charcoal mb-1">
                              {protocol.title}
                            </h3>
                            <p className="text-xs text-charcoal-muted">
                              Started {new Date(startedAt).toLocaleDateString()}
                            </p>
                            {protocol.duration && (
                              <Badge variant="sage" className="mt-2 text-xs">
                                {protocol.duration}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-10 text-center">
                    <Activity className="h-10 w-10 text-cream-300 mx-auto mb-3" />
                    <p className="text-charcoal-muted mb-4">No active protocols yet.</p>
                    <Link href="/protocols">
                      <Button>Start a Protocol</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
