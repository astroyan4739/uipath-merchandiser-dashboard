import { useState, useRef, useEffect } from 'react'

export interface DateRange {
  start: Date
  end: Date
  label: string
}

const DEMO_TODAY = new Date(2026, 3, 30) // Fixed "today" for demo data

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function fmtDate(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  return cells
}

function d(year: number, month: number, day: number) { return new Date(year, month, day) }

const PRESETS: Record<string, DateRange> = {
  today:       { label: 'Today',          start: d(2026,3,30), end: d(2026,3,30) },
  yesterday:   { label: 'Yesterday',      start: d(2026,3,29), end: d(2026,3,29) },
  thisMonth:   { label: 'This month',     start: d(2026,3,1),  end: d(2026,3,30) },
  last7:       { label: 'Last 7 days',    start: d(2026,3,24), end: d(2026,3,30) },
  last30:      { label: 'Last 30 days',   start: d(2026,3,1),  end: d(2026,3,30) },
  last90:      { label: 'Last 90 days',   start: d(2026,1,1),  end: d(2026,3,30) },
  last365:     { label: 'Last 365 days',  start: d(2025,4,1),  end: d(2026,3,30) },
  lastWeek:    { label: 'Last week',      start: d(2026,3,21), end: d(2026,3,27) },
  lastMonth:   { label: 'Last month',     start: d(2026,2,1),  end: d(2026,2,31) },
  lastQuarter: { label: 'Last quarter',   start: d(2026,0,1),  end: d(2026,2,31) },
  last12m:     { label: 'Last 12 months', start: d(2025,4,1),  end: d(2026,3,30) },
  lastYear:    { label: 'Last year',      start: d(2025,0,1),  end: d(2025,11,31) },
  q1_2026:     { label: 'Q1 2026',        start: d(2026,0,1),  end: d(2026,2,31) },
  q4_2025:     { label: 'Q4 2025',        start: d(2025,9,1),  end: d(2025,11,31) },
  q3_2025:     { label: 'Q3 2025',        start: d(2025,6,1),  end: d(2025,8,30) },
  q2_2025:     { label: 'Q2 2025',        start: d(2025,3,1),  end: d(2025,5,30) },
}

