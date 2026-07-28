import { useEffect, useState } from 'react'
import { createId, loadEntries, saveEntries } from '../storage'
import type { GlucoseEntry, MealSlot } from '../types'

export type EntryInput = {
  date: string
  slot: MealSlot
  time: string
  glucose: number
  foods: string
  note: string
}

export function useEntries() {
  const [entries, setEntries] = useState<GlucoseEntry[]>(() => loadEntries())

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  function upsertEntry(input: EntryInput, existingId?: string) {
    setEntries((prev) => {
      const next: GlucoseEntry = {
        id: existingId ?? createId(),
        date: input.date,
        slot: input.slot,
        time: input.time,
        glucose: input.glucose,
        foods: input.foods.trim(),
        note: input.note.trim(),
        createdAt: existingId
          ? (prev.find((item) => item.id === existingId)?.createdAt ?? new Date().toISOString())
          : new Date().toISOString(),
      }

      const withoutSameSlot = prev.filter(
        (item) => !(item.date === next.date && item.slot === next.slot && item.id !== next.id),
      )
      const withoutSelf = withoutSameSlot.filter((item) => item.id !== next.id)
      return [next, ...withoutSelf].sort((a, b) =>
        `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`),
      )
    })
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  function replaceEntries(next: GlucoseEntry[]) {
    setEntries(
      [...next].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
    )
  }

  return { entries, upsertEntry, deleteEntry, replaceEntries }
}
