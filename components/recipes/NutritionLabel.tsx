import type { Nutrition } from '@/types/database'

interface NutritionLabelProps {
  nutrition: Nutrition
  servings?: number | null
}

// FDA Daily Value reference amounts (2,000-calorie diet)
const DV = {
  fat: 78, // g
  saturated_fat: 20, // g
  cholesterol: 300, // mg
  sodium: 2300, // mg
  carbs: 275, // g
  fiber: 28, // g
  added_sugars: 50, // g
  vitamin_d: 20, // mcg
  calcium: 1300, // mg
  iron: 18, // mg
  potassium: 4700, // mg
}

const pct = (value: number | undefined, dv: number) =>
  value == null ? null : `${Math.round((value / dv) * 100)}%`

function Row({
  label,
  value,
  unit,
  dailyValue,
  bold = false,
  indent = false,
  topBorder = false,
}: {
  label: string
  value: number | undefined
  unit: string
  dailyValue: string | null
  bold?: boolean
  indent?: boolean
  topBorder?: boolean
}) {
  if (value == null) return null
  return (
    <div
      className={`flex justify-between items-baseline py-1 ${
        topBorder ? 'border-t border-charcoal' : 'border-t border-charcoal/30'
      } ${indent ? 'pl-4' : ''}`}
    >
      <span className={`text-charcoal ${bold ? 'font-bold' : ''}`}>
        {bold ? <strong>{label}</strong> : label} {value}
        {unit}
      </span>
      {dailyValue && <span className="font-bold text-charcoal">{dailyValue}</span>}
    </div>
  )
}

export default function NutritionLabel({ nutrition, servings }: NutritionLabelProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-charcoal p-4 shadow-sm font-sans text-sm text-charcoal">
      <p className="text-[10px] uppercase tracking-wide text-charcoal-muted mb-1">
        Estimated · per serving
      </p>
      <h3 className="text-2xl font-extrabold leading-none tracking-tight mb-1">
        Nutrition Facts
      </h3>
      {servings != null && (
        <p className="text-xs text-charcoal">{servings} servings per recipe</p>
      )}
      {nutrition.serving_size && (
        <p className="flex justify-between text-xs font-bold text-charcoal">
          <span>Serving size</span>
          <span>{nutrition.serving_size}</span>
        </p>
      )}

      <div className="border-t-[6px] border-charcoal mt-2 pt-1">
        <p className="text-[10px] font-bold">Amount per serving</p>
        <div className="flex justify-between items-baseline border-b-4 border-charcoal pb-1">
          <span className="text-lg font-extrabold">Calories</span>
          <span className="text-3xl font-extrabold leading-none">{nutrition.calories}</span>
        </div>
      </div>

      <p className="text-right text-[10px] font-bold mt-1">% Daily Value*</p>

      <Row
        label="Total Fat"
        value={nutrition.fat}
        unit="g"
        dailyValue={pct(nutrition.fat, DV.fat)}
        bold
        topBorder
      />
      <Row
        label="Saturated Fat"
        value={nutrition.saturated_fat}
        unit="g"
        dailyValue={pct(nutrition.saturated_fat, DV.saturated_fat)}
        indent
      />
      <Row
        label="Trans Fat"
        value={nutrition.trans_fat}
        unit="g"
        dailyValue={null}
        indent
      />
      <Row
        label="Cholesterol"
        value={nutrition.cholesterol_mg}
        unit="mg"
        dailyValue={pct(nutrition.cholesterol_mg, DV.cholesterol)}
        bold
      />
      <Row
        label="Sodium"
        value={nutrition.sodium_mg}
        unit="mg"
        dailyValue={pct(nutrition.sodium_mg, DV.sodium)}
        bold
      />
      <Row
        label="Total Carbohydrate"
        value={nutrition.carbs}
        unit="g"
        dailyValue={pct(nutrition.carbs, DV.carbs)}
        bold
      />
      <Row
        label="Dietary Fiber"
        value={nutrition.fiber}
        unit="g"
        dailyValue={pct(nutrition.fiber, DV.fiber)}
        indent
      />
      <Row
        label="Total Sugars"
        value={nutrition.total_sugars}
        unit="g"
        dailyValue={null}
        indent
      />
      <Row
        label="Includes Added Sugars"
        value={nutrition.added_sugars}
        unit="g"
        dailyValue={pct(nutrition.added_sugars, DV.added_sugars)}
        indent
      />
      <Row
        label="Protein"
        value={nutrition.protein}
        unit="g"
        dailyValue={null}
        bold
      />

      <div className="border-t-4 border-charcoal mt-1" />

      <Row
        label="Vitamin D"
        value={nutrition.vitamin_d_mcg}
        unit="mcg"
        dailyValue={pct(nutrition.vitamin_d_mcg, DV.vitamin_d)}
      />
      <Row
        label="Calcium"
        value={nutrition.calcium_mg}
        unit="mg"
        dailyValue={pct(nutrition.calcium_mg, DV.calcium)}
      />
      <Row
        label="Iron"
        value={nutrition.iron_mg}
        unit="mg"
        dailyValue={pct(nutrition.iron_mg, DV.iron)}
      />
      <Row
        label="Potassium"
        value={nutrition.potassium_mg}
        unit="mg"
        dailyValue={pct(nutrition.potassium_mg, DV.potassium)}
      />

      <p className="text-[9px] leading-snug mt-3 pt-2 border-t border-charcoal/40 text-charcoal-muted">
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food
        contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
        Values are estimates based on typical ingredient nutrition data.
      </p>
    </div>
  )
}
