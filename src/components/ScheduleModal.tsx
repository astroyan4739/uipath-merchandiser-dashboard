import { useState } from 'react'

interface Props {
  onClose: () => void
}

export function ScheduleModal({ onClose }: Props) {
  const [email, setEmail] = useState('astroyan.ux@gmail.com')
  const [frequency, setFrequency] = useState('daily')
  const [time, setTime] = useState('08:00')
  const [timezone, setTimezone] = useState('Europe/London')
  const [content, setContent] = useState<string[]>(['gross_sales', 'orders', 'sell_through', 'gross_margin', 'ai_actions'])
  const [scheduled, setScheduled] = useState(false)

  const toggleContent = (id: string) => {
    setContent(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const METRICS = [
    { id: 'gross_sales', label: 'Gross Sales' },
    { id: 'orders', label: 'Orders' },
    { id: 'sell_through', label: 'Sell-Through Rate' },
    { id: 'gross_margin', label: 'Gross Margin' },
    { id: 'top_products', label: 'Top 5 Products' },
    { id: 'bottom_products', label: 'Bottom 5 Products' },
    { id: 'ai_actions', label: 'AI Business Actions' },
  ]

  if (scheduled) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Report scheduled
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            You'll receive a PDF dashboard to <strong>{email}</strong><br />
            every {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'} at {time} ({timezone})
          </div>
          <div style={{
            marginTop: 16, padding: '8px 12px',
            background: 'var(--accent-bg)', borderRadius: 6,
            fontSize: 11, color: 'var(--accent)', fontWeight: 500,
          }}>
            UI prototype only — no actual email will be sent
          </div>
          <button
            onClick={onClose}
            style={{
              marginTop: 20, padding: '8px 24px',
              borderRadius: 7, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >Done</button>
        </div>
      </Overlay>
    )
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Schedule Dashboard Report</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
            Receive a PDF snapshot of your dashboard by email
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text-muted)',
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Recipient Email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Frequency">
            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={inputStyle}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Field>
          <Field label="Send at">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Timezone">
          <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
            <option value="Europe/London">Europe/London (GMT+1)</option>
            <option value="America/New_York">America/New_York (GMT-4)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (GMT-7)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
          </select>
        </Field>

        <Field label="PDF Content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {METRICS.map(m => (
              <label
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px',
                  borderRadius: 5,
                  border: `1px solid ${content.includes(m.id) ? 'var(--accent)' : 'var(--border)'}`,
                  background: content.includes(m.id) ? 'var(--accent-bg)' : 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: 12, color: content.includes(m.id) ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: content.includes(m.id) ? 500 : 400,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={content.includes(m.id)}
                  onChange={() => toggleContent(m.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 10 }}>{content.includes(m.id) ? '☑' : '☐'}</span>
                {m.label}
              </label>
            ))}
          </div>
        </Field>

        <div style={{
          padding: '8px 12px',
          background: '#fffbeb', borderRadius: 6,
          border: '1px solid #fde68a',
          fontSize: 11, color: '#92400e',
        }}>
          ⚠️ UI prototype only — scheduling and PDF generation not yet implemented.
        </div>

        <button
          onClick={() => setScheduled(true)}
          style={{
            padding: '10px 0',
            borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Schedule Report
        </button>
      </div>
    </Overlay>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 12,
  color: 'var(--text)',
  background: 'var(--surface)',
  outline: 'none',
  boxSizing: 'border-box',
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 14,
          padding: '24px',
          width: '100%', maxWidth: 460,
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
