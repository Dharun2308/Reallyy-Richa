import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import FoodForm from '@/components/admin/FoodForm'

export const metadata: Metadata = { title: `Edit Food — Admin — ${BRAND_NAME}` }

interface Props { params: Promise<{ id: string }> }

export default async function EditFoodPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: food } = await supabase.from('foods').select('*').eq('id', id).single()
  if (!food) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">Edit Food</h1>
      <FoodForm food={food} />
    </div>
  )
}
