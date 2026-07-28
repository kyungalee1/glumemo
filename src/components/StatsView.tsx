import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  analyzeCautionFoods,
  averageGlucose,
  monthlySeries,
  weeklySeries,
} from '../analysis'
import type { GlucoseEntry } from '../types'
import { HIGH_GLUCOSE } from '../types'

type Props = {
  entries: GlucoseEntry[]
}

type RangeMode = 'week' | 'month'

export function StatsView({ entries }: Props) {
  const [mode, setMode] = useState<RangeMode>('week')
  const [anchor, setAnchor] = useState(() => new Date())

  const series = useMemo(
    () => (mode === 'week' ? weeklySeries(entries, anchor) : monthlySeries(entries, anchor)),
    [entries, mode, anchor],
  )

  const rangeEntries = useMemo(() => {
    const dates = series.map((point) => point.date)
    if (dates.length === 0) return []
    const start = dates[0]
    const end = dates[dates.length - 1]
    return entries.filter((entry) => entry.date >= start && entry.date <= end)
  }, [entries, series])

  const avg = averageGlucose(rangeEntries)
  const breakfastAvg = averageGlucose(rangeEntries.filter((e) => e.slot === 'breakfast'))
  const lunchAvg = averageGlucose(rangeEntries.filter((e) => e.slot === 'lunch'))
  const dinnerAvg = averageGlucose(rangeEntries.filter((e) => e.slot === 'dinner'))
  const highCount = rangeEntries.filter((e) => e.glucose >= HIGH_GLUCOSE).length
  const cautions = useMemo(() => analyzeCautionFoods(entries), [entries])

  function shift(delta: number) {
    setAnchor((prev) => {
      const next = new Date(prev)
      if (mode === 'week') next.setDate(next.getDate() + delta * 7)
      else next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  const title =
    mode === 'week'
      ? `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 주간`
      : `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월`

  return (
    <div className="panel stats-panel">
      <header className="panel-head">
        <p className="eyebrow">통계</p>
        <h2>혈당 변화</h2>
      </header>

      <div className="mode-toggle">
        <button
          type="button"
          className={mode === 'week' ? 'slot active' : 'slot'}
          onClick={() => setMode('week')}
        >
          주간
        </button>
        <button
          type="button"
          className={mode === 'month' ? 'slot active' : 'slot'}
          onClick={() => setMode('month')}
        >
          월간
        </button>
      </div>

      <div className="range-nav">
        <button type="button" className="btn tiny" onClick={() => shift(-1)}>
          이전
        </button>
        <strong>{title}</strong>
        <button type="button" className="btn tiny" onClick={() => shift(1)}>
          다음
        </button>
      </div>

      <div className="stat-grid">
        <div>
          <span>평균</span>
          <strong>{avg ?? '—'}</strong>
        </div>
        <div>
          <span>아침 평균</span>
          <strong>{breakfastAvg ?? '—'}</strong>
        </div>
        <div>
          <span>점심 평균</span>
          <strong>{lunchAvg ?? '—'}</strong>
        </div>
        <div>
          <span>저녁 평균</span>
          <strong>{dinnerAvg ?? '—'}</strong>
        </div>
        <div>
          <span>{HIGH_GLUCOSE}+ 횟수</span>
          <strong>{highCount}</strong>
        </div>
      </div>

      <div className="chart-wrap">
        {rangeEntries.length === 0 ? (
          <p className="empty-state">이 기간에 기록이 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20,40,40,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#5a6a68' }}
                interval={mode === 'month' ? 3 : 0}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[60, 'auto']}
                tick={{ fontSize: 11, fill: '#5a6a68' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(20,40,40,0.1)',
                  background: '#f7faf8',
                }}
                formatter={(value) => {
                  if (value == null) return ['—', '']
                  return [`${value} mg/dL`, '']
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="breakfast"
                name="아침"
                stroke="#0369a1"
                strokeWidth={2.2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="lunch"
                name="점심"
                stroke="#0f766e"
                strokeWidth={2.4}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="dinner"
                name="저녁"
                stroke="#c2410c"
                strokeWidth={2.4}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="other"
                name="수시"
                stroke="#a16207"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <section className="caution-block">
        <h3>주의할 음식</h3>
        {cautions.length > 0 ? (
          <ul className="caution-list">
            {cautions.map((item) => (
              <li key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.count}회 · 평균 {item.avgGlucose} mg/dL
                  </span>
                </div>
                <em>+{item.delta}</em>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
