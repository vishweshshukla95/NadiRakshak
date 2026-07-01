import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function MunicipalityNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { to:'/municipality', label:'Dashboard' },
    { to:'/municipality/alerts', label:'Alerts' },
    { to:'/municipality/hotspots', label:'Hotspot Map' },
    { to:'/municipality/trends', label:'Trends' },
    { to:'/municipality/reports', label:'Reports' },
    { to:'/municipality/about', label:'About' },
  ]

  function handleLogout() {
    localStorage.removeItem('nadirakshak_municipality_auth')
    localStorage.removeItem('nadirakshak_municipality_user')
    navigate('/')
  }

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background: scrolled ? 'rgba(4,13,26,0.95)' : 'rgba(4,13,26,0.85)',
      backdropFilter:'blur(16px)',
      borderBottom:'1px solid rgba(26,143,227,0.15)',
      transition:'all 0.4s ease', padding:'0 32px', height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div onClick={() => navigate('/municipality')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:24 }}>🌊</span>
        <span style={{ color:'#1a8fe3', fontWeight:700, fontSize:16, letterSpacing:'-0.5px' }}>NadiRakshak</span>
        <span style={{ background:'rgba(26,143,227,0.12)', color:'#1a8fe3', fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>MUNICIPALITY</span>
      </div>
      <div style={{ display:'flex', gap:2, alignItems:'center', flexWrap:'wrap' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: location.pathname === l.to ? '#1a8fe3' : 'rgba(143,168,192,0.8)',
            textDecoration:'none', padding:'6px 12px', borderRadius:8, fontSize:13,
            background: location.pathname === l.to ? 'rgba(26,143,227,0.1)' : 'transparent',
            border: location.pathname === l.to ? '1px solid rgba(26,143,227,0.25)' : '1px solid transparent',
            transition:'all 0.2s',
          }}>{l.label}</Link>
        ))}
        <button onClick={handleLogout} style={{
          marginLeft:8, background:'rgba(255,68,68,0.1)', color:'#ff4444', border:'1px solid rgba(255,68,68,0.25)',
          padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600,
        }}>Logout</button>
      </div>
    </nav>
  )
}
