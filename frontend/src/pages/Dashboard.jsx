import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{ background:bg, border:`1px solid ${color}33`, borderRadius:16, padding:'24px 20px' }}>
      <span style={{ fontSize:28, display:'block', marginBottom:12 }}>{icon}</span>
      <p style={{ color:'rgba(143,168,192,0.7)', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{label}</p>
      <p style={{ color:color, fontSize:32, fontWeight:800, marginBottom:4 }}>{value}</p>
      <p style={{ color:'rgba(143,168,192,0.6)', fontSize:13 }}>{sub}</p>
    </div>
  )
}

export default function Dashboard() {
  const [riverData, setRiverData] = useState([])
  const [hotspots, setHotspots] = useState([])
  const [alerts, setAlerts] = useState([])
  const [healthIndex, setHealthIndex] = useState(0)
  const [monsoon, setMonsoon] = useState([])
  const [airQuality, setAirQuality] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [countdown, setCountdown] = useState(300)

  const fetchData = useCallback(() => {
    Promise.all([
      axios.get('/api/river-health'),
      axios.get('/api/hotspots'),
      axios.get('/api/alerts'),
      axios.get('/api/monsoon'),
      axios.get('/api/air-quality'),
    ]).then(([r1, r2, r3, r4, r5]) => {
      setRiverData(r1.data.rivers)
      setHealthIndex(r1.data.healthIndex)
      setHotspots(r2.data.hotspots)
      setAlerts(r3.data.alerts)
      setMonsoon(r4.data.predictions)
      setAirQuality(r5.data.cities || [])
      setLoading(false)
      setLastUpdated(new Date())
      setCountdown(300)
    }).catch(err => {
      console.error('Dashboard load error:', err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    fetchData()
    const refreshInterval = setInterval(fetchData, 300000)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 300)
    }, 1000)
    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [fetchData])

  const statusColor = {
    Critical:'#ff4444', Severe:'#ff4444',
    Poor:'#f5a623', Moderate:'#f5a623',
    Fair:'#00e5c0', Good:'#00e5c0',
  }

  if (loading) return (
    <div style={{ background:'#040d1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🌊</div>
        <p style={{ color:'rgba(143,168,192,0.7)', fontSize:16 }}>Loading river data...</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      {/* style injected via App.jsx */}
      <div style={{ position:'relative', padding:'60px 40px 80px', borderBottom:'1px solid rgba(0,229,192,0.1)', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(26,143,227,0.08) 0%, transparent 60%)' }} />
        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <PulseDot />
            <span style={{ color:'#00e5c0', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>Live</span>
            <span style={{ color:'rgba(143,168,192,0.5)', fontSize:13 }}>
              — {lastUpdated ? `Updated at ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Loading...'}
              <span style={{ marginLeft:12, color:'rgba(0,229,192,0.5)', fontSize:12 }}>
                Next refresh in {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}
              </span>
            </span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-1px', marginBottom:8 }}>River Guardian Dashboard</h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:16 }}>Real-time predictive monitoring for India's major rivers</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, marginBottom:40 }}>
          <StatCard icon="🌊" label="River Health Index" value={`${healthIndex}/100`}
            sub={`${riverData.filter(r=>r.status==='Critical'||r.status==='Severe').length} rivers critical`}
            color="#ff4444" bg="rgba(255,68,68,0.08)" />
          <StatCard icon="🛰️" label="Plastic Hotspots" value={hotspots.length}
            sub={`${hotspots.filter(h=>h.risk>80).length} high risk zones`}
            color="#f5a623" bg="rgba(245,166,35,0.08)" />
          <StatCard icon="🚨" label="Active Alerts" value={alerts.length}
            sub={`${alerts.filter(a=>a.priority==='Critical').length} critical warnings`}
            color="#00e5c0" bg="rgba(0,229,192,0.08)" />
          <StatCard icon="🌧️" label="Monsoon Risk" value={`${monsoon.filter(m=>m.risk_level==='Critical').length} Critical`}
            sub={`Top: ${monsoon[0]?.city || '...'} at ${monsoon[0]?.risk_percent || 0}%`}
            color="#f5a623" bg="rgba(245,166,35,0.08)" />
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:20, padding:'28px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18 }}>🌊 River Health Monitor</h3>
            <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>Source: CPCB Water Quality Data</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {riverData.map((r,i) => {
              const color = statusColor[r.status] || '#00e5c0'
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.02)', borderRadius:12, padding:'16px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
                    <span style={{ color:'white', fontWeight:600, fontSize:15, minWidth:220 }}>{r.river} — {r.location}</span>
                    <span style={{ color:'rgba(143,168,192,0.5)', fontSize:13 }}>{r.state}</span>
                    <span style={{ marginLeft:'auto', background:`${color}18`, color, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100 }}>{r.status}</span>
                  </div>
                  <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginBottom:10 }}>
                    {[
                      { label:'BOD', value:`${r.bod} mg/L`, bad:r.bod>3 },
                      { label:'DO', value:`${r.do} mg/L`, bad:r.do<5 },
                      { label:'pH', value:r.ph, bad:r.ph<6.5||r.ph>8.5 },
                      { label:'Coliform', value:`${r.coliform.toLocaleString()} MPN/100ml`, bad:r.coliform>500 },
                    ].map((m,j) => (
                      <div key={j}>
                        <span style={{ color:'rgba(143,168,192,0.5)', fontSize:11 }}>{m.label}: </span>
                        <span style={{ color:m.bad?color:'#00e5c0', fontSize:13, fontWeight:600 }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${Math.min(r.bod*1.5,100)}%`, height:'100%', background:color, borderRadius:3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:20, padding:'28px' }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18, marginBottom:8 }}>🛰️ Top Risk Hotspots</h3>
            <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14, marginBottom:20 }}>Satellite-detected accumulation zones</p>
            {hotspots.slice(0,4).map((h,i) => {
              const color = h.risk>80?'#ff4444':h.risk>60?'#f5a623':'#00e5c0'
              return (
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ color:'rgba(143,168,192,0.8)', fontSize:13 }}>{h.ward} — {h.city}</span>
                    <span style={{ color, fontSize:13, fontWeight:700 }}>{h.risk}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${h.risk}%`, height:'100%', background:color, borderRadius:3 }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:20, padding:'28px' }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18, marginBottom:8 }}>🚨 Recent Alerts</h3>
            <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14, marginBottom:20 }}>Latest ward-level warnings</p>
            {alerts.slice(0,4).map((a,i) => {
              const color = a.priority==='Critical'?'#ff4444':a.priority==='High'?'#f5a623':'#1a8fe3'
              return (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, marginTop:5 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ color:'rgba(200,220,240,0.9)', fontSize:13, fontWeight:500, marginBottom:2 }}>{a.ward}, {a.city}</p>
                    <p style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>{a.hindi}</p>
                  </div>
                  <span style={{ background:`${color}18`, color, fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:100, flexShrink:0 }}>{a.priority}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:20, padding:'28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18 }}>🌧️ Monsoon Plastic Flow Predictor</h3>
            <span style={{ background:'rgba(245,166,35,0.1)', color:'#f5a623', fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:100 }}>RandomForest ML — 48hr forecast</span>
          </div>
          <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14, marginBottom:24 }}>Overflow probability by ward — trained on rainfall, terrain, and plastic accumulation data</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {monsoon.map((m,i) => {
              const color = m.risk_level==='Critical'?'#ff4444':m.risk_level==='High'?'#f5a623':'#00e5c0'
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${color}22`, borderRadius:14, padding:'18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                      <p style={{ color:'white', fontWeight:600, fontSize:14 }}>{m.ward} — {m.city}</p>
                      <p style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>{m.river} River</p>
                    </div>
                    <span style={{ background:`${color}18`, color, fontSize:13, fontWeight:800, padding:'4px 12px', borderRadius:100 }}>{m.risk_percent}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden', marginBottom:10 }}>
                    <div style={{ width:`${m.risk_percent}%`, height:'100%', background:color, borderRadius:3 }} />
                  </div>
                  <p style={{ color:'rgba(143,168,192,0.7)', fontSize:12, lineHeight:1.5, marginBottom:10 }}>{m.hindi_alert}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {Object.entries(m.features).map(([k,v]) => (
                      <span key={k} style={{ background:'rgba(255,255,255,0.04)', color:'rgba(143,168,192,0.5)', fontSize:11, padding:'2px 8px', borderRadius:6 }}>
                        {k.replace(/_/g,' ')}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(26,143,227,0.15)', borderRadius:20, padding:'28px', marginTop:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18 }}>🌫️ Air Quality Index — River Cities</h3>
            <span style={{ background:'rgba(26,143,227,0.1)', color:'#1a8fe3', fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:100 }}>OpenAQ — Live</span>
          </div>
          <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14, marginBottom:24 }}>Higher air pollution = higher plastic runoff risk into rivers</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            {airQuality.map((a,i) => {
              const color = a.aqiStatus==='Hazardous'?'#ff0000':a.aqiStatus==='Very Poor'?'#ff4444':a.aqiStatus==='Poor'?'#f5a623':a.aqiStatus==='Moderate'?'#f5e623':'#00e5c0'
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${color}22`, borderRadius:14, padding:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div>
                      <p style={{ color:'white', fontWeight:600, fontSize:14 }}>{a.city}</p>
                      <p style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>{a.river} River</p>
                    </div>
                    <span style={{ background:`${color}18`, color, fontSize:13, fontWeight:800, padding:'4px 10px', borderRadius:100 }}>
                      {a.aqi}
                    </span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden', marginBottom:10 }}>
                    <div style={{ width:`${Math.min(a.aqi/5,100)}%`, height:'100%', background:color, borderRadius:3 }} />
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                    <span style={{ color:'rgba(143,168,192,0.6)', fontSize:11 }}>PM2.5: <span style={{ color:'white' }}>{a.pm25}</span></span>
                    <span style={{ color:'rgba(143,168,192,0.6)', fontSize:11 }}>PM10: <span style={{ color:'white' }}>{a.pm10}</span></span>
                    <span style={{ color:'rgba(143,168,192,0.6)', fontSize:11 }}>NO2: <span style={{ color:'white' }}>{a.no2}</span></span>
                  </div>
                  <span style={{ background:`${color}18`, color, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>
                    {a.aqiStatus}
                  </span>
                  {a.plasticRiskBoost > 5 && (
                    <p style={{ color:'#f5a623', fontSize:11, marginTop:6 }}>⚠️ +{a.plasticRiskBoost}% plastic risk</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}