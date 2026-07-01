import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/reports').then(res => {
      setLeaderboard(res.data.leaderboard || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  if (loading) return (
    <div style={{ background:'#040d1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(143,168,192,0.7)' }}>Loading leaderboard...</p>
    </div>
  )

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'60px 40px' }}>
        <h1 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, marginBottom:8 }}>🏆 Ward Leaderboard</h1>
        <p style={{ color:'rgba(143,168,192,0.7)', fontSize:16, marginBottom:40 }}>
          Top wards making the biggest impact on river protection
        </p>

        {leaderboard.length === 0 ? (
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:20, padding:'60px 40px', textAlign:'center' }}>
            <p style={{ color:'rgba(143,168,192,0.7)' }}>No reports yet. Be the first ward to make an impact!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {leaderboard.map((entry, i) => (
              <div key={i} style={{
                background: i < 3 ? 'rgba(245,166,35,0.06)' : 'rgba(255,255,255,0.02)',
                border: i < 3 ? '1px solid rgba(245,166,35,0.2)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:20,
              }}>
                <span style={{ fontSize: i < 3 ? 28 : 18, fontWeight:800, color: i < 3 ? '#f5a623' : 'rgba(143,168,192,0.5)', minWidth:44, textAlign:'center' }}>
                  {i < 3 ? medals[i] : `#${i+1}`}
                </span>
                <div style={{ flex:1 }}>
                  <p style={{ color:'white', fontWeight:700, fontSize:16 }}>{entry.ward}, {entry.city}</p>
                  <p style={{ color:'rgba(143,168,192,0.6)', fontSize:13 }}>{entry.river} River</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:'#00e5c0', fontWeight:800, fontSize:20 }}>{entry.points}</p>
                  <p style={{ color:'rgba(143,168,192,0.5)', fontSize:11 }}>NadiPoints</p>
                </div>
                <div style={{ textAlign:'right', minWidth:80 }}>
                  <p style={{ color:'white', fontWeight:700, fontSize:16 }}>{entry.reports}</p>
                  <p style={{ color:'rgba(143,168,192,0.5)', fontSize:11 }}>reports</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
