/**
 * Seed Richa's recipes.
 * Run with: npx tsx scripts/seed-recipes.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *           ADMIN_EMAIL in .env.local
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL

if (!url || !key || !adminEmail) {
  console.error('Missing required env vars. Check .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', adminEmail)
    .single()

  if (profileError || !profile) {
    console.error('Admin profile not found. Run seed-admin.ts first.')
    process.exit(1)
  }

  const adminId = profile.id
  console.log(`Seeding recipes for admin: ${adminEmail}`)

  const { error } = await supabase.from('recipes').upsert([
    {
      title: 'Skyr Cheesecake Bites',
      slug: 'skyr-cheesecake-bites',
      description: 'High-protein mini cheesecakes with an almond flour crust and creamy Icelandic Skyr filling. Naturally sweetened and gut-friendly.',
      category: 'Dessert',
      tags: ['gluten-free', 'high-protein', 'refined-sugar-free'],
      servings: 12,
      prep_time_mins: 20,
      cook_time_mins: 22,
      anti_inflammatory_score: 72,
      published: true,
      author_id: adminId,
      ingredients: [
        // Crust
        '1½ cups almond flour',
        '3 tbsp coconut oil (melted) or grass-fed butter',
        '1 tbsp honey or maple syrup',
        '½ tsp cinnamon',
        'Pinch of sea salt',
        // Filling
        '2 cups plain Icelandic Skyr',
        '½ cup honey or Grade A maple syrup',
        '2 large eggs (room temperature)',
        '1 tbsp arrowroot powder or cornstarch',
        '1 tsp pure vanilla extract',
        '1 tsp fresh lemon juice',
      ],
      instructions: `<h2>1. Make the Crust</h2>
<p>Preheat oven to 325°F (160°C). Line a muffin tin with 12 paper liners. Mix the crust ingredients in a bowl until it looks like wet sand. Press about one tablespoon firmly into the bottom of each liner.</p>
<p><strong>Tip:</strong> Bake the crusts alone for 5–7 minutes first to keep them from getting soggy. Let cool slightly while you make the filling.</p>

<h2>2. Mix the Filling</h2>
<p>In a large bowl, whisk the Skyr until smooth. Add the honey, vanilla, lemon juice, and arrowroot powder. Whisk in the eggs one at a time, mixing just until combined.</p>
<p><strong>Crucial:</strong> Do not over-beat the eggs. Extra air bubbles will cause the cheesecakes to rise like a soufflé and then sink into a crater.</p>

<h2>3. Low and Slow Bake</h2>
<p>Lower oven to 300°F (150°C). Divide the filling among the 12 cups. Bake for 18–22 minutes. They're done when the edges are set but the very center still has a slight, firm jiggle.</p>

<h2>4. Cool Down</h2>
<p>Turn off the oven and crack the door open for 10 minutes before removing. This prevents cracks from temperature shock. Once at room temperature, chill in the fridge for at least 4 hours (overnight is better). This is where the texture transforms from yogurt to cheesecake.</p>`,
    },
    {
      title: 'Sweet Potato Brownies',
      slug: 'sweet-potato-brownies',
      description: 'Fudgy, flourless brownies made with sweet potato, peanut butter, and date-sweetened chocolate chips. No refined sugar.',
      category: 'Dessert',
      tags: ['gluten-free', 'dairy-free', 'refined-sugar-free', 'vegan'],
      anti_inflammatory_score: 78,
      published: true,
      author_id: adminId,
      ingredients: [
        '¾ cup sweet potato puree',
        '⅓ cup peanut butter',
        '6 tbsp almond flour',
        '½ cup cane-sugar-free mini chocolate chips (Just Date)',
        '⅓ cup maple syrup',
        '6 tbsp cocoa powder',
        '1½ tsp baking soda',
        '⅛ tsp salt',
      ],
      instructions: `<h2>Method</h2>
<ol>
  <li>Preheat oven to 350°F (175°C). Line an 8×8 inch baking pan with parchment.</li>
  <li>Mix sweet potato puree, peanut butter, and maple syrup until smooth.</li>
  <li>Stir in cocoa powder, almond flour, baking soda, and salt until combined.</li>
  <li>Fold in chocolate chips.</li>
  <li>Pour into pan and bake 20–25 minutes, until the edges are set and a toothpick comes out mostly clean.</li>
  <li>Cool completely before cutting — they firm up as they cool.</li>
</ol>`,
    },
    {
      title: 'Nut Butter RX Bars',
      slug: 'nut-butter-rx-bars',
      description: 'Homemade protein bars with oat flour, peanut butter powder, and egg white protein. Clean ingredients, no junk.',
      category: 'Snack',
      tags: ['high-protein', 'gluten-free', 'no-bake', 'meal-prep'],
      servings: 10,
      anti_inflammatory_score: 70,
      published: true,
      author_id: adminId,
      ingredients: [
        '2 cups rolled oats (blended into oat flour)',
        '1 cup peanut butter powder (PB2)',
        '½ cup egg white powder',
        '½ cup honey',
        '4–8 tbsp almond milk (added slowly until dough forms)',
        '1½ tsp cinnamon',
        '½ tsp sea salt',
      ],
      instructions: `<h2>Method</h2>
<ol>
  <li>Blend rolled oats in a food processor until a fine flour forms.</li>
  <li>Mix oat flour, PB2, egg white powder, cinnamon, and salt in a large bowl.</li>
  <li>Add honey and mix. Slowly add almond milk, 1 tbsp at a time, until the dough holds together when pressed but isn't sticky.</li>
  <li>Press firmly into a lined 8×8 pan or roll into bars.</li>
  <li>Refrigerate for at least 1 hour before cutting into ~10 bars.</li>
  <li>Store in the fridge up to 1 week or freeze up to 1 month.</li>
</ol>
<p><em>Drop ingredients into Gemini or Cronometer to get exact macros for your batch.</em></p>`,
    },
    {
      title: 'Tofu Sweet Potato Tahini Bowl',
      slug: 'tofu-sweet-potato-tahini-bowl',
      description: 'A hearty, plant-based lunch bowl with roasted sweet potato, crispy high-protein tofu, zucchini, chimichurri, and tahini.',
      category: 'Lunch',
      tags: ['vegan', 'gluten-free', 'high-protein', 'dairy-free'],
      anti_inflammatory_score: 88,
      published: true,
      author_id: adminId,
      ingredients: [
        'Sweet potatoes',
        'High-protein tofu (extra firm)',
        'Zucchini',
        'Chimichurri sauce',
        'Tahini',
      ],
      instructions: `<h2>Method</h2>
<ol>
  <li>Cube sweet potatoes and roast at 400°F (200°C) with olive oil, salt, and paprika for 25–30 minutes until caramelised.</li>
  <li>Press and cube tofu. Pan-fry in avocado oil over medium-high heat until golden and crispy on all sides, about 8–10 minutes.</li>
  <li>Slice zucchini and sauté or grill until tender, 4–5 minutes.</li>
  <li>Assemble bowl: sweet potato base, tofu, zucchini, a generous drizzle of chimichurri and tahini.</li>
</ol>`,
    },
    {
      title: 'Turmeric Ginger Bone Broth Tofu Ramen',
      slug: 'turmeric-ginger-bone-broth-tofu-ramen',
      description: 'A deeply healing ramen with golden bone broth, coconut milk, high-protein tofu, and anti-inflammatory spices.',
      category: 'Dinner',
      tags: ['gluten-free', 'dairy-free', 'high-protein', 'anti-inflammatory', 'gut-health'],
      anti_inflammatory_score: 91,
      published: true,
      author_id: adminId,
      ingredients: [
        'Bone broth',
        'Coconut milk',
        'High-protein tofu',
        'Ramen noodles',
        'Turmeric',
        'Salt',
        'Garlic powder',
        'Paprika',
        'Fresh ginger',
        'Coconut oil',
        'Bell peppers',
        'Caramelised onions',
        'Sesame seeds and cilantro (to top)',
      ],
      instructions: `<h2>Method</h2>
<ol>
  <li>Heat coconut oil in a large pot. Add grated ginger and cook 1–2 minutes until fragrant.</li>
  <li>Add turmeric, garlic powder, paprika, and a pinch of salt. Stir for 30 seconds.</li>
  <li>Pour in bone broth and coconut milk. Bring to a gentle simmer for 10 minutes to meld flavours.</li>
  <li>Meanwhile, caramelise onions in a separate pan over low heat, 20–25 minutes.</li>
  <li>Press and cube tofu; pan-fry until golden.</li>
  <li>Slice peppers and sauté until just tender.</li>
  <li>Cook ramen noodles according to package instructions; drain and add to broth.</li>
  <li>Serve topped with tofu, peppers, caramelised onions, sesame seeds, and cilantro.</li>
</ol>`,
    },
    {
      title: 'Dosa',
      slug: 'dosa',
      description: 'Traditional South Indian crispy fermented rice and lentil crepes. Naturally gluten-free and probiotic-rich from overnight fermentation.',
      category: 'Dinner',
      tags: ['vegan', 'gluten-free', 'fermented', 'gut-health'],
      anti_inflammatory_score: 75,
      published: true,
      author_id: adminId,
      ingredients: [
        '3 cups idli rice, sona masoori, or short-grain white rice',
        '1 cup whole skinned urad dal (black gram)',
        '1 tsp fenugreek seeds (methi)',
        'Cold water (for soaking and grinding)',
        'Salt to taste (approx. 1–1½ tsp)',
      ],
      instructions: `<h2>1. Rinse and Soak</h2>
<p>Rinse rice and lentils separately 2–3 times until the water runs clear. Soak rice and urad dal (with methi) in separate bowls with enough water to cover for at least 4–6 hours.</p>

<h2>2. Grind the Urad Dal</h2>
<p>Drain the dal. Grind in a mixer or wet grinder, adding cold water a little at a time, until you have a smooth, fluffy, airy paste. Transfer to a large container.</p>

<h2>3. Grind the Rice</h2>
<p>Drain the rice and grind to a smooth or slightly coarse paste. Slightly coarse gives extra crispness.</p>

<h2>4. Mix and Ferment</h2>
<p>Combine rice paste and dal batter. Mix thoroughly by hand for 1–2 minutes (this introduces bacteria for fermentation). The batter should be thick but pourable.</p>

<h2>5. Add Salt and Ferment</h2>
<p>Add salt, stir, cover, and let ferment in a warm place for 8–12 hours or overnight. The batter should rise, double in volume, and have a pleasant, slightly sour aroma.</p>

<h2>6. Cook the Dosas</h2>
<p>Heat a cast iron or non-stick pan over medium-high heat. Pour a ladleful of batter in the centre and spread in a circular motion. Drizzle a little oil around the edges. Cook until the edges lift and the bottom is golden, about 2–3 minutes. Fold and serve.</p>`,
    },
    {
      title: 'Khichdi',
      slug: 'khichdi',
      description: 'The ultimate healing comfort food — a gentle, easily digestible one-pot meal of moong dal and rice with anti-inflammatory spices. Perfect for gut repair.',
      category: 'Dinner',
      tags: ['gluten-free', 'gut-health', 'anti-inflammatory', 'easy-digest', 'high-protein'],
      servings: 3,
      prep_time_mins: 10,
      cook_time_mins: 30,
      anti_inflammatory_score: 85,
      published: true,
      author_id: adminId,
      ingredients: [
        '½ cup split yellow moong dal, rinsed thoroughly',
        '½ cup white rice (or brown rice if tolerated)',
        '2½ cups water (adjust for porridge-like consistency)',
        '1 tsp ghee or avocado oil',
        '½ tsp cumin seeds',
        '½-inch piece fresh ginger, grated',
        '1 small zucchini, peeled and finely chopped',
        '½ cup peeled and diced carrots (optional)',
        '¼ tsp turmeric powder',
        'Salt to taste',
        'Cilantro (to top)',
        'Greek yogurt (for extra protein)',
      ],
      instructions: `<h2>Method</h2>
<ol>
  <li>Rinse the moong dal and rice together several times until the water runs clear.</li>
  <li>In a pot or pressure cooker, heat ghee or oil over medium heat. Add cumin seeds and grated ginger; sauté 1 minute until fragrant.</li>
  <li>Add zucchini (and carrots if using) and sauté another 2 minutes.</li>
  <li>Add turmeric, a pinch of salt, and the rinsed dal and rice. Stir to combine.</li>
  <li>Pour in the water. Bring to a gentle boil, then reduce heat to low, cover, and simmer 25–30 minutes, stirring occasionally, until everything is soft and porridge-like. <em>(Pressure cooker: 2–3 whistles.)</em></li>
  <li>Add more water to reach your desired consistency.</li>
  <li>Season with salt. Serve warm garnished with cilantro and a dollop of Greek yogurt.</li>
</ol>`,
    },
  ], { onConflict: 'slug' })

  if (error) {
    console.error('Failed to seed recipes:', error.message)
    process.exit(1)
  }

  console.log('✅ 7 recipes seeded successfully')
}

seed().catch(console.error)
