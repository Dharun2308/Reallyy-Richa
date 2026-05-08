export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: 'admin' | 'user'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          ingredients: string[] | null
          instructions: string | null
          tags: string[] | null
          category: string | null
          prep_time_mins: number | null
          cook_time_mins: number | null
          servings: number | null
          anti_inflammatory_score: number | null
          nutrition: Json | null
          published: boolean
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          ingredients?: string[] | null
          instructions?: string | null
          tags?: string[] | null
          category?: string | null
          prep_time_mins?: number | null
          cook_time_mins?: number | null
          servings?: number | null
          anti_inflammatory_score?: number | null
          nutrition?: Json | null
          published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          ingredients?: string[] | null
          instructions?: string | null
          tags?: string[] | null
          category?: string | null
          prep_time_mins?: number | null
          cook_time_mins?: number | null
          servings?: number | null
          anti_inflammatory_score?: number | null
          nutrition?: Json | null
          published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          slug: string
          category: string | null
          description: string | null
          benefits: string[] | null
          avoid_if: string[] | null
          score: number | null
          image_url: string | null
          references: string[] | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category?: string | null
          description?: string | null
          benefits?: string[] | null
          avoid_if?: string[] | null
          score?: number | null
          image_url?: string | null
          references?: string[] | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string | null
          description?: string | null
          benefits?: string[] | null
          avoid_if?: string[] | null
          score?: number | null
          image_url?: string | null
          references?: string[] | null
          published?: boolean
          created_at?: string
        }
      }
      protocols: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          duration: string | null
          goal: string | null
          difficulty: string | null
          steps: Json | null
          tags: string[] | null
          published: boolean
          author_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          duration?: string | null
          goal?: string | null
          difficulty?: string | null
          steps?: Json | null
          tags?: string[] | null
          published?: boolean
          author_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          duration?: string | null
          goal?: string | null
          difficulty?: string | null
          steps?: Json | null
          tags?: string[] | null
          published?: boolean
          author_id?: string | null
          created_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          saved_at?: string
        }
      }
      user_protocols: {
        Row: {
          id: string
          user_id: string
          protocol_id: string
          started_at: string
        }
        Insert: {
          id?: string
          user_id: string
          protocol_id: string
          started_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          protocol_id?: string
          started_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type Food = Database['public']['Tables']['foods']['Row']
export type Protocol = Database['public']['Tables']['protocols']['Row']
export type SavedRecipe = Database['public']['Tables']['saved_recipes']['Row']
export type UserProtocol = Database['public']['Tables']['user_protocols']['Row']
export type NewsletterSubscriber =
  Database['public']['Tables']['newsletter_subscribers']['Row']

export interface ProtocolStep {
  title: string
  body: string
  linked_recipe_slug?: string
}

export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}
