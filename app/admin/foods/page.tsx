import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import DeleteButton from '@/components/admin/DeleteButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata: Metadata = { title: `Foods — Admin — ${BRAND_NAME}` }

export default async function AdminFoodsPage() {
  const supabase = await createClient()
  const { data: foods } = await supabase
    .from('foods')
    .select('id, name, slug, category, score, published, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-charcoal">Foods</h1>
        <Link href="/admin/foods/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Food</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {foods && foods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium hidden md:table-cell">Score</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Published</th>
                  <th className="text-right px-4 py-3 text-charcoal-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {foods.map((food) => (
                  <tr key={food.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{food.name}</p>
                      <p className="text-xs text-charcoal-muted">/{food.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {food.category ? <Badge variant="sage" className="text-xs">{food.category}</Badge> : '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {food.score != null ? <span className="font-medium text-sage">{food.score}</span> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TogglePublishButton id={food.id} table="foods" published={food.published} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/foods/${food.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <DeleteButton id={food.id} table="foods" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-charcoal-muted mb-4">No food entries yet.</p>
            <Link href="/admin/foods/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add first food</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
