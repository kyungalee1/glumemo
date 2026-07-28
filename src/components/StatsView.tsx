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

type DotProps = {
  cx?: number
  cy?: number
  payload?: Record<string, number | string | null>
}

function SlotDot({
  cx,
  cy,
  payload,
  dataKey,
  fill,
  shape,
}: DotProps & {
  dataKey: string
  fill: string
  shape: 'circle' | 'square' | 'triangle' | 'diamond'
}) {
  if (cx == null || cy == null || payload?.[dataKey] == null) return null

  if (shape === 'square') {
    return <rect x={cx - 4.5} y={cy - 4.5} width={9} height={9} fill={fill} rx={1} />
  }
  if (shape === 'triangle') {
    return <path d={`M ${cx} ${cy - 6} L ${cx + 6} ${cy + 5} L ${cx - 6} ${cy + 5} Z`} fill={fill} />
  }
  if (shape === 'diamond') {
    return (
      <path d={`M ${cx} ${cy - 6} L ${cx + 5} ${cy} L ${cx} ${cy + 6} L ${cx - 5} ${cy} Z`} fill={fill} />
    )
  }
  return <circle cx={cx} cy={cy} r={5} fill={fill} />
}

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

      <div className="stat-summary">
        <div className="stat-top-row">
          <div className="stat-overall">
            <span>전체 평균</span>
            <strong>{avg ?? '—'}</strong>
          </div>
          <div className="stat-high compact">
            <span>{HIGH_GLUCOSE}+ 횟수</span>
            <strong>{highCount}</strong>
          </div>
        </div>
        <div className="stat-meals">
          <div>
            <span>🌅 아침</span>
            <strong>{breakfastAvg ?? '—'}</strong>
          </div>
          <div>
            <span>☀️ 점심</span>
            <strong>{lunchAvg ?? '—'}</strong>
          </div>
          <div>
            <span>🌙 저녁</span>
            <strong>{dinnerAvg ?? '—'}</strong>
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        {rangeEntries.length === 0 ? (
          <p className="empty-state">이 기간에 기록이 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
                type="linear"
                dataKey="breakfast"
                name="🌅 아침 ●"
                stroke="transparent"
                strokeWidth={0}
                connectNulls={false}
                isAnimationActive={false}
                legendType="circle"
                activeDot={{ r: 7, fill: '#0284c7' }}
                dot={(props) => (
                  <SlotDot {...props} dataKey="breakfast" fill="#0284c7" shape="circle" />
                )}
              />
              <Line
                type="linear"
                dataKey="lunch"
                name="☀️ 점심 ■"
                stroke="transparent"
                strokeWidth={0}
                connectNulls={false}
                isAnimationActive={false}
                legendType="square"
                activeDot={{ r: 7, fill: '#059669' }}
                dot={(props) => (
                  <SlotDot {...props} dataKey="lunch" fill="#059669" shape="square" />
                )}
              />
              <Line
                type="linear"
                dataKey="dinner"
                name="🌙 저녁 ▲"
                stroke="transparent"
                strokeWidth={0}
                connectNulls={false}
                isAnimationActive={false}
                legendType="triangle"
                activeDot={{ r: 7, fill: '#ea580c' }}
                dot={(props) => (
                  <SlotDot {...props} dataKey="dinner" fill="#ea580c" shape="triangle" />
                )}
              />
              <Line
                type="linear"
                dataKey="other"
                name="⏱️ 수시 ◆"
                stroke="transparent"
                strokeWidth={0}
                connectNulls={false}
                isAnimationActive={false}
                legendType="diamond"
                activeDot={{ r: 7, fill: '#a16207' }}
                dot={(props) => (
                  <SlotDot {...props} dataKey="other" fill="#a16207" shape="diamond" />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <section className="caution-block">
        <h3>주의할 음식</h3>
        {cautions.filter((item) => item.level === 'caution').length > 0 ? (
          <ul className="caution-list">
            {cautions
              .filter((item) => item.level === 'caution')
              .map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      140+ {item.count}회 · 그때 평균 {item.avgGlucose}
                    </span>
                  </div>
                  <em>주의</em>
                </li>
              ))}
          </ul>
        ) : null}

        <h3 className="caution-subhead">한번 높게 나온 음식</h3>
        {cautions.filter((item) => item.level === 'once').length > 0 ? (
          <ul className="caution-list once-list">
            {cautions
              .filter((item) => item.level === 'once')
              .map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>140+ 1회 · {item.avgGlucose} mg/dL</span>
                  </div>
                  <em>관심</em>
                </li>
              ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
