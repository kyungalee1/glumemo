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

  const hour = new Date().getHours()
  const suggested: MealSlot = hour >= 16 ? 'dinner' : 'lunch'

  const openSlot = editing ?? (lunch && dinner ? null : suggested)

  const draft = useMemo(() => {
    if (!openSlot) return undefined
    return getEntryForDay(entries, today, openSlot)
  }, [entries, openSlot, today])

  function handleSave(input: EntryInput) {
    onSave(input, draft?.id)
    setEditing(null)
  }

  return (
    <div className="panel today-panel">
      <header className="panel-head">
        <p className="eyebrow">오늘의 기록</p>
        <h2>{formatKoreanDate(today)}</h2>
        <p className="sub">점심·저녁 하루 두 번 혈당과 식사를 남겨 보세요.</p>
      </header>

      <div className="slot-cards">
        {(['lunch', 'dinner'] as MealSlot[]).map((slot) => {
          const entry = slot === 'lunch' ? lunch : dinner
          return (
            <article key={slot} className="slot-card">
              <div className="slot-card-top">
                <h3>{SLOT_LABEL[slot]}</h3>
                <button
                  type="button"
                  className="btn tiny"
                  onClick={() => setEditing(slot)}
                >
                  {entry ? '수정' : '입력'}
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

      {openSlot ? (
        <section className="composer">
          <h3>
            {SLOT_LABEL[openSlot]} {draft ? '수정' : '새 기록'}
          </h3>
          <EntryForm
            key={`${openSlot}-${draft?.id ?? 'new'}`}
            initial={draft}
            defaultSlot={openSlot}
            defaultDate={today}
            submitLabel={draft ? '수정 저장' : '오늘 기록 저장'}
            onSubmit={handleSave}
            onCancel={editing ? () => setEditing(null) : undefined}
          />
        </section>
      ) : (
        <p className="all-done">오늘 점심·저녁 기록을 모두 남겼어요.</p>
      )}
    </div>
  )
}
