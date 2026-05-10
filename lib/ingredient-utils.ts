// Unicode fraction → decimal
const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
  '⅙': 1 / 6, '⅚': 5 / 6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
}

// decimal → nicest display form (unicode fraction or "N x/y")
function formatNumber(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n))

  const whole = Math.floor(n)
  const frac = n - whole

  // Match common fractions within 0.02 tolerance
  const closest = Object.entries(UNICODE_FRACTIONS).reduce<[string, number]>(
    (best, [glyph, val]) =>
      Math.abs(val - frac) < Math.abs(UNICODE_FRACTIONS[best[0]] - frac) ? [glyph, val] : best,
    ['½', 0.5]
  )
  if (Math.abs(closest[1] - frac) < 0.04) {
    return whole > 0 ? `${whole}${closest[0]}` : closest[0]
  }

  // Fall back to one decimal place
  return n.toFixed(1).replace(/\.0$/, '')
}

// Match a quantity at the start of a token: "1 1/2", "1½", "½", "1/2", "1.5", "2"
const QTY_REGEX = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/

function parseQty(s: string): number | null {
  s = s.trim()
  if (!s) return null

  // Mixed: "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])

  // Plain fraction: "1/2"
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) return Number(frac[1]) / Number(frac[2])

  // Number followed by unicode fraction: "1½"
  const numFrac = s.match(/^(\d+)([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/)
  if (numFrac) return Number(numFrac[1]) + UNICODE_FRACTIONS[numFrac[2]]

  // Pure unicode fraction
  if (UNICODE_FRACTIONS[s] != null) return UNICODE_FRACTIONS[s]

  // Decimal or integer
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

// Scale a quantity range like "4–8" or "4-8" — scales both ends.
const RANGE_REGEX = /^(\S+)\s*[–-]\s*(\S+)$/

export function scaleIngredient(text: string, factor: number): string {
  if (factor === 1) return text

  // Handle leading range "4–8 tbsp …"
  const rangeMatch = text.match(/^(\S+)\s*[–-]\s*(\S+)(\s+.*)?$/)
  if (rangeMatch) {
    const a = parseQty(rangeMatch[1])
    const b = parseQty(rangeMatch[2])
    if (a != null && b != null) {
      return `${formatNumber(a * factor)}–${formatNumber(b * factor)}${rangeMatch[3] ?? ''}`
    }
  }

  // Handle leading mixed/single quantity
  // Try mixed first ("1 1/2 cups …")
  const mixedMatch = text.match(/^(\d+\s+\d+\/\d+)(\s+.*)?$/)
  if (mixedMatch) {
    const v = parseQty(mixedMatch[1])
    if (v != null) return `${formatNumber(v * factor)}${mixedMatch[2] ?? ''}`
  }

  const singleMatch = text.match(QTY_REGEX)
  if (singleMatch && singleMatch.index === 0) {
    const v = parseQty(singleMatch[0])
    if (v != null) {
      return `${formatNumber(v * factor)}${text.slice(singleMatch[0].length)}`
    }
  }

  return text
}

// Scale every quantity in a string that's followed by a measurement unit.
// Leaves time units, percentages, ratios (1:1), and bare numbers alone.
const SCALABLE_UNITS = [
  'tbsp', 'tablespoons', 'tablespoon',
  'tsp', 'teaspoons', 'teaspoon',
  'cups', 'cup',
  'oz', 'ounces', 'ounce',
  'fl oz',
  'ml', 'milliliters', 'milliliter', 'millilitre',
  'l', 'liters', 'liter', 'litre',
  'g', 'grams', 'gram',
  'kg', 'kilograms', 'kilogram',
  'lb', 'lbs', 'pounds', 'pound',
  'pinch', 'pinches',
  'dash', 'dashes',
  'slices', 'slice',
  'cloves', 'clove',
  'sprigs', 'sprig',
  'sticks', 'stick',
]
const UNIT_PATTERN = SCALABLE_UNITS
  .sort((a, b) => b.length - a.length) // longest first so "tablespoons" matches before "tbsp"
  .map((u) => u.replace(/\s+/g, '\\s+'))
  .join('|')

// Match: <quantity><space?><unit> as a whole word, where quantity is the same set as parseQty handles.
const SCALE_REGEX = new RegExp(
  `(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(\\s*)(${UNIT_PATTERN})\\b`,
  'gi'
)

export function scaleAllQuantities(text: string, factor: number): string {
  if (factor === 1) return text
  return text.replace(SCALE_REGEX, (_match, qty: string, gap: string, unit: string) => {
    const v = parseQty(qty)
    if (v == null) return _match
    return `${formatNumber(v * factor)}${gap || ' '}${unit}`
  })
}

// ----- Substitutions -----

export interface SubstituteEntry {
  match: RegExp
  label: string
  options: string[]
}

export const SUBSTITUTES: SubstituteEntry[] = [
  {
    match: /\balmond flour\b/i,
    label: 'almond flour',
    options: [
      'Cashew flour (1:1 — milder, similar fat content)',
      'Sunflower seed flour (1:1 — nut-free)',
      'Oat flour (1:1 — lower fat, denser texture)',
    ],
  },
  {
    match: /\boat flour\b/i,
    label: 'oat flour',
    options: [
      'Almond flour (1:1 — adds richness, more crumbly)',
      'Whole wheat flour (¾ cup per 1 cup oat flour)',
      'Buckwheat flour (1:1 — earthier flavour, GF)',
    ],
  },
  {
    match: /\bcoconut oil\b/i,
    label: 'coconut oil',
    options: [
      'Grass-fed butter (1:1 if not dairy-free)',
      'Avocado oil (1:1, more neutral flavour)',
      'Ghee (1:1, nutty/lactose-free)',
    ],
  },
  {
    match: /\bgrass-fed butter\b|\bbutter\b/i,
    label: 'butter',
    options: [
      'Coconut oil (1:1 — adds slight coconut note)',
      'Ghee (1:1 — lactose-free, deeper flavour)',
      'Olive oil (¾ the amount, savoury bakes only)',
    ],
  },
  {
    match: /\bhoney\b/i,
    label: 'honey',
    options: [
      'Maple syrup (1:1 — vegan, slightly thinner)',
      'Date syrup (1:1 — richer, lower glycemic)',
      'Coconut nectar (1:1 — milder sweetness)',
    ],
  },
  {
    match: /\bmaple syrup\b/i,
    label: 'maple syrup',
    options: [
      'Honey (1:1 — non-vegan)',
      'Date syrup (1:1 — lower glycemic)',
      'Coconut nectar (1:1)',
    ],
  },
  {
    match: /\bskyr\b|\bgreek yogurt\b/i,
    label: 'Skyr / Greek yogurt',
    options: [
      'Cottage cheese, blended smooth (1:1, even higher protein)',
      'Coconut yogurt (1:1 — dairy-free)',
      'Cashew yogurt (1:1 — dairy-free, creamier)',
    ],
  },
  {
    match: /\bpeanut butter\b/i,
    label: 'peanut butter',
    options: [
      'Almond butter (1:1)',
      'Sunflower seed butter (1:1 — nut-free)',
      'Cashew butter (1:1, milder)',
    ],
  },
  {
    match: /\barrowroot powder\b|\bcornstarch\b/i,
    label: 'arrowroot / cornstarch',
    options: [
      'Tapioca starch (1:1)',
      'Potato starch (1:1)',
      'Rice flour (use 2× the amount)',
    ],
  },
  {
    match: /\begg whites?\b|\beggs?\b(?!.*powder)/i,
    label: 'eggs',
    options: [
      'Flax egg (1 tbsp ground flax + 3 tbsp water, rest 5 min) — works in baking',
      'Chia egg (1 tbsp chia + 3 tbsp water)',
      'Unsweetened applesauce (¼ cup per egg, in moist bakes)',
    ],
  },
  {
    match: /\bcoconut milk\b/i,
    label: 'coconut milk',
    options: [
      'Cashew cream (1:1)',
      'Oat milk + 1 tbsp coconut oil per cup (dairy-free)',
      'Heavy cream (1:1, not dairy-free)',
    ],
  },
  {
    match: /\bbone broth\b/i,
    label: 'bone broth',
    options: [
      'Chicken or beef broth (1:1, less collagen)',
      'Vegetable broth (1:1, vegan)',
      'Mushroom broth (1:1, umami-rich, vegan)',
    ],
  },
  {
    match: /\btofu\b/i,
    label: 'tofu',
    options: [
      'Tempeh (1:1 — firmer texture, fermented)',
      'Chickpeas (1:1 by volume)',
      'Paneer (1:1 — non-vegan)',
    ],
  },
  {
    match: /\bsweet potato/i,
    label: 'sweet potato',
    options: [
      'Butternut squash (1:1)',
      'Pumpkin puree (1:1, in baking)',
      'Carrot (1:1, slightly less sweet)',
    ],
  },
  {
    match: /\brice\b/i,
    label: 'rice',
    options: [
      'Quinoa (1:1 — higher protein)',
      'Cauliflower rice (1:1 — low-carb)',
      'Millet (1:1)',
    ],
  },
  {
    match: /\btahini\b/i,
    label: 'tahini',
    options: [
      'Sunflower seed butter (1:1)',
      'Cashew butter (1:1, milder)',
      'Greek yogurt + lemon (1:1 in dressings only)',
    ],
  },
]

export function findSubstitutes(text: string): SubstituteEntry | null {
  for (const sub of SUBSTITUTES) {
    if (sub.match.test(text)) return sub
  }
  return null
}
