import type { Metadata } from 'next'
import Link from 'next/link'
import { UtensilsCrossed, Activity, Leaf, Users, Mail, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'

export const metadata: Metadata = { title: `Admin — ${BRAND_NAME}` }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: recipeCount },
    { count: protocolCount },
    { count: foodCount },
    { count: userCount },
    { count: newsletterCount },
  ] = await Promise.all([
    supabase.from('recipes').select('*', { count: 'exact', head: true }),
    supabase.from('protocols').select('*', { count: 'exact', head: true }),
    supabase.from('foods').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Recipes', value: recipeCount ?? 0, icon: UtensilsCrossed, href: '/admin/recipes', color: 'text-sage' },
    { label: 'Protocols', value: protocolCount ?? 0, icon: Activity, href: '/admin/protocols', color: 'text-sage' },
    { label: 'Foods', value: foodCount ?? 0, icon: Leaf, href: '/admin/foods', color: 'text-sage' },
    { label: 'Users', value: userCount ?? 0, icon: Users, href: '/admin/users', color: 'text-charcoal' },
    { label: 'Subscribers', value: newsletterCount ?? 0, icon: Mail, href: '/admin/newsletter', color: 'text-terracotta' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-charcoal">Admin Dashboard</h1>
        <p className="text-charcoal-muted mt-1">Welcome back, Richa. Here&apos;s an overview.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 text-center">
                <stat.icon className={`h-7 w-7 ${stat.color} mx-auto mb-2`} />
                <p className="text-3xl font-bold text-charcoal">{stat.value}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-playfair text-xl font-semibold text-charcoal mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/admin/recipes/new', label: 'New Recipe', icon: UtensilsCrossed },
            { href: '/admin/protocols/new', label: 'New Protocol', icon: Activity },
            { href: '/admin/foods/new', label: 'New Food Entry', icon: Leaf },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-sage hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sage-50 rounded-lg group-hover:bg-sage-100 transition-colors">
                  <action.icon className="h-5 w-5 text-sage" />
                </div>
                <span className="font-medium text-charcoal">{action.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-charcoal-muted group-hover:text-sage transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
