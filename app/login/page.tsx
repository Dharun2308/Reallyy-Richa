import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import { BRAND_NAME } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Sign In',
  description: `Sign in to your ${BRAND_NAME} account.`,
}

interface Props {
  searchParams: Promise<{ redirect?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Leaf className="h-7 w-7 text-sage" />
            <span className="font-playfair text-2xl font-bold text-charcoal">{BRAND_NAME}</span>
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-charcoal">Welcome back</h1>
          <p className="text-charcoal-muted mt-2">
            Sign in to access your saved recipes and protocols.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
          <LoginForm redirectTo={params.redirect ?? '/dashboard'} message={params.message} />
        </div>

        <p className="text-center mt-6 text-sm text-charcoal-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-sage hover:text-sage-500 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
