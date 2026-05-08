'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  recipeId: string
  initialSaved: boolean
  userId?: string
}

export default function SaveRecipeButton({ recipeId, initialSaved, userId }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (!userId) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      if (saved) {
        await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipeId)
        setSaved(false)
        toast({ title: 'Removed from favorites' })
      } else {
        await supabase.from('saved_recipes').insert({ user_id: userId, recipe_id: recipeId })
        setSaved(true)
        toast({ title: 'Saved to favorites!', variant: 'success' as never })
      }
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          saved ? 'fill-terracotta text-terracotta' : 'text-charcoal-muted'
        )}
      />
    </Button>
  )
}
