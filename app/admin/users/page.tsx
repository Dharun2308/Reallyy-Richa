import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/types/database'

export const metadata: Metadata = { title: `Users — Admin — ${BRAND_NAME}` }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const result = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  const users = result.data as Profile[] | null

  return (
    <div className="space-y-6">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">Users</h1>

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{user.name ?? 'No name'}</p>
                      <p className="text-xs text-charcoal-muted sm:hidden">{user.email}</p>

                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-charcoal-muted">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-charcoal-muted text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-charcoal-muted">No users yet.</div>
        )}
      </div>
    </div>
  )
}
