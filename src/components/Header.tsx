export function Header() {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e4e4e7',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 7,
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff', fontWeight: 700,
          }}>
            M
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>Merchandise Intelligence</span>
          <span style={{ fontSize: 12, color: '#a1a1aa', marginLeft: 4 }}>Q3 2025</span>
        </div>

        <div style={{
          background: '#6366f1',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          AI Review
        </div>
      </div>
    </header>
  )
}
