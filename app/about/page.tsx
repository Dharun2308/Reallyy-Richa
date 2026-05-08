import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Heart, BookOpen, Leaf, Dumbbell } from 'lucide-react'
import FadeIn from '@/components/layout/FadeIn'
import { Button } from '@/components/ui/button'
import { BRAND_NAME, BRAND_AUTHOR } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About',
  description: `The story behind ${BRAND_NAME} — from management consulting to wellness advocacy.`,
}

const pillars = [
  {
    icon: Leaf,
    title: 'Whole Foods First',
    body: 'Every ingredient serves a purpose. I prioritise foods in their most natural, nutrient-dense form — the way nature designed them.',
  },
  {
    icon: BookOpen,
    title: 'Science-Backed',
    body: 'I dig into peer-reviewed research so you don\'t have to. Every recommendation is grounded in evidence, not trends.',
  },
  {
    icon: Heart,
    title: 'Compassionate Practice',
    body: 'Wellness is a lifelong journey, not a 30-day fix. I believe in progress over perfection, every single time.',
  },
  {
    icon: Dumbbell,
    title: 'Active Living',
    body: 'Nutrition and movement work together. My protocols integrate both because neither works optimally in isolation.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <p className="text-sage text-sm font-medium uppercase tracking-widest mb-4">
                The Story
              </p>
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-6 leading-tight">
                Hi, I&apos;m {BRAND_AUTHOR}.
                <br />
                <span className="text-sage">I eat to heal.</span>
              </h1>
              <p className="text-charcoal-muted text-lg leading-relaxed mb-4">
                A few years ago, I was a management consultant putting in 80-hour weeks, surviving on coffee and takeout. My body was sending every warning signal — chronic fatigue, brain fog, joint pain, constant bloating.
              </p>
              <p className="text-charcoal-muted text-lg leading-relaxed mb-6">
                What changed wasn&apos;t a new supplement or a trendy diet. It was understanding <em>why</em> food affects us at a cellular level — and rebuilding my plate around that science. Within three months, everything shifted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/recipes">
                  <Button size="lg">
                    Explore My Recipes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/protocols">
                  <Button variant="outline" size="lg">
                    View Protocols
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <div className="relative h-80 sm:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=800&q=80"
                  alt={`${BRAND_AUTHOR} — ${BRAND_NAME}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="py-14 md:py-20 bg-sage">
        <div className="container-narrow text-center">
          <FadeIn>
            <p className="font-lora italic text-2xl md:text-3xl text-white leading-relaxed">
              &ldquo;The most powerful pharmacy in the world isn&apos;t a building — it&apos;s your kitchen. I&apos;m here to show you how to use it.&rdquo;
            </p>
            <p className="mt-4 text-sage-200 font-medium">— {BRAND_AUTHOR}</p>
          </FadeIn>
        </div>
      </section>

      {/* Philosophy pillars */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
              How I Think About Food
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal">
              My Four Pillars
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm flex gap-5">
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-sage-50 rounded-full">
                    <p.icon className="h-6 w-6 text-sage" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-semibold text-charcoal mb-2">
                      {p.title}
                    </h3>
                    <p className="text-charcoal-muted leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Active lifestyle section */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"
                    alt="Morning yoga"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <div className="relative h-48 rounded-xl overflow-hidden mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"
                    alt="Hiking outdoors"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.15}>
              <p className="text-sage text-sm font-medium uppercase tracking-widest mb-4">
                Body in Motion
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal mb-5">
                Nutrition + Movement = Transformation
              </h2>
              <p className="text-charcoal-muted leading-relaxed mb-4">
                I&apos;m a strong believer that food and movement are inseparable partners. You can&apos;t out-exercise a poor diet, but you also can&apos;t fully unlock your food&apos;s potential without moving your body.
              </p>
              <p className="text-charcoal-muted leading-relaxed">
                My protocols always include movement recommendations — not because I&apos;m a fitness trainer, but because it&apos;s part of the whole picture.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Instagram placeholder */}
      <section className="section-padding bg-cream-100">
        <div className="container-wide text-center">
          <FadeIn>
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-3">
              @realyyyricha
            </p>
            <h2 className="font-playfair text-3xl font-bold text-charcoal mb-3">
              Follow the Journey
            </h2>
            <p className="text-charcoal-muted mb-8">
              Daily recipes, behind-the-scenes, and wellness tips on Instagram.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-2xl mx-auto mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-cream-200 rounded-lg overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-sage-100 to-cream-200 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-sage-300" />
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Follow on Instagram</Button>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-charcoal text-white">
        <div className="container-narrow text-center">
          <FadeIn>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-5">
              Ready to Start Your Journey?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recipes">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Recipes
                </Button>
              </Link>
              <Link href="/protocols">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-charcoal">
                  Start a Protocol
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
