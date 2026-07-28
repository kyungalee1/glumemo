export type MealSlot = 'lunch' | 'dinner'

export interface GlucoseEntry {
  id: string
  date: string
  slot: MealSlot
  time: string
  glucose: number
  foods: string
  note: string
  createdAt: string
}

export type TabId = 'today' | 'history' | 'stats'

export interface FoodCaution {
  name: string
  count: number
  avgGlucose: number
  overallAvg: number
  delta: number
}

export const SLOT_LABEL: Record<MealSlot, string> = {
  lunch: '점심',
  dinner: '저녁',
}

export const HIGH_GLUCOSE = 140
export const VERY_HIGH_GLUCOSE = 180
