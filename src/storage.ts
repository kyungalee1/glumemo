import type { GlucoseEntry } from './types'

const STORAGE_KEY = 'glucose-diary-entries-v1'
const DISMISSED_FOODS_KEY = 'glucose-diary-dismissed-foods-v1'

export function loadEntries(): GlucoseEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GlucoseEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed.sort((a, b) => {
      const left = `${a.date}T${a.time}`
      const right = `${b.date}T${b.time}`
      return right.localeCompare(left)
    })
  } catch {
    return []
  }
}

export function saveEntries(entries: GlucoseEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** 통계 목록에서만 숨긴 음식 키 (혈당 기록은 그대로) */
export function loadDismissedFoods(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_FOODS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function saveDismissedFoods(keys: string[]): void {
  localStorage.setItem(DISMISSED_FOODS_KEY, JSON.stringify(keys))
}
