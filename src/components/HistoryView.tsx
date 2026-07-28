import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'
import { formatKoreanDate, getEntryForDay } from '../analysis'
import type { GlucoseEntry, MealSlot } from '../types'
import {
  ALL_SLOTS,
  HIGH_GLUCOSE,
  SLOT_EMOJI,
  SLOT_LABEL,
  VERY_HIGH_GLUCOSE,
} from '../types'

type Props = {
  entries: GlucoseEntry[]
}

function levelClass(value: number) {
  if (value >= VERY_HIGH_GLUCOSE) return 'level-very-high'
  if (value >= HIGH_GLUCOSE) return 'level-high'
  return 'level-ok'
}

function valuesForSlot(dayEntries: GlucoseEntry[], slot: MealSlot): number[] {
  return dayEntries
    .filter((entry) => entry.slot === slot)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((entry) => entry.glucose)
}

export function HistoryView({ entries }: Props) {
  const [anchor, setAnchor] = useState(() => new Date())

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor, { weekStartsOn: 1 })
    const end = endOfWeek(anchor, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [anchor])

  const weekLabel = useMemo(() => {
    const start = weekDays[0]
    const end = weekDays[weekDays.length - 1]
    return `${format(start, 'M/d')} – ${format(end, 'M/d')}`
  }, [weekDays])

  function shiftWeek(delta: number) {
    setAnchor((prev) => addDays(prev, delta * 7))
  }

  return (
    <div className="panel history-panel">
      <header className="panel-head">
        <p className="eyebrow">주간 기록</p>
        <div className="date-nav">
          <button
            type="button"
            className="date-nav-btn"
            aria-label="이전 주"
            onClick={() => shiftWeek(-1)}
          >
            ‹
          </button>
          <h2>{weekLabel}</h2>
          <button
            type="button"
            className="date-nav-btn"
            aria-label="다음 주"
            onClick={() => shiftWeek(1)}
          >
            ›
          </button>
        </div>
      </header>

      <div className="history-week">
        {weekDays.map((day) => {
          const date = format(day, 'yyyy-MM-dd')
          const dayEntries = entries.filter((entry) => entry.date === date)

          return (
            <section key={date} className="history-day-card">
              <h3>{formatKoreanDate(date)}</h3>
              <ul className="history-slot-rows">
                {ALL_SLOTS.map((slot) => {
                  const values =
                    slot === 'other'
                      ? valuesForSlot(dayEntries, slot)
                      : (() => {
                          const entry = getEntryForDay(entries, date, slot)
                          return entry ? [entry.glucose] : []
                        })()

                  return (
                    <li key={slot}>
                      <span className="history-slot-label">
                        <span aria-hidden="true">{SLOT_EMOJI[slot]}</span>
                        {SLOT_LABEL[slot]}
                      </span>
                      <span className="history-slot-values">
                        {values.length === 0 ? (
                          <span className="muted">—</span>
                        ) : (
                          values.map((value, index) => (
                            <strong key={`${slot}-${index}`} className={levelClass(value)}>
                              {value}
                              {index < values.length - 1 ? ', ' : ''}
                            </strong>
                          ))
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
