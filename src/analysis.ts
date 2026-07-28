import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { FoodCaution, GlucoseEntry, MealSlot } from './types'
import { HIGH_GLUCOSE } from './types'

/** `,` `/` 로 구분. 앞뒤 공백만 제거 (횟수 비교용 키는 normalizeFood에서 공백 제거) */
export function parseFoods(foods: string): string[] {
  return foods
    .split(/[,，/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/** 띄어쓰기 무시하고 같은 음식으로 취급 */
export function normalizeFood(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase()
}

export function getEntryForDay(
  entries: GlucoseEntry[],
  date: string,
  slot: MealSlot,
): GlucoseEntry | undefined {
  return entries.find((entry) => entry.date === date && entry.slot === slot)
}

export function averageGlucose(entries: GlucoseEntry[]): number | null {
  if (entries.length === 0) return null
  const sum = entries.reduce((acc, entry) => acc + entry.glucose, 0)
  return Math.round((sum / entries.length) * 10) / 10
}

/**
 * 140+ 기록에 함께 나온 음식 기준.
 * - 2회 이상: 주의(caution)
 * - 1회: 한번 높게 나온 음식(once)
 * 한 끼에 같은 음식이 중복 적혀도 1회로 센다.
 */
export function analyzeCautionFoods(entries: GlucoseEntry[]): FoodCaution[] {
  const overallAvg = averageGlucose(entries)
  const highEntries = entries.filter((entry) => entry.glucose >= HIGH_GLUCOSE)
  if (highEntries.length === 0) return []

  const buckets = new Map<
    string,
    { display: string; highCount: number; values: number[] }
  >()

  for (const entry of highEntries) {
    const seenInMeal = new Set<string>()
    for (const food of parseFoods(entry.foods)) {
      const key = normalizeFood(food)
      if (!key || seenInMeal.has(key)) continue
      seenInMeal.add(key)

      const display = food.replace(/\s+/g, '')
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.highCount += 1
        bucket.values.push(entry.glucose)
      } else {
        buckets.set(key, { display, highCount: 1, values: [entry.glucose] })
      }
    }
  }

  const results: FoodCaution[] = []

  for (const { display, highCount, values } of buckets.values()) {
    const avg =
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    const baseline = overallAvg ?? avg
    const delta = Math.round((avg - baseline) * 10) / 10
    results.push({
      name: display,
      count: highCount,
      avgGlucose: avg,
      overallAvg: baseline,
      delta,
      level: highCount >= 2 ? 'caution' : 'once',
    })
  }

  return results.sort((a, b) => {
    if (a.level !== b.level) return a.level === 'caution' ? -1 : 1
    return b.count - a.count || b.avgGlucose - a.avgGlucose
  })
}

export interface ChartPoint {
  label: string
  date: string
  breakfast: number | null
  lunch: number | null
  dinner: number | null
  other: number | null
  avg: number | null
}

function slotAverage(dayEntries: GlucoseEntry[], slot: MealSlot): number | null {
  const values = dayEntries.filter((entry) => entry.slot === slot).map((entry) => entry.glucose)
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

function buildSeries(entries: GlucoseEntry[], days: Date[]): ChartPoint[] {
  return days.map((day) => {
    const date = format(day, 'yyyy-MM-dd')
    const dayEntries = entries.filter((entry) => entry.date === date)
    const values = dayEntries.map((entry) => entry.glucose)
    const avg =
      values.length === 0
        ? null
        : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10

    return {
      label: format(day, 'M/d(EEE)', { locale: ko }),
      date,
      breakfast: slotAverage(dayEntries, 'breakfast'),
      lunch: slotAverage(dayEntries, 'lunch'),
      dinner: slotAverage(dayEntries, 'dinner'),
      other: slotAverage(dayEntries, 'other'),
      avg,
    }
  })
}

export function weeklySeries(entries: GlucoseEntry[], anchor = new Date()): ChartPoint[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  return buildSeries(entries, eachDayOfInterval({ start, end }))
}

export function monthlySeries(entries: GlucoseEntry[], anchor = new Date()): ChartPoint[] {
  const start = startOfMonth(anchor)
  const end = endOfMonth(anchor)
  return buildSeries(entries, eachDayOfInterval({ start, end }))
}

export function recentSeries(entries: GlucoseEntry[], days = 14): ChartPoint[] {
  const end = new Date()
  const start = subDays(end, days - 1)
  return buildSeries(entries, eachDayOfInterval({ start, end }))
}

export function entriesInRange(
  entries: GlucoseEntry[],
  startDate: string,
  endDate: string,
): GlucoseEntry[] {
  return entries.filter((entry) => entry.date >= startDate && entry.date <= endDate)
}

export function formatKoreanDate(date: string): string {
  try {
    return format(parseISO(date), 'M월 d일 (EEE)', { locale: ko })
  } catch {
    return date
  }
}
