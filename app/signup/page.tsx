import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Leaf } from 'lucide-react'
import SignupForm from '@/components/auth/SignupForm'
import { BRAND_NAME, ALLOW_PUBLIC_SIGNUP } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Create Account',
  description: `Join ${BRAND_NAME} — save recipes, track protocols, and start healing.`,
}

export default function SignupPage() {
  if (!ALLOW_PUBLIC_SIGNUP) {
    redirect('/login?message=Public+signup+is+currently+disabled.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Leaf className="h-7 w-7 text-sage" />
            <span className="font-playfair text-2xl font-bold text-charcoal">{BRAND_NAME}</span>
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-charcoal">
            Start your journey
          </h1>
          <p className="text-charcoal-muted mt-2">
            Free account — save recipes, track protocols, join the community.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
          <SignupForm />
        </div>

        <p className="text-center mt-6 text-sm text-charcoal-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-sage hover:text-sage-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
