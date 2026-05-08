'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Mail, CheckCircle } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function NewsletterCapture() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Something went wrong')
      }
      setSubmitted(true)
      reset()
      toast({ title: 'You\'re in!', description: 'Welcome to the community.', variant: 'success' as never })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  return (
    <section className="bg-sage py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/20 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4">
            Weekly Wellness in Your Inbox
          </h2>
          <p className="text-sage-100 text-lg mb-8 max-w-xl mx-auto">
            Anti-inflammatory recipes, food science tips, and seasonal protocols — delivered every Sunday. No spam, ever.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 text-white">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">You&apos;re subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              noValidate
            >
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 bg-white border-0 text-charcoal placeholder:text-charcoal-muted focus-visible:ring-white"
                  aria-label="Email address"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-white/90 text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 bg-terracotta hover:bg-terracotta-500 text-white px-8 shrink-0"
              >
                {isSubmitting ? 'Joining…' : 'Join Free'}
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-white/60">
            Join 2,000+ readers. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
