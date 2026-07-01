import { useEffect, useState } from 'react'
import axios from 'axios'

function getBadge(reportCount) {
  if (reportCount >= 20) return { name: 'Gold Guardian', icon: '🥇', color: '#f5d020' }
  if (reportCount >= 10) return { name: 'Silver Guardian', icon: '🥈', color: '#c0c0c0' }
  if (reportCount >= 1) return { name: 'Bronze Guardian', icon: '🥉', color: '#cd7f32' }
  return { name: 'New Guardian', icon: '🌱', color: '#00e5c0' }
}

export default function MyImpact() {
  const [phone, setPhone] = useState('')
  const [savedPhone, setSavedPhone] = useState(localStorage.getItem('nadirakshak_phone') || '')
  const [myReports, setMyReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  function fetchByPhone(p) {
    if (!p || p.trim().length < 10) return
    setLoading(true)
    axios.get(`/api/reports/by-phone/${p.trim()}`).then(res => {
      setMyReports(res.data.reports || [])
      setLoading(false)
      setSearched(true)
    }).catch(() => {
      setLoading(false)
      setSearched(true)
    })
  }

  useEffect(() => {
    if (savedPhone) fetchByPhone(savedPhone)
  }, [])

  function handleLookup(e) {
    e.preventDefault()
    localStorage.setItem('nadirakshak_phone', phone.trim())
    setSavedPhone(phone.trim())
    fetchByPhone(phone)
  }

  function handleSwitchNumber() {
    localStorage.removeItem('nadirakshak_phone')
    setSavedPhone('')
    setMyReports([])
    setSearched(false)
    setPhone('')
  }

  const totalPoints = myReports.reduce((sum, r) => sum + (r.points || 0), 0)
  const badge = getBadge(myReports.length)
  const nextTier = myReports.length >= 20 ? null : myReports.length >= 10 ? { target: 20, name: 'Gold Guardian' } : myReports.length >= 1 ? { target: 10, name: 'Silver Guardian' } : { target: 1, name: 'Bronze Guardian' }

  // No phone saved yet — show lookup form
  if (!savedPhone) {
    return (
      <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <form onSubmit={handleLookup} style={{
          background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.15)',
          borderRadius:24, padding:'48px 40px', width:'100%', maxWidth:420,
        }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <span style={{ fontSize:40, display:'block', marginBottom:12 }}>📍</span>
            <h1 style={{ fontSize:22, fontWeight:800, color:'white', marginBottom:8 }}>View Your Impact</h1>
            <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14 }}>Enter the phone number you used when reporting</p>
          </div>
          <input
            type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            style={{
              width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,229,192,0.2)',
              borderRadius:10, padding:'14px 16px', color:'white', fontSize:14, marginBottom:20, outline:'none', boxSizing:'border-box',
            }}
          />
          <button type="submit" style={{
            width:'100%', background:'#00e5c0', color:'#040d1a', padding:'14px', borderRadius:10,
            fontWeight:700, fontSize:15, border:'none', cursor:'pointer',
          }}>
            View My Impact →
          </button>
          <p style={{ textAlign:'center', color:'rgba(143,168,192,0.5)', fontSize:12, marginTop:20 }}>
            Haven't reported yet? <a href="/NadiRakshak/citizen/report" style={{ color:'#00e5c0' }}>Submit your first report</a>
          </p>
        </form>
      </div>
    )
  }

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'60px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, marginBottom:8 }}>My Impact</h1>
            <p style={{ color:'rgba(143,168,192,0.7)', fontSize:16 }}>Reports linked to {savedPhone}</p>
          </div>
          <button onClick={handleSwitchNumber} style={{
            background:'rgba(255,255,255,0.04)', color:'rgba(143,168,192,0.8)', border:'1px solid rgba(255,255,255,0.1)',
            padding:'8px 16px', borderRadius:10, fontSize:13, cursor:'pointer',
          }}>
            Switch number
          </button>
        </div>

        {loading ? (
          <p style={{ color:'rgba(143,168,192,0.7)', marginTop:40 }}>Loading your impact...</p>
        ) : myReports.length === 0 ? (
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:20, padding:'60px 40px', textAlign:'center', marginTop:32 }}>
            <span style={{ fontSize:48, display:'block', marginBottom:16 }}>🌊</span>
            <h3 style={{ color:'white', fontSize:20, marginBottom:8 }}>No reports found for this number</h3>
            <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14 }}>Submit your first report to start building your impact.</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, marginBottom:32, marginTop:32 }}>
              <div style={{ background:'rgba(0,229,192,0.06)', border:'1px solid rgba(0,229,192,0.2)', borderRadius:16, padding:'24px 20px', textAlign:'center' }}>
                <span style={{ fontSize:32, display:'block', marginBottom:8 }}>{badge.icon}</span>
                <p style={{ color:badge.color, fontWeight:800, fontSize:18, marginBottom:4 }}>{badge.name}</p>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12 }}>Current tier</p>
              </div>
              <div style={{ background:'rgba(0,229,192,0.06)', border:'1px solid rgba(0,229,192,0.2)', borderRadius:16, padding:'24px 20px', textAlign:'center' }}>
                <p style={{ color:'#00e5c0', fontSize:36, fontWeight:800 }}>{myReports.length}</p>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12 }}>Reports submitted</p>
              </div>
              <div style={{ background:'rgba(245,166,35,0.06)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:16, padding:'24px 20px', textAlign:'center' }}>
                <p style={{ color:'#f5a623', fontSize:36, fontWeight:800 }}>{totalPoints}</p>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12 }}>NadiPoints earned</p>
              </div>
            </div>

            {nextTier && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:16, padding:'20px 24px', marginBottom:32 }}>
                <p style={{ color:'rgba(143,168,192,0.8)', fontSize:13, marginBottom:10 }}>
                  {nextTier.target - myReports.length} more report{nextTier.target - myReports.length !== 1 ? 's' : ''} to reach <span style={{ color:'#00e5c0', fontWeight:700 }}>{nextTier.name}</span>
                </p>
                <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${Math.min((myReports.length / nextTier.target) * 100, 100)}%`, height:'100%', background:'linear-gradient(90deg,#00e5c0,#1a8fe3)', borderRadius:4 }} />
                </div>
              </div>
            )}

            <h3 style={{ color:'white', fontWeight:700, fontSize:18, marginBottom:16 }}>Your Reports</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {myReports.map((r, i) => {
                const color = r.severity==='High'?'#ff4444':r.severity==='Medium'?'#f5a623':'#00e5c0'
                return (
                  <div key={i} style={{ background:'rgba(255,255,255,0.02)', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'flex-start', gap:16 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0, marginTop:5 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ color:'white', fontWeight:600, fontSize:14 }}>{r.ward} — {r.city}</span>
                        <span style={{ background:`${color}18`, color, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>{r.severity}</span>
                      </div>
                      <p style={{ color:'rgba(143,168,192,0.7)', fontSize:13, marginBottom:4 }}>{r.description}</p>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>🏆 +{r.points} NadiPoints</span>
                        <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>
                          {r.verified ? '✅ Verified' : '⏳ Pending'}
                        </span>
                        <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>🕐 {new Date(r.timestamp).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
