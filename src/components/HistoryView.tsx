import { useMemo, useState } from 'react'
import { formatKoreanDate } from '../analysis'
import type { EntryInput } from '../hooks/useEntries'
import type { GlucoseEntry } from '../types'
import { HIGH_GLUCOSE, SLOT_LABEL, VERY_HIGH_GLUCOSE } from '../types'
import { EntryForm } from './EntryForm'

type Props = {
  entries: GlucoseEntry[]
  onSave: (input: EntryInput, existingId?: string) => void
  onDelete: (id: string) => void
}

function levelClass(value: number) {
  if (value >= VERY_HIGH_GLUCOSE) return 'level-very-high'
  if (value >= HIGH_GLUCOSE) return 'level-high'
  return 'level-ok'
}

export function HistoryView({ entries, onSave, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const editing = useMemo(
    () => entries.find((entry) => entry.id === editingId),
    [entries, editingId],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, GlucoseEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    return [...map.entries()]
  }, [entries])

  return (
    <div className="panel history-panel">
      <header className="panel-head row">
        <div>
          <p className="eyebrow">전체 기록</p>
          <h2>히스토리</h2>
          <p className="sub">총 {entries.length}건 · 지난 기록을 수정하거나 보완할 수 있어요.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setAdding(true)}>
          + 추가
        </button>
      </header>

      {(adding || editing) && (
        <section className="composer">
          <h3>{editing ? '기록 수정' : '과거 기록 추가'}</h3>
          <EntryForm
            key={editing?.id ?? 'add'}
            initial={editing}
            submitLabel={editing ? '수정 저장' : '추가 저장'}
            onSubmit={(input) => {
              onSave(input, editing?.id)
              setEditingId(null)
              setAdding(false)
            }}
            onCancel={() => {
              setEditingId(null)
              setAdding(false)
            }}
          />
        </section>
      )}

      {grouped.length === 0 ? (
        <p className="empty-state">아직 저장된 기록이 없습니다. 오늘부터 남겨 보세요.</p>
      ) : (
        <div className="history-list">
          {grouped.map(([date, dayEntries]) => (
            <section key={date} className="history-day">
              <h3>{formatKoreanDate(date)}</h3>
              <ul>
                {dayEntries.map((entry) => (
                  <li key={entry.id}>
                    <div className="history-main">
                      <span className="pill">{SLOT_LABEL[entry.slot]}</span>
                      <strong className={levelClass(entry.glucose)}>{entry.glucose}</strong>
                      <span className="muted">{entry.time}</span>
                    </div>
                    <p className="foods-line">{entry.foods}</p>
                    {entry.note ? <p className="note-line">{entry.note}</p> : null}
                    <div className="history-actions">
                      <button type="button" className="btn tiny" onClick={() => setEditingId(entry.id)}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn tiny danger"
                        onClick={() => {
                          if (confirm('이 기록을 삭제할까요?')) onDelete(entry.id)
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
