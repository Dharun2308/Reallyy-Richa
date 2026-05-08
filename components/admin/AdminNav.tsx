'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UtensilsCrossed, Activity, Leaf, Users, Mail, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/recipes', label: 'Recipes', icon: UtensilsCrossed },
  { href: '/admin/protocols', label: 'Protocols', icon: Activity },
  { href: '/admin/foods', label: 'Foods', icon: Leaf },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4 px-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>
      <ul className="space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sage text-white'
                    : 'text-charcoal-muted hover:bg-cream-100 hover:text-charcoal'
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
