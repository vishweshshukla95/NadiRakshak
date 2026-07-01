import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function CitizenNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { to:'/citizen', label:'Home' },
    { to:'/citizen/report', label:'Report' },
    { to:'/citizen/trends', label:'Trends' },
    { to:'/citizen/my-impact', label:'My Impact' },
    { to:'/citizen/leaderboard', label:'Leaderboard' },
    { to:'/citizen/ask-ai', label:'Ask AI' },
    { to:'/citizen/about', label:'About' },
  ]

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background: scrolled ? 'rgba(4,13,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,229,192,0.15)' : 'none',
      transition:'all 0.4s ease', padding:'0 32px', height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div onClick={() => navigate('/')} style={{ cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:24 }}>🌊</span>
        <span style={{ color:'#00e5c0', fontWeight:700, fontSize:16, letterSpacing:'-0.5px' }}>NadiRakshak</span>
        <span style={{ background:'rgba(0,229,192,0.1)', color:'#00e5c0', fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>CITIZEN</span>
      </div>
      <div style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: location.pathname === l.to ? '#00e5c0' : 'rgba(143,168,192,0.8)',
            textDecoration:'none', padding:'6px 12px', borderRadius:8, fontSize:13,
            background: location.pathname === l.to ? 'rgba(0,229,192,0.08)' : 'transparent',
            border: location.pathname === l.to ? '1px solid rgba(0,229,192,0.2)' : '1px solid transparent',
            transition:'all 0.2s',
          }}>{l.label}</Link>
        ))}
      </div>
    </nav>
  )
}
