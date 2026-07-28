import { useEffect, useState, type FormEvent } from 'react'
import type { EntryInput } from '../hooks/useEntries'
import type { GlucoseEntry, MealSlot } from '../types'
import { SLOT_LABEL } from '../types'

type Props = {
  initial?: Partial<GlucoseEntry>
  defaultSlot?: MealSlot
  defaultDate?: string
  submitLabel?: string
  onSubmit: (input: EntryInput) => void
  onCancel?: () => void
}

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EntryForm({
  initial,
  defaultSlot = 'lunch',
  defaultDate,
  submitLabel = '저장',
  onSubmit,
  onCancel,
}: Props) {
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayDate())
  const [slot, setSlot] = useState<MealSlot>(initial?.slot ?? defaultSlot)
  const [time, setTime] = useState(initial?.time ?? nowTime())
  const [glucose, setGlucose] = useState(initial?.glucose?.toString() ?? '')
  const [foods, setFoods] = useState(initial?.foods ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initial) return
    setDate(initial.date ?? defaultDate ?? todayDate())
    setSlot(initial.slot ?? defaultSlot)
    setTime(initial.time ?? nowTime())
    setGlucose(initial.glucose?.toString() ?? '')
    setFoods(initial.foods ?? '')
    setNote(initial.note ?? '')
  }, [initial, defaultDate, defaultSlot])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(glucose)
    if (!Number.isFinite(value) || value < 40 || value > 600) {
      setError('혈당은 40~600 사이 숫자로 입력해 주세요.')
      return
    }
    if (!foods.trim()) {
      setError('먹은 음식을 적어 주세요. (쉼표로 여러 개 가능)')
      return
    }
    setError('')
    onSubmit({ date, slot, time, glucose: value, foods, note })
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          <span>날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          <span>시간</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
      </div>

      <fieldset className="slot-pick">
        <legend>측정 시점</legend>
        {(['lunch', 'dinner'] as MealSlot[]).map((item) => (
          <button
            key={item}
            type="button"
            className={slot === item ? 'slot active' : 'slot'}
            onClick={() => setSlot(item)}
          >
            {SLOT_LABEL[item]}
          </button>
        ))}
      </fieldset>

      <label>
        <span>혈당 (mg/dL)</span>
        <input
          inputMode="numeric"
          type="number"
          min={40}
          max={600}
          placeholder="예: 118"
          value={glucose}
          onChange={(e) => setGlucose(e.target.value)}
          required
        />
      </label>

      <label>
        <span>먹은 음식</span>
        <textarea
          rows={3}
          placeholder="예: 비빔밥, 된장찌개, 바나나"
          value={foods}
          onChange={(e) => setFoods(e.target.value)}
          required
        />
      </label>

      <label>
        <span>메모 (선택)</span>
        <input
          type="text"
          placeholder="운동, 컨디션 등"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="btn ghost" onClick={onCancel}>
            취소
          </button>
        ) : null}
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
