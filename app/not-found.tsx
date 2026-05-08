import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf } from 'lucide-react'
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md">
        <Leaf className="h-16 w-16 text-sage-300 mx-auto mb-6" />
        <h1 className="font-playfair text-5xl font-bold text-charcoal mb-3">404</h1>
        <h2 className="font-playfair text-2xl font-semibold text-charcoal mb-4">
          Page Not Found
        </h2>
        <p className="text-charcoal-muted mb-8">
          This page doesn&apos;t exist — but there are plenty of healing recipes and protocols waiting for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">Browse Recipes</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
