import type { AiDiagnosis, UrgencyLabel } from '../data/types'

export const DIAGNOSIS_COLORS: Record<AiDiagnosis, {
  bg: string; text: string; dot: string; chart: string
}> = {
  'On Track':        { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', chart: '#22c55e' },
  'Wrong Price':     { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', chart: '#f59e0b' },
  'Wrong Location':  { bg: '#f5f3ff', text: '#6d28d9', dot: '#8b5cf6', chart: '#8b5cf6' },
  'Wrong Product':   { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', chart: '#ef4444' },
  'Over-discounted': { bg: '#fff7ed', text: '#c2410c', dot: '#f97316', chart: '#f97316' },
}

export const URGENCY_COLORS: Record<UrgencyLabel, { bg: string; text: string; border: string }> = {
  Critical: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  OK:       { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Reorder:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
}

interface DiagnosisBadgeProps {
  diagnosis: AiDiagnosis
  size?: 'sm' | 'md'
}

export function DiagnosisBadge({ diagnosis, size = 'md' }: DiagnosisBadgeProps) {
  const c = DIAGNOSIS_COLORS[diagnosis]
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      whiteSpace: 'nowrap',
      border: `1px solid ${c.dot}33`,
    }}>
      <span style={{
        width: 5, height: 5,
        borderRadius: '50%',
        background: c.dot,
        flexShrink: 0,
      }} />
      {diagnosis}
    </span>
  )
}

export function UrgencyBadge({ label }: { label: UrgencyLabel }) {
  const c = URGENCY_COLORS[label]
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  )
}
