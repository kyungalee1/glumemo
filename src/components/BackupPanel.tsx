import { useRef, useState } from 'react'
import type { GlucoseEntry } from '../types'

type Props = {
  entries: GlucoseEntry[]
  onImport: (entries: GlucoseEntry[]) => void
}

function isEntry(value: unknown): value is GlucoseEntry {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.date === 'string' &&
    (item.slot === 'lunch' || item.slot === 'dinner') &&
    typeof item.time === 'string' &&
    typeof item.glucose === 'number' &&
    typeof item.foods === 'string'
  )
}

export function BackupPanel({ entries, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `glumemo-backup-${stamp}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('백업 파일을 저장했습니다.')
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { entries?: unknown } | unknown
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as { entries?: unknown }).entries)
          ? (parsed as { entries: unknown[] }).entries
          : null

      if (!list || !list.every(isEntry)) {
        setMessage('올바른 GluMemo 백업 파일이 아닙니다.')
        return
      }

      const normalized = list.map((item) => ({
        ...item,
        note: typeof item.note === 'string' ? item.note : '',
        createdAt:
          typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      }))

      if (
        !confirm(
          `백업 ${normalized.length}건으로 현재 기록을 바꿀까요?\n지금 기기의 기존 데이터는 덮어씁니다.`,
        )
      ) {
        return
      }

      onImport(normalized)
      setMessage(`${normalized.length}건을 가져왔습니다.`)
    } catch {
      setMessage('파일을 읽지 못했습니다.')
    }
  }

  return (
    <section className="backup-panel">
      <h3>데이터 백업</h3>
      <p className="sub">
        DB 없이 이 기기 브라우저에만 저장됩니다. 휴대폰을 바꾸거나 데이터를 지울 때를 대비해
        가끔 백업해 두세요.
      </p>
      <div className="backup-actions">
        <button type="button" className="btn primary" onClick={exportJson}>
          JSON 내보내기
        </button>
        <button type="button" className="btn ghost" onClick={() => inputRef.current?.click()}>
          JSON 가져오기
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
      </div>
      {message ? <p className="backup-msg">{message}</p> : null}
    </section>
  )
}
