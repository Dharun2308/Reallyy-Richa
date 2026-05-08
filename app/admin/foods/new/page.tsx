import type { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/config'
import FoodForm from '@/components/admin/FoodForm'

export const metadata: Metadata = { title: `New Food — Admin — ${BRAND_NAME}` }

export default function NewFoodPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">New Food Entry</h1>
      <FoodForm />
    </div>
  )
}
