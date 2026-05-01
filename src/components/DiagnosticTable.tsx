import { useState, useMemo } from 'react'
import { Select } from '@base-ui-components/react/select'
import type { SKU, AiDiagnosis, Category } from '../data/types'
import { DiagnosisBadge, DIAGNOSIS_COLORS } from './DiagnosisBadge'

interface DiagnosticTableProps {
  skus: SKU[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

type SortKey = keyof Pick<SKU,
  'product_name' | 'category' | 'sell_through_pct' | 'st_gap' |
  'gross_margin_pct' | 'ai_diagnosis' | 'days_since_last_markdown' |
  'weeks_of_supply' | 'projected_st_lift_pct'
>

const CATEGORIES: Category[] = ['Outerwear', 'Knitwear', 'Denim', 'Accessories', 'Footwear']
const DIAGNOSES: AiDiagnosis[] = ['On Track', 'Wrong Price', 'Wrong Location', 'Wrong Product', 'Over-discounted']

const selectTriggerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#fff',
  border: '1px solid #e4e4e7',
  borderRadius: 7,
  padding: '5px 10px',
  fontSize: 12,
  color: '#71717a',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
}

const popupStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e4e4e7',
  borderRadius: 8,
  padding: '4px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  zIndex: 100,
  minWidth: 160,
  outline: 'none',
}

const itemStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 5,
  fontSize: 12,
  color: '#18181b',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  outline: 'none',
}

export function DiagnosticTable({ skus, selectedId, onSelect }: DiagnosticTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('sell_through_pct')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [catFilter, setCatFilter] = useState<string>('')
  const [diagFilter, setDiagFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    return skus
      .filter(s => !catFilter || s.category === catFilter)
      .filter(s => !diagFilter || s.ai_diagnosis === diagFilter)
      .filter(s => !search || s.product_name.toLowerCase().includes(search.toLowerCase()) || s.sku_id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (typeof av === 'string' && typeof bv === 'string')
          return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
      })
  }, [skus, catFilter, diagFilter, search, sortKey, sortDir])

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid #f4f4f5',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        background: '#fafafa',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginRight: 4 }}>SKU Diagnostics</div>
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1px solid #e4e4e7',
            borderRadius: 7,
            padding: '5px 10px',
            fontSize: 12,
            color: '#18181b',
            outline: 'none',
            width: 150,
            background: '#fff',
          }}
        />

        <FilterSelect
          value={catFilter}
          onChange={setCatFilter}
          placeholder="All categories"
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
        />
        <FilterSelect
          value={diagFilter}
          onChange={setDiagFilter}
          placeholder="All diagnoses"
          options={DIAGNOSES.map(d => ({ value: d, label: d }))}
        />

        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#a1a1aa' }}>
          <span style={{ color: '#18181b', fontWeight: 500 }}>{filtered.length}</span> of {skus.length} SKUs
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
              {([
                { key: 'product_name', label: 'Product' },
                { key: 'category', label: 'Category' },
                { key: 'sell_through_pct', label: 'ST %' },
                { key: 'st_gap', label: 'vs Target' },
                { key: 'gross_margin_pct', label: 'Margin' },
                { key: 'ai_diagnosis', label: 'Diagnosis' },
                { key: null, label: 'Action' },
                { key: 'days_since_last_markdown', label: 'Days No MD' },
                { key: 'weeks_of_supply', label: 'WoS' },
                { key: 'projected_st_lift_pct', label: 'Proj. Lift' },
              ] as { key: SortKey | null; label: string }[]).map(col => (
                <th
                  key={col.label}
                  onClick={col.key ? () => handleSort(col.key!) : undefined}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: sortKey === col.key ? '#18181b' : '#a1a1aa',
                    letterSpacing: '0.03em',
                    cursor: col.key ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    background: '#fafafa',
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 3, opacity: 0.7 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((sku, i) => {
              const isSelected = sku.sku_id === selectedId
              const diagColor = DIAGNOSIS_COLORS[sku.ai_diagnosis]
              return (
                <tr
                  key={sku.sku_id}
                  onClick={() => onSelect(isSelected ? null : sku.sku_id)}
                  style={{
                    background: isSelected ? '#f5f3ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                    borderBottom: '1px solid #f4f4f5',
                    borderLeft: `2px solid ${isSelected ? '#6366f1' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = '#f9f9fb' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#fafafa' }}
                >
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#18181b' }}>{sku.product_name}</div>
                    <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 1 }}>{sku.sku_id}</div>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#71717a' }}>{sku.category}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <STBar value={sku.sell_through_pct} target={sku.st_target_pct} />
                  </td>
                  <td style={{ padding: '10px 16px', color: sku.st_gap >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {sku.st_gap >= 0 ? '+' : ''}{sku.st_gap.toFixed(1)}pp
                  </td>
                  <td style={{ padding: '10px 16px', color: sku.gross_margin_pct >= 50 ? '#18181b' : '#b45309', fontWeight: 500 }}>
                    {sku.gross_margin_pct.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <DiagnosisBadge diagnosis={sku.ai_diagnosis} size="sm" />
                  </td>
                  <td style={{ padding: '10px 16px', color: diagColor.text, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {sku.recommended_action}
                  </td>
                  <td style={{ padding: '10px 16px', color: sku.days_since_last_markdown > 30 ? '#dc2626' : '#a1a1aa', fontWeight: sku.days_since_last_markdown > 30 ? 600 : 400 }}>
                    {sku.days_since_last_markdown > 0 ? `${sku.days_since_last_markdown}d` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: sku.weeks_of_supply > 10 ? '#b45309' : '#71717a' }}>
                    {sku.weeks_of_supply.toFixed(1)}w
                  </td>
                  <td style={{ padding: '10px 16px', color: sku.projected_st_lift_pct > 0 ? '#16a34a' : '#a1a1aa', fontWeight: 500 }}>
                    {sku.projected_st_lift_pct > 0 ? `+${sku.projected_st_lift_pct}%` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: 13 }}>
            No SKUs match the current filters
          </div>
        )}
      </div>
    </div>
  )
}

function STBar({ value, target }: { value: number; target: number }) {
  const color = value >= target ? '#22c55e' : value >= target - 15 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 52, height: 3, background: '#f4f4f5', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ color, fontWeight: 600, minWidth: 36, fontSize: 12 }}>{value.toFixed(1)}%</span>
    </div>
  )
}

interface FilterSelectProps {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}

function FilterSelect({ value, onChange, placeholder, options }: FilterSelectProps) {
  return (
    <Select.Root value={value || null} onValueChange={v => onChange(v ?? '')}>
      <Select.Trigger style={selectTriggerStyle}>
        <Select.Value>
          {(v: string | null) => (
            <span style={{ color: v ? '#18181b' : '#a1a1aa' }}>
              {v ? options.find(o => o.value === v)?.label ?? placeholder : placeholder}
            </span>
          )}
        </Select.Value>
        <Select.Icon style={{ color: '#a1a1aa', fontSize: 10 }}>▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup style={popupStyle}>
            <Select.Item
              value=""
              style={itemStyle}
              onMouseEnter={e => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Select.ItemText style={{ color: '#a1a1aa' }}>{placeholder}</Select.ItemText>
            </Select.Item>
            {options.map(o => (
              <Select.Item
                key={o.value}
                value={o.value}
                style={itemStyle}
                onMouseEnter={e => (e.currentTarget.style.background = '#f4f4f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Select.ItemIndicator style={{ color: '#6366f1', fontSize: 10 }}>✓</Select.ItemIndicator>
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
