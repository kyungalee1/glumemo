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

export function parseFoods(foods: string): string[] {
  return foods
    .split(/[,，/\n]+/)
    .map((item) => item.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
}

export function normalizeFood(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
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

export function analyzeCautionFoods(entries: GlucoseEntry[]): FoodCaution[] {
  const overallAvg = averageGlucose(entries)
  if (overallAvg === null || entries.length < 3) return []

  const buckets = new Map<string, { display: string; values: number[] }>()

  for (const entry of entries) {
    for (const food of parseFoods(entry.foods)) {
      const key = normalizeFood(food)
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.values.push(entry.glucose)
      } else {
        buckets.set(key, { display: food, values: [entry.glucose] })
      }
    }
  }

  const results: FoodCaution[] = []

  for (const { display, values } of buckets.values()) {
    if (values.length < 2) continue
    const avg =
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    const delta = Math.round((avg - overallAvg) * 10) / 10
    if (delta >= 12) {
      results.push({
        name: display,
        count: values.length,
        avgGlucose: avg,
        overallAvg,
        delta,
      })
    }
  }

  return results.sort((a, b) => b.delta - a.delta || b.count - a.count)
}

export interface ChartPoint {
  label: string
  date: string
  lunch: number | null
  dinner: number | null
  avg: number | null
}

function buildSeries(entries: GlucoseEntry[], days: Date[]): ChartPoint[] {
  return days.map((day) => {
    const date = format(day, 'yyyy-MM-dd')
    const dayEntries = entries.filter((entry) => entry.date === date)
    const lunch = dayEntries.find((entry) => entry.slot === 'lunch')?.glucose ?? null
    const dinner = dayEntries.find((entry) => entry.slot === 'dinner')?.glucose ?? null
    const values = dayEntries.map((entry) => entry.glucose)
    const avg =
      values.length === 0
        ? null
        : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10

    return {
      label: format(day, 'M/d(EEE)', { locale: ko }),
      date,
      lunch,
      dinner,
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
