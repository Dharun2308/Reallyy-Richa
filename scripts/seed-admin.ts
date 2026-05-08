/**
 * Seed admin user.
 * Run with: npx tsx scripts/seed-admin.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *           ADMIN_EMAIL, ADMIN_PASSWORD in .env.local
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || !key || !email || !password) {
  console.error('Missing required env vars. Check .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log(`Seeding admin user: ${email}`)

  // Create or fetch the user
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  let userId: string

  if (existing) {
    userId = existing.id
    console.log('User profile already exists, updating role...')
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: email!,
      password: password!,
      email_confirm: true,
      user_metadata: { name: 'Richa (Admin)' },
    })

    if (error) {
      console.error('Failed to create user:', error.message)
      process.exit(1)
    }

    userId = created.user.id
    console.log('Created auth user:', userId)
  }

  // Promote to admin
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, email: email!, role: 'admin', name: 'Richa' })

  if (profileError) {
    console.error('Failed to update profile:', profileError.message)
    process.exit(1)
  }

  console.log(`✅ Admin user seeded successfully (id: ${userId})`)

  // Seed some sample data
  await seedSampleData(userId)
}

async function seedSampleData(adminId: string) {
  console.log('Seeding sample content...')

  const { error: recipeError } = await supabase.from('recipes').upsert([
    {
      title: 'Golden Turmeric Lentil Soup',
      slug: 'golden-turmeric-lentil-soup',
      description: 'A warming, anti-inflammatory soup packed with healing spices and plant-based protein.',
      ingredients: [
        '1 cup red lentils',
        '2 tsp turmeric',
        '1 tsp cumin',
        '1 can coconut milk',
        '2 cups vegetable broth',
        '1 onion, diced',
        '3 cloves garlic',
        '1 thumb fresh ginger',
        'Juice of 1 lemon',
        'Salt & pepper to taste',
      ],
      instructions: '<h2>Method</h2><ol><li>Sauté onion, garlic, ginger until soft.</li><li>Add spices and toast for 1 minute.</li><li>Add lentils, broth, and coconut milk. Simmer 20 min.</li><li>Blend half the soup for creaminess. Finish with lemon.</li></ol>',
      tags: ['vegan', 'gluten-free', 'dairy-free', 'high-protein'],
      category: 'Soup',
      prep_time_mins: 10,
      cook_time_mins: 25,
      servings: 4,
      anti_inflammatory_score: 92,
      cover_image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
      published: true,
      author_id: adminId,
    },
    {
      title: 'Omega-3 Salmon Bowl',
      slug: 'omega-3-salmon-bowl',
      description: 'Wild salmon over turmeric rice with avocado, edamame, and a ginger miso dressing.',
      ingredients: [
        '200g wild salmon fillet',
        '1 cup brown rice',
        '1 avocado',
        '½ cup edamame',
        '1 tbsp white miso',
        '1 tsp fresh ginger',
        '1 tbsp rice vinegar',
        '1 tbsp sesame seeds',
        'Cucumber & radish to serve',
      ],
      instructions: '<h2>Method</h2><ol><li>Cook rice with ½ tsp turmeric.</li><li>Sear salmon 3 min each side.</li><li>Whisk dressing: miso, ginger, vinegar, 2 tbsp water.</li><li>Assemble bowl and drizzle dressing.</li></ol>',
      tags: ['gluten-free', 'dairy-free', 'high-protein'],
      category: 'Dinner',
      prep_time_mins: 15,
      cook_time_mins: 20,
      servings: 2,
      anti_inflammatory_score: 88,
      cover_image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      published: true,
      author_id: adminId,
    },
    {
      title: 'Anti-Inflammatory Smoothie',
      slug: 'anti-inflammatory-smoothie',
      description: 'Start your day with this vibrant blend of ginger, turmeric, pineapple, and spinach.',
      ingredients: [
        '1 cup frozen pineapple',
        '1 handful spinach',
        '1 tsp turmeric',
        '1 tsp fresh ginger',
        '1 tbsp chia seeds',
        '1 cup coconut water',
        'Juice of ½ lemon',
        'Pinch of black pepper',
      ],
      instructions: '<p>Blend all ingredients until smooth. Serve immediately for maximum nutrients.</p>',
      tags: ['vegan', 'gluten-free', 'dairy-free'],
      category: 'Smoothie',
      prep_time_mins: 5,
      cook_time_mins: 0,
      servings: 1,
      anti_inflammatory_score: 95,
      cover_image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
      published: true,
      author_id: adminId,
    },
  ], { onConflict: 'slug' })

  if (recipeError) console.warn('Recipe seed warning:', recipeError.message)
  else console.log('✅ Sample recipes seeded')

  const { error: protocolError } = await supabase.from('protocols').upsert([
    {
      title: '7-Day Anti-Inflammatory Reset',
      slug: '7-day-anti-inflammatory-reset',
      summary: 'A week-long program to reduce inflammation, reset your gut, and restore energy through targeted foods and daily rituals.',
      duration: '7 days',
      goal: 'Reduce inflammation & restore energy',
      difficulty: 'Beginner',
      tags: ['gut-health', 'energy', 'anti-inflammatory'],
      published: true,
      author_id: adminId,
      steps: [
        { title: 'Day 1 — Eliminate Triggers', body: 'Remove processed foods, refined sugar, and seed oils. Start your morning with warm lemon water and the Anti-Inflammatory Smoothie.', linked_recipe_slug: 'anti-inflammatory-smoothie' },
        { title: 'Day 2 — Gut Prep', body: 'Introduce fermented foods. Begin each meal with 5 minutes of mindful eating. Dinner: Golden Turmeric Lentil Soup.', linked_recipe_slug: 'golden-turmeric-lentil-soup' },
        { title: 'Day 3 — Omega-3 Focus', body: 'Load up on omega-3s. Add flaxseeds to breakfast. Lunch: Omega-3 Salmon Bowl.', linked_recipe_slug: 'omega-3-salmon-bowl' },
        { title: 'Day 4 — Herbal Support', body: 'Add turmeric tea morning and evening. Focus on dark leafy greens at every meal.' },
        { title: 'Day 5 — Movement Integration', body: '30-min gentle movement (yoga or walking). Meals focus on colourful vegetables and healthy fats.' },
        { title: 'Day 6 — Deep Nourishment', body: 'Bone broth or vegetable broth as a morning ritual. Anti-inflammatory spice blend on all meals.' },
        { title: 'Day 7 — Consolidation', body: 'Reflect on how you feel. Identify 3 changes to carry forward permanently. Celebrate with a nourishing favourite meal.' },
      ],
    },
  ], { onConflict: 'slug' })

  if (protocolError) console.warn('Protocol seed warning:', protocolError.message)
  else console.log('✅ Sample protocol seeded')

  const { error: foodError } = await supabase.from('foods').upsert([
    {
      name: 'Turmeric',
      slug: 'turmeric',
      category: 'Spices & Herbs',
      description: 'The golden spice — curcumin is one of the most studied anti-inflammatory compounds in nature.',
      benefits: ['Inhibits NF-κB inflammatory pathway', 'Reduces CRP levels', 'Supports joint health', 'Antioxidant'],
      avoid_if: ['Taking blood thinners', 'Gallbladder issues'],
      score: 97,
      image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80',
      published: true,
    },
    {
      name: 'Wild Blueberries',
      slug: 'wild-blueberries',
      category: 'Fruits & Vegetables',
      description: 'The most antioxidant-dense berry — wild varieties have 2x the anthocyanins of cultivated.',
      benefits: ['High ORAC score', 'Brain-protective polyphenols', 'Reduces oxidative stress', 'Gut microbiome support'],
      avoid_if: [],
      score: 94,
      image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80',
      published: true,
    },
    {
      name: 'Extra Virgin Olive Oil',
      slug: 'extra-virgin-olive-oil',
      category: 'Healthy Fats',
      description: 'Oleocanthal in EVOO has similar anti-inflammatory effects to ibuprofen at high doses.',
      benefits: ['Oleocanthal mimics ibuprofen', 'Heart-protective monounsaturated fats', 'Reduces LDL oxidation', 'Polyphenol-rich'],
      avoid_if: ['High heat cooking (use avocado oil instead)'],
      score: 91,
      published: true,
    },
  ], { onConflict: 'slug' })

  if (foodError) console.warn('Food seed warning:', foodError.message)
  else console.log('✅ Sample foods seeded')
}

seed().catch(console.error)
