import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Leaf } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatTime } from '@/lib/utils'
import type { Recipe } from '@/types/database'
import { UNSPLASH_FOOD } from '@/lib/config'

interface RecipeCardProps {
  recipe: Recipe
  className?: string
}

export default function RecipeCard({ recipe, className }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="group">
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-48 sm:h-52 overflow-hidden">
          <Image
            src={recipe.cover_image_url ?? UNSPLASH_FOOD}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {recipe.anti_inflammatory_score != null && (
            <div className="absolute top-3 right-3">
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-white/90',
                  recipe.anti_inflammatory_score >= 80
                    ? 'text-sage-500'
                    : recipe.anti_inflammatory_score >= 60
                    ? 'text-sage-400'
                    : 'text-terracotta-400'
                )}
              >
                <Leaf className="h-3 w-3" />
                {recipe.anti_inflammatory_score}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          {recipe.category && (
            <p className="text-xs font-medium text-sage uppercase tracking-wider mb-2">
              {recipe.category}
            </p>
          )}
          <h3 className="font-playfair text-lg font-semibold text-charcoal group-hover:text-sage transition-colors line-clamp-2 mb-2">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm text-charcoal-muted line-clamp-2 mb-3">
              {recipe.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-charcoal-muted mb-3">
            {recipe.prep_time_mins != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(recipe.prep_time_mins)}
              </span>
            )}
            {recipe.servings != null && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings} servings
              </span>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="sage" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