function MonthCalendar({
  year, month, start, end, hovered, onClickDay, onHoverDay,
  showLeftArrow, showRightArrow, onPrev, onNext,
}: {
  year: number; month: number
  start: Date | null; end: Date | null; hovered: Date | null
  onClickDay: (d: Date) => void; onHoverDay: (d: Date | null) => void
  showLeftArrow?: boolean; showRightArrow?: boolean
  onPrev?: () => void; onNext?: () => void
}) {
  const cells = getCalendarCells(year, month)
  const rangeEnd = hovered && start && !end
    ? (hovered >= start ? hovered : start)
    : end
  const rangeStart = hovered && start && !end
    ? (hovered >= start ? start : hovered)
    : start

  return (
    <div style={{ width: 280 }}>
      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {showLeftArrow
          ? <button onClick={onPrev} style={arrowBtn}>←</button>
          : <div style={{ width: 28 }} />}
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {MONTHS[month]} {year}
        </span>
        {showRightArrow
          ? <button onClick={onNext} style={arrowBtn}>→</button>
          : <div style={{ width: 28 }} />}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#888', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />

          const date = new Date(year, month, day)
          const isStart = start ? sameDay(date, start) : false
          const isEnd = rangeEnd ? sameDay(date, rangeEnd) : false
          const inRange = rangeStart && rangeEnd && date > rangeStart && date < rangeEnd
          const isToday = sameDay(date, DEMO_TODAY)
          const isFuture = date > DEMO_TODAY
          const isSelected = isStart || isEnd

          // Range fill background per cell
          let bgGradient = 'transparent'
          const rangeColor = '#e5e7eb'
          if (rangeStart && rangeEnd && !sameDay(rangeStart, rangeEnd)) {
            if (isStart) bgGradient = `linear-gradient(to right, transparent 50%, ${rangeColor} 50%)`
            else if (isEnd) bgGradient = `linear-gradient(to left, transparent 50%, ${rangeColor} 50%)`
            else if (inRange) bgGradient = rangeColor
          }

          return (
            <div
              key={day}
              onClick={() => !isFuture && onClickDay(date)}
              onMouseEnter={() => !isFuture && onHoverDay(date)}
              onMouseLeave={() => onHoverDay(null)}
              style={{
                background: bgGradient,
                cursor: isFuture ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1px 0',
              }}
            >
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: isSelected ? '#111' : 'transparent',
                color: isSelected ? '#fff' : isFuture ? '#ccc' : '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
                fontWeight: isToday ? 700 : 400,
              }}>
                {day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const arrowBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid #e5e7eb', background: '#fff',
  cursor: 'pointer', fontSize: 14, color: '#555',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

type SidebarMode = 'main' | 'last' | 'quarters'

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [sidebar, setSidebar] = useState<SidebarMode>('main')
  const [pendingStart, setPendingStart] = useState<Date | null>(value.start)
  const [pendingEnd, setPendingEnd] = useState<Date | null>(value.end)
  const [hovered, setHovered] = useState<Date | null>(null)
  // Right calendar month
  const [rightYear, setRightYear] = useState(2026)
  const [rightMonth, setRightMonth] = useState(3) // April

  const pickerRef = useRef<HTMLDivElement>(null)

  const leftYear = rightMonth === 0 ? rightYear - 1 : rightYear
  const leftMonth = rightMonth === 0 ? 11 : rightMonth - 1

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    setPendingStart(value.start)
    setPendingEnd(value.end)
    setSidebar('main')
    setOpen(true)
  }

  const applyPreset = (preset: DateRange) => {
    setPendingStart(preset.start)
    setPendingEnd(preset.end)
    // Navigate calendar to show the end date's month
    setRightYear(preset.end.getFullYear())
    setRightMonth(preset.end.getMonth())
  }

  const handleClickDay = (date: Date) => {
    if (!pendingStart || (pendingStart && pendingEnd)) {
      setPendingStart(date)
      setPendingEnd(null)
    } else {
      if (date >= pendingStart) {
        setPendingEnd(date)
      } else {
        setPendingEnd(pendingStart)
        setPendingStart(date)
      }
    }
  }

  const handleApply = () => {
    if (!pendingStart) return
    const end = pendingEnd ?? pendingStart
    const days = Math.round((end.getTime() - pendingStart.getTime()) / 86400000) + 1

    let label: string
    // Check if it matches a preset
    const matched = Object.values(PRESETS).find(
      p => sameDay(p.start, pendingStart!) && sameDay(p.end, end)
    )
    if (matched) {
      label = matched.label
    } else if (days === 1) {
      label = fmtDate(pendingStart)
    } else {
      label = `${MONTH_SHORT[pendingStart.getMonth()]} ${pendingStart.getDate()} – ${MONTH_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
    }

    onChange({ start: pendingStart, end, label })
    setOpen(false)
  }

  const prevMonth = () => {
    if (rightMonth === 0) { setRightMonth(11); setRightYear(y => y - 1) }
    else setRightMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (rightMonth === 11) { setRightMonth(0); setRightYear(y => y + 1) }
    else setRightMonth(m => m + 1)
  }

  const SidebarItem = ({ label, hasArrow, onClick, active }: {
    label: string; hasArrow?: boolean; onClick: () => void; active?: boolean
  }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '8px 12px',
        border: 'none', borderRadius: 6,
        background: active ? '#f3f4f6' : 'transparent',
        cursor: 'pointer', fontSize: 13, color: '#111',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? '#f3f4f6' : 'transparent' }}
    >
      {label}
      {hasArrow && <span style={{ color: '#888' }}>›</span>}
    </button>
  )

  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px',
          background: open ? '#f3f4f6' : 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          fontSize: 11, fontWeight: 500, color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {value.label}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 200,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
          display: 'flex',
          minWidth: 700,
          overflow: 'hidden',
        }}>
          {/* Sidebar */}
          <div style={{
            width: 200, borderRight: '1px solid #e5e7eb',
            padding: '12px 8px',
            background: '#fafafa',
            flexShrink: 0,
          }}>
            {sidebar === 'main' && (
              <>
                <SidebarItem label="Today"         onClick={() => applyPreset(PRESETS.today)} />
                <SidebarItem label="Yesterday"     onClick={() => applyPreset(PRESETS.yesterday)} />
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Last"          hasArrow onClick={() => setSidebar('last')} />
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Quarters"      hasArrow onClick={() => setSidebar('quarters')} />
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Custom range"  onClick={() => { setPendingStart(null); setPendingEnd(null) }} />
              </>
            )}

            {sidebar === 'last' && (
              <>
                <button
                  onClick={() => setSidebar('main')}
                  style={{ ...backBtnStyle }}
                >← Last</button>
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Last 7 days"    onClick={() => applyPreset(PRESETS.last7)} />
                <SidebarItem label="Last 30 days"   onClick={() => applyPreset(PRESETS.last30)} />
                <SidebarItem label="Last 90 days"   onClick={() => applyPreset(PRESETS.last90)} />
                <SidebarItem label="Last 365 days"  onClick={() => applyPreset(PRESETS.last365)} />
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Last week"      onClick={() => applyPreset(PRESETS.lastWeek)} />
                <SidebarItem label="Last month"     onClick={() => applyPreset(PRESETS.lastMonth)} />
                <SidebarItem label="Last quarter"   onClick={() => applyPreset(PRESETS.lastQuarter)} />
                <SidebarItem label="Last 12 months" onClick={() => applyPreset(PRESETS.last12m)} />
                <SidebarItem label="Last year"      onClick={() => applyPreset(PRESETS.lastYear)} />
              </>
            )}

            {sidebar === 'quarters' && (
              <>
                <button onClick={() => setSidebar('main')} style={backBtnStyle}>← Quarters</button>
                <div style={{ height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                <SidebarItem label="Q1 2026" onClick={() => applyPreset(PRESETS.q1_2026)} />
                <SidebarItem label="Q4 2025" onClick={() => applyPreset(PRESETS.q4_2025)} />
                <SidebarItem label="Q3 2025" onClick={() => applyPreset(PRESETS.q3_2025)} />
                <SidebarItem label="Q2 2025" onClick={() => applyPreset(PRESETS.q2_2025)} />
              </>
            )}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Date inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={dateInputStyle}>{pendingStart ? fmtDate(pendingStart) : '—'}</div>
              <span style={{ color: '#888' }}>→</span>
              <div style={dateInputStyle}>{pendingEnd ? fmtDate(pendingEnd) : '—'}</div>
            </div>

            {/* Dual calendar */}
            <div style={{ display: 'flex', gap: 24 }}>
              <MonthCalendar
                year={leftYear} month={leftMonth}
                start={pendingStart} end={pendingEnd} hovered={hovered}
                onClickDay={handleClickDay} onHoverDay={setHovered}
                showLeftArrow onPrev={prevMonth}
              />
              <div style={{ width: 1, background: '#e5e7eb' }} />
              <MonthCalendar
                year={rightYear} month={rightMonth}
                start={pendingStart} end={pendingEnd} hovered={hovered}
                onClickDay={handleClickDay} onHoverDay={setHovered}
                showRightArrow onNext={nextMonth}
              />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  border: '1px solid #e5e7eb', background: '#fff',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleApply}
                disabled={!pendingStart}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  border: 'none', background: pendingStart ? '#111' : '#ccc',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: pendingStart ? 'pointer' : 'not-allowed',
                }}
              >Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const dateInputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px',
  border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 13, color: '#111', background: '#fff',
}

const backBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'left',
  padding: '6px 12px',
  border: 'none', borderRadius: 6,
  background: 'transparent', cursor: 'pointer',
  fontSize: 13, fontWeight: 700, color: '#111',
}
