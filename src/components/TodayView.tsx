import { addDays, format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { formatKoreanDate, getEntryForDay } from '../analysis'
import type { EntryInput } from '../hooks/useEntries'
import type { GlucoseEntry, MealSlot } from '../types'
import { HIGH_GLUCOSE, SLOT_LABEL, VERY_HIGH_GLUCOSE } from '../types'
import { EntryForm } from './EntryForm'

type Props = {
  entries: GlucoseEntry[]
  onSave: (input: EntryInput, existingId?: string) => void
}

function todayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

function shiftDate(date: string, delta: number) {
  return format(addDays(parseISO(date), delta), 'yyyy-MM-dd')
}

function levelClass(value: number) {
  if (value >= VERY_HIGH_GLUCOSE) return 'level-very-high'
  if (value >= HIGH_GLUCOSE) return 'level-high'
  return 'level-ok'
}

export function TodayView({ entries, onSave }: Props) {
  const today = todayString()
  const [selectedDate, setSelectedDate] = useState(today)
  const [editing, setEditing] = useState<MealSlot | null>(null)

  const lunch = getEntryForDay(entries, selectedDate, 'lunch')
  const dinner = getEntryForDay(entries, selectedDate, 'dinner')
  const isToday = selectedDate === today

  const draft = useMemo(() => {
    if (!editing) return undefined
    return getEntryForDay(entries, selectedDate, editing)
  }, [entries, editing, selectedDate])

  const bothDone = Boolean(lunch && dinner)

  function moveDay(delta: number) {
    setEditing(null)
    setSelectedDate((prev) => shiftDate(prev, delta))
  }

  function handleSave(input: EntryInput) {
    onSave(input, draft?.id)
    setEditing(null)
  }

  return (
    <div className="panel today-panel">
      <header className="panel-head">
        <p className="eyebrow">{isToday ? '오늘의 기록' : '날짜별 기록'}</p>
        <div className="date-nav">
          <button
            type="button"
            className="date-nav-btn"
            aria-label="이전 날짜"
            onClick={() => moveDay(-1)}
          >
            ‹
          </button>
          <h2>{formatKoreanDate(selectedDate)}</h2>
          <button
            type="button"
            className="date-nav-btn"
            aria-label="다음 날짜"
            onClick={() => moveDay(1)}
          >
            ›
          </button>
        </div>
        {!isToday ? (
          <button type="button" className="btn tiny jump-today" onClick={() => {
            setEditing(null)
            setSelectedDate(today)
          }}>
            오늘로 이동
          </button>
        ) : null}
      </header>

      <div className="slot-cards">
        {(['lunch', 'dinner'] as MealSlot[]).map((slot) => {
          const entry = slot === 'lunch' ? lunch : dinner
          const isOpen = editing === slot
          return (
            <article key={slot} className={isOpen ? 'slot-card active' : 'slot-card'}>
              <div className="slot-card-top">
                <h3>{SLOT_LABEL[slot]}</h3>
                <button
                  type="button"
                  className="btn tiny"
                  onClick={() => setEditing(isOpen ? null : slot)}
                >
                  {isOpen ? '닫기' : entry ? '수정' : '입력'}
                </button>
              </div>
              {entry ? (
                <>
                  <p className={`glucose-big ${levelClass(entry.glucose)}`}>
                    {entry.glucose}
                    <span>mg/dL</span>
                  </p>
                  <p className="muted">{entry.time} 측정</p>
                  <p className="foods-line">{entry.foods}</p>
                  {entry.note ? <p className="note-line">{entry.note}</p> : null}
                </>
              ) : (
                <p className="empty-slot">아직 기록이 없어요.</p>
              )}
            </article>
          )
        })}
      </div>

      {editing ? (
        <section className="composer">
          <h3>
            {SLOT_LABEL[editing]} {draft ? '수정' : '새 기록'}
          </h3>
          <EntryForm
            key={`${selectedDate}-${editing}-${draft?.id ?? 'new'}`}
            initial={draft}
            defaultSlot={editing}
            defaultDate={selectedDate}
            submitLabel={draft ? '수정 저장' : '기록 저장'}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : bothDone ? (
        <p className="all-done">이 날 점심·저녁 기록을 모두 남겼어요.</p>
      ) : null}
    </div>
  )
}
