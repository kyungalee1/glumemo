import { useState } from 'react'
import { analyzeCautionFoods } from './analysis'
import { HistoryView } from './components/HistoryView'
import { StatsView } from './components/StatsView'
import { TodayView } from './components/TodayView'
import { useEntries } from './hooks/useEntries'
import type { TabId } from './types'
import './App.css'

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'history', label: '기록' },
  { id: 'stats', label: '통계' },
]

function App() {
  const { entries, upsertEntry, deleteEntry } = useEntries()
  const [tab, setTab] = useState<TabId>('today')
  const topCaution = analyzeCautionFoods(entries)[0]

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <header className="app-header">
        <div>
          <p className="brand">GluMemo</p>
          <h1>혈당·식사 일기</h1>
        </div>
        <p className="header-meta">아침·점심·저녁·수시</p>
      </header>

      {topCaution ? (
        <aside className="alert-strip" role="status">
          <strong>주의</strong>
          <span>
            {topCaution.name} 먹을 때 평균이 전체보다 +{topCaution.delta} 높았어요.
          </span>
        </aside>
      ) : null}

      <main className="app-main">
        {tab === 'today' ? (
          <TodayView entries={entries} onSave={upsertEntry} onDelete={deleteEntry} />
        ) : null}
        {tab === 'history' ? (
          <HistoryView entries={entries} onSave={upsertEntry} onDelete={deleteEntry} />
        ) : null}
        {tab === 'stats' ? <StatsView entries={entries} /> : null}
      </main>

      <nav className="tab-bar" aria-label="주요 메뉴">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'tab active' : 'tab'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
