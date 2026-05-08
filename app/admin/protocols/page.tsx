import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import DeleteButton from '@/components/admin/DeleteButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'
import type { Protocol } from '@/types/database'

export const metadata: Metadata = { title: `Protocols — Admin — ${BRAND_NAME}` }

export default async function AdminProtocolsPage() {
  const supabase = await createClient()
  const result = await supabase.from('protocols').select('*').order('created_at', { ascending: false })
  const protocols = result.data as Protocol[] | null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-charcoal">Protocols</h1>
        <Link href="/admin/protocols/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Protocol</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {protocols && protocols.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden sm:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden md:table-cell">Difficulty</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Published</th>
                  <th className="text-right px-4 py-3 text-charcoal-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {protocols.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal line-clamp-1">{p.title}</p>
                      <p className="text-xs text-charcoal-muted">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.duration ?? <span className="text-charcoal-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {p.difficulty ? (
                        <Badge variant="outline" className="text-xs">{p.difficulty}</Badge>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TogglePublishButton id={p.id} table="protocols" published={p.published} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/protocols/${p.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link href={`/admin/protocols/${p.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <DeleteButton id={p.id} table="protocols" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-charcoal-muted mb-4">No protocols yet.</p>
            <Link href="/admin/protocols/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Create first protocol</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
