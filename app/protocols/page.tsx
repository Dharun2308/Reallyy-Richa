import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Target, Zap } from 'lucide-react'
import FadeIn from '@/components/layout/FadeIn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import type { Protocol } from '@/types/database'

export const metadata: Metadata = {
  title: 'Wellness Protocols',
  description: `Structured day-by-day wellness programs by ${BRAND_NAME} to reset, heal, and transform your health.`,
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'sage',
  Intermediate: 'terracotta',
  Advanced: 'secondary',
}

export default async function ProtocolsPage() {
  const supabase = await createClient()
  const { data: protocols } = await supabase
    .from('protocols')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal-light py-16 md:py-24">
        <div className="container-wide">
          <FadeIn className="max-w-2xl">
            <p className="text-sage-300 text-sm font-medium uppercase tracking-widest mb-3">
              Structured Transformation
            </p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-5">
              Wellness Protocols
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Not just recipes — complete day-by-day programs that bring together healing foods, movement, rest, and mindset for real, lasting results.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container-wide py-10 md:py-16">
        {/* What is a protocol */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 md:mb-20">
            {[
              { icon: Calendar, title: 'Day-by-day guidance', body: 'Each protocol maps out exactly what to eat, do, and focus on each day.' },
              { icon: Target, title: 'Specific goals', body: 'From gut reset to energy optimisation — each protocol targets a clear outcome.' },
              { icon: Zap, title: 'Linked recipes', body: 'Every day includes curated recipes that directly support the protocol goal.' },
            ].map((item, i) => (
              <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm flex gap-4">
                <div className="p-2.5 bg-sage-50 rounded-full h-fit">
                  <item.icon className="h-5 w-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                  <p className="text-sm text-charcoal-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Protocol cards */}
        {protocols && protocols.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {protocols.map((protocol, i) => (
              <FadeIn key={protocol.id} delay={i * 0.1}>
                <ProtocolCard protocol={protocol} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal-muted text-lg mb-2">Protocols coming soon!</p>
            <p className="text-charcoal-muted text-sm">
              Richa is putting the finishing touches on our first set of structured protocols.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const diffVariant =
    (protocol.difficulty && DIFFICULTY_COLORS[protocol.difficulty]) ?? 'secondary'

  return (
    <Link href={`/protocols/${protocol.slug}`} className="group">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
        <div className="h-3 bg-gradient-to-r from-sage to-sage-500" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h3 className="font-playfair text-xl font-semibold text-charcoal group-hover:text-sage transition-colors mb-1">
                {protocol.title}
              </h3>
            </div>
            <div className="shrink-0 flex flex-col gap-1.5 items-end">
              {protocol.duration && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {protocol.duration}
                </Badge>
              )}
              {protocol.difficulty && (
                <Badge variant={diffVariant as never} className="text-xs">
                  {protocol.difficulty}
                </Badge>
              )}
            </div>
          </div>

          {protocol.goal && (
            <div className="flex items-center gap-2 text-sm text-sage mb-3">
              <Target className="h-4 w-4 shrink-0" />
              <span className="font-medium">Goal: {protocol.goal}</span>
            </div>
          )}

          {protocol.summary && (
            <p className="text-sm text-charcoal-muted leading-relaxed line-clamp-3 mb-4">
              {protocol.summary}
            </p>
          )}

          {protocol.tags && protocol.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {protocol.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full group-hover:bg-sage group-hover:text-white group-hover:border-sage transition-colors">
            View Protocol <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
