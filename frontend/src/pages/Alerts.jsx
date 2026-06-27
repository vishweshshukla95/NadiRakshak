import { useEffect, useState } from 'react'
import axios from 'axios'

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

function RiverWave({ opacity = 0.06 }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
      style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'120px', opacity }}>
      <defs>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4444" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path fill="url(#waveGrad2)">
        <animate attributeName="d" dur="6s" repeatCount="indefinite"
          values="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z;M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z;M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"/>
      </path>
    </svg>
  )
}

export default function Alerts() {
  const [alertData, setAlertData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dispatched, setDispatched] = useState({})
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    axios.get('/api/alerts').then(res => {
      setAlertData(res.data.alerts)
      setLoading(false)
    })
  }, [])

  const priorities = ['All', 'Critical', 'High', 'Medium']
  const colorMap = { Critical:'#ff4444', High:'#f5a623', Medium:'#1a8fe3', Resolved:'#00e5c0' }

  const filtered = filter === 'All' ? alertData : alertData.filter(a => a.priority === filter)

  function handleDispatch(id) {
    setDispatched(prev => ({ ...prev, [id]: true }))
  }

  if (loading) return (
    <div style={{ background:'#040d1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🚨</div>
        <p style={{ color:'rgba(143,168,192,0.7)', fontSize:16 }}>Loading alerts...</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <style>{`@keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }`}</style>

      {/* Header */}
      <div style={{ position:'relative', padding:'60px 40px 80px', overflow:'hidden', borderBottom:'1px solid rgba(255,68,68,0.1)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(255,68,68,0.06) 0%, transparent 60%)' }} />
        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <PulseDot color="#ff4444" />
            <span style={{ color:'#ff4444', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {alertData.filter(a => a.priority === 'Critical').length} Critical Alerts Active
            </span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-1px', marginBottom:8 }}>
            Municipality Alert Center
          </h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:16 }}>
            Ward-level plastic warnings in Hindi & English — AI generated, real-time
          </p>

          {/* Stats row */}
          <div style={{ display:'flex', gap:24, marginTop:32, flexWrap:'wrap' }}>
            {[
              { label:'Total Alerts', value:alertData.length, color:'#00e5c0' },
              { label:'Critical', value:alertData.filter(a=>a.priority==='Critical').length, color:'#ff4444' },
              { label:'High', value:alertData.filter(a=>a.priority==='High').length, color:'#f5a623' },
              { label:'Dispatched', value:Object.keys(dispatched).length, color:'#00e5c0' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}22`, borderRadius:12, padding:'12px 20px', minWidth:100 }}>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{s.label}</p>
                <p style={{ color:s.color, fontSize:28, fontWeight:800 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
        <RiverWave />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px' }}>
        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {priorities.map(p => (
            <button key={p} onClick={() => setFilter(p)} style={{
              background: filter===p ? 'rgba(0,229,192,0.1)' : 'transparent',
              border: filter===p ? '1px solid rgba(0,229,192,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: filter===p ? '#00e5c0' : 'rgba(143,168,192,0.6)',
              padding:'6px 18px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer',
              transition:'all 0.2s',
            }}>{p}</button>
          ))}
        </div>

        {/* Alert cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {filtered.map((a) => {
            const color = colorMap[a.priority] || '#00e5c0'
            const isDone = dispatched[a.id]
            return (
              <div key={a.id} style={{
                background: isDone ? 'rgba(0,229,192,0.03)' : 'rgba(255,255,255,0.02)',
                border:`1px solid ${isDone ? '#00e5c044' : color+'22'}`,
                borderRadius:16, padding:'24px', transition:'all 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor=isDone?'#00e5c066':color+'55'}
                onMouseLeave={e => e.currentTarget.style.borderColor=isDone?'#00e5c044':color+'22'}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                  <div style={{ width:4, minHeight:80, background:isDone?'#00e5c0':color, borderRadius:2, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    {/* Top row */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
                      <span style={{ color:'white', fontWeight:700, fontSize:16 }}>{a.ward}, {a.city}</span>
                      <span style={{ background:`${isDone?'#00e5c0':color}18`, color:isDone?'#00e5c0':color, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100 }}>
                        {isDone ? 'Dispatched ✓' : a.priority}
                      </span>
                      <span style={{ background:'rgba(255,255,255,0.05)', color:'rgba(143,168,192,0.6)', fontSize:11, padding:'3px 10px', borderRadius:100 }}>
                        {a.type}
                      </span>
                      <span style={{ background:'rgba(255,255,255,0.05)', color:'rgba(143,168,192,0.5)', fontSize:11, padding:'3px 10px', borderRadius:100 }}>
                        Risk: {a.riskScore}%
                      </span>
                    </div>

                    {/* English alert */}
                    <p style={{ color:'rgba(200,220,240,0.9)', fontSize:14, marginBottom:8, lineHeight:1.6 }}>
                      🇬🇧 {a.english}
                    </p>

                    {/* Hindi alert */}
                    <p style={{ color:'rgba(200,220,240,0.9)', fontSize:14, marginBottom:12, lineHeight:1.6 }}>
                      🇮🇳 {a.hindi}
                    </p>

                    {/* Action + time */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                      <span style={{ background:`${color}18`, color:color, fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:8 }}>
                        ⚡ {a.action}
                      </span>
                      <span style={{ color:'rgba(143,168,192,0.4)', fontSize:12 }}>
                        {new Date(a.timestamp).toLocaleTimeString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Dispatch button */}
                  <button
                    onClick={() => handleDispatch(a.id)}
                    disabled={isDone}
                    style={{
                      background: isDone ? 'rgba(0,229,192,0.1)' : 'transparent',
                      border:`1px solid ${isDone?'#00e5c044':color+'44'}`,
                      color: isDone ? '#00e5c0' : color,
                      padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600,
                      cursor: isDone ? 'default' : 'pointer', flexShrink:0,
                      transition:'all 0.2s',
                    }}>
                    {isDone ? 'Sent ✓' : 'Dispatch →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}