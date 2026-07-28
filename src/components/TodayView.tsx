import { addDays, format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { formatKoreanDate, getEntryForDay } from '../analysis'
import type { EntryInput } from '../hooks/useEntries'
import type { GlucoseEntry, MealSlot } from '../types'
import {
  HIGH_GLUCOSE,
  REGULAR_SLOTS,
  SLOT_LABEL,
  VERY_HIGH_GLUCOSE,
} from '../types'
import { EntryForm } from './EntryForm'

type Props = {
  entries: GlucoseEntry[]
  onSave: (input: EntryInput, existingId?: string) => void
  onDelete: (id: string) => void
}

type Editor = {
  slot: MealSlot
  id?: string
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

export function TodayView({ entries, onSave, onDelete }: Props) {
  const today = todayString()
  const [selectedDate, setSelectedDate] = useState(today)
  const [editing, setEditing] = useState<Editor | null>(null)

  const isToday = selectedDate === today
  const others = useMemo(
    () =>
      entries
        .filter((entry) => entry.date === selectedDate && entry.slot === 'other')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [entries, selectedDate],
  )

  const draft = useMemo(() => {
    if (!editing) return undefined
    if (editing.id) return entries.find((entry) => entry.id === editing.id)
    if (editing.slot === 'other') return undefined
    return getEntryForDay(entries, selectedDate, editing.slot)
  }, [entries, editing, selectedDate])

  function moveDay(delta: number) {
    setEditing(null)
    setSelectedDate((prev) => shiftDate(prev, delta))
  }

  function handleSave(input: EntryInput) {
    onSave(input, editing?.id ?? draft?.id)
    setEditing(null)
  }

  function renderEntryBody(entry: GlucoseEntry) {
    return (
      <>
        <p className={`glucose-big ${levelClass(entry.glucose)}`}>
          {entry.glucose}
          <span>mg/dL</span>
        </p>
        <p className="muted">{entry.time} 측정</p>
        <p className="foods-line">{entry.foods}</p>
        {entry.note ? <p className="note-line">{entry.note}</p> : null}
      </>
    )
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
          <div className="jump-today-wrap">
            <button
              type="button"
              className="btn tiny jump-today"
              onClick={() => {
                setEditing(null)
                setSelectedDate(today)
              }}
            >
              오늘로 이동
            </button>
          </div>
        ) : null}
      </header>

      <div className="slot-cards">
        {REGULAR_SLOTS.map((slot) => {
          const entry = getEntryForDay(entries, selectedDate, slot)
          const isOpen = editing?.slot === slot
          return (
            <article key={slot} className={isOpen ? 'slot-card active' : 'slot-card'}>
              <div className="slot-card-top">
                <h3>{SLOT_LABEL[slot]}</h3>
                <button
                  type="button"
                  className="btn tiny"
                  onClick={() => setEditing(isOpen ? null : { slot })}
                >
                  {isOpen ? '닫기' : entry ? '수정' : '입력'}
                </button>
              </div>
              {entry ? renderEntryBody(entry) : <p className="empty-slot">아직 기록이 없어요.</p>}
            </article>
          )
        })}
      </div>

      <section className="other-block">
        <div className="other-head">
          <h3>수시 측정</h3>
          <button
            type="button"
            className="btn tiny"
            onClick={() =>
              setEditing(
                editing?.slot === 'other' && !editing.id ? null : { slot: 'other' },
              )
            }
          >
            {editing?.slot === 'other' && !editing.id ? '닫기' : '+ 추가'}
          </button>
        </div>
        {others.length === 0 ? (
          <p className="empty-slot">휴일·불규칙 측정은 여기에 남겨 보세요.</p>
        ) : (
          <div className="slot-cards other-cards">
            {others.map((entry) => {
              const isOpen = editing?.id === entry.id
              return (
                <article key={entry.id} className={isOpen ? 'slot-card active' : 'slot-card'}>
                  <div className="slot-card-top">
                    <h3>{entry.time}</h3>
                    <div className="slot-card-actions">
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() =>
                          setEditing(isOpen ? null : { slot: 'other', id: entry.id })
                        }
                      >
                        {isOpen ? '닫기' : '수정'}
                      </button>
                      <button
                        type="button"
                        className="btn tiny danger"
                        onClick={() => {
                          if (confirm('이 수시 측정을 삭제할까요?')) {
                            if (editing?.id === entry.id) setEditing(null)
                            onDelete(entry.id)
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {renderEntryBody(entry)}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {editing ? (
        <section className="composer">
          <h3>
            {SLOT_LABEL[editing.slot]} {draft ? '수정' : '새 기록'}
          </h3>
          <EntryForm
            key={`${selectedDate}-${editing.slot}-${editing.id ?? draft?.id ?? 'new'}`}
            initial={draft}
            defaultSlot={editing.slot}
            defaultDate={selectedDate}
            submitLabel={draft ? '수정 저장' : '기록 저장'}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : null}
    </div>
  )
}
