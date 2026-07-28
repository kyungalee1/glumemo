export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'other'

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
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  other: '수시',
}

/** 하루 1회씩 기록하는 기본 시점 */
export const REGULAR_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

/** 폼·입력에서 고를 수 있는 전체 시점 */
export const ALL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'other']

export const HIGH_GLUCOSE = 140
export const VERY_HIGH_GLUCOSE = 180
