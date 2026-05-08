import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'
import { BRAND_NAME } from '@/lib/config'
import { Leaf } from 'lucide-react'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/?message=Access+denied.')

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-cream-200 p-5 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <Leaf className="h-5 w-5 text-sage" />
          <span className="font-playfair font-bold text-charcoal text-sm">{BRAND_NAME}</span>
          <span className="text-xs bg-sage-50 text-sage px-1.5 py-0.5 rounded font-medium">Admin</span>
        </Link>
        <AdminNav />
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cream-200 px-4 py-2">
        <div className="flex justify-around">
          {['/', '/admin/recipes', '/admin/protocols', '/admin/foods', '/admin/users'].map((href, i) => {
            const icons = ['🏠', '🍽️', '📋', '🌿', '👥']
            return (
              <Link key={href} href={href} className="p-2 text-xl">
                {icons[i]}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  )
}
