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
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function levelClass(value: number) {
  if (value >= VERY_HIGH_GLUCOSE) return 'level-very-high'
  if (value >= HIGH_GLUCOSE) return 'level-high'
  return 'level-ok'
}

export function TodayView({ entries, onSave }: Props) {
  const today = todayString()
  const lunch = getEntryForDay(entries, today, 'lunch')
  const dinner = getEntryForDay(entries, today, 'dinner')
  const [editing, setEditing] = useState<MealSlot | null>(null)

  const draft = useMemo(() => {
    if (!editing) return undefined
    return getEntryForDay(entries, today, editing)
  }, [entries, editing, today])

  const bothDone = Boolean(lunch && dinner)

  function handleSave(input: EntryInput) {
    onSave(input, draft?.id)
    setEditing(null)
  }

  return (
    <div className="panel today-panel">
      <header className="panel-head">
        <p className="eyebrow">오늘의 기록</p>
        <h2>{formatKoreanDate(today)}</h2>
        <p className="sub">점심·저녁 카드의 입력을 눌러 혈당과 식사를 남겨 보세요.</p>
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
            key={`${editing}-${draft?.id ?? 'new'}`}
            initial={draft}
            defaultSlot={editing}
            defaultDate={today}
            submitLabel={draft ? '수정 저장' : '오늘 기록 저장'}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : bothDone ? (
        <p className="all-done">오늘 점심·저녁 기록을 모두 남겼어요.</p>
      ) : null}
    </div>
  )
}
