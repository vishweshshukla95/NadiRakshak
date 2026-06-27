import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{
      background: '#0f4c35',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🌊</span>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>
          NadiRakshak AI
        </span>
      </div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link to="/" style={{ color: '#a8d5b5', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
        <Link to="/alerts" style={{ color: '#a8d5b5', textDecoration: 'none', fontWeight: '500' }}>Alerts</Link>
        <Link to="/hotspots" style={{ color: '#a8d5b5', textDecoration: 'none', fontWeight: '500' }}>Hotspot Map</Link>
      </div>
    </nav>
  )
}
