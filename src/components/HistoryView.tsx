import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { getEntryForDay } from '../analysis'
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

function valuesForSlot(
  entries: GlucoseEntry[],
  date: string,
  slot: MealSlot,
): number[] {
  if (slot === 'other') {
    return entries
      .filter((entry) => entry.date === date && entry.slot === 'other')
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((entry) => entry.glucose)
  }
  const entry = getEntryForDay(entries, date, slot)
  return entry ? [entry.glucose] : []
}

function formatDayLabel(date: string) {
  return format(parseISO(date), 'M/d\nEEE', { locale: ko }).replace('\n', ' ')
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

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th scope="col">일자</th>
              {ALL_SLOTS.map((slot) => (
                <th key={slot} scope="col" title={SLOT_LABEL[slot]}>
                  <span className="history-col-emoji" aria-hidden="true">
                    {SLOT_EMOJI[slot]}
                  </span>
                  <span className="history-col-name">{SLOT_LABEL[slot]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const date = format(day, 'yyyy-MM-dd')
              return (
                <tr key={date}>
                  <th scope="row">{formatDayLabel(date)}</th>
                  {ALL_SLOTS.map((slot) => {
                    const values = valuesForSlot(entries, date, slot)
                    return (
                      <td key={slot}>
                        {values.length === 0 ? (
                          <span className="muted">—</span>
                        ) : (
                          <span className="history-cell-values">
                            {values.map((value, index) => (
                              <strong key={`${slot}-${index}`} className={levelClass(value)}>
                                {value}
                                {index < values.length - 1 ? ' · ' : ''}
                              </strong>
                            ))}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
