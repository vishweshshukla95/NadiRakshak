import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const RIVERS = [
  { key:'Ganga-Varanasi', label:'Ganga — Varanasi', color:'#ff4444' },
  { key:'Yamuna-Delhi', label:'Yamuna — Delhi', color:'#f5a623' },
  { key:'Ganga-Haridwar', label:'Ganga — Haridwar', color:'#00e5c0' },
  { key:'Gomti-Lucknow', label:'Gomti — Lucknow', color:'#1a8fe3' },
  { key:'Sabarmati-Ahmedabad', label:'Sabarmati — Ahmedabad', color:'#a855f7' },
]

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background:'#0d1f3c', border:'1px solid rgba(0,229,192,0.2)', borderRadius:10, padding:'12px 16px' }}>
      <p style={{ color:'#00e5c0', fontWeight:700, marginBottom:8, fontSize:13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, fontSize:12, marginBottom:4 }}>
          {p.name}: <span style={{ fontWeight:700 }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Trends() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('BOD')
  const [selectedRivers, setSelectedRivers] = useState(['Ganga-Varanasi', 'Yamuna-Delhi', 'Ganga-Haridwar'])

  useEffect(() => {
    axios.get('/api/historical').then(r => {
      setData(r.data.data)
      setLoading(false)
    })
  }, [])

  function toggleRiver(key) {
    setSelectedRivers(prev =>
      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
    )
  }

  if (loading) return (
    <div style={{ background:'#040d1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
        <p style={{ color:'rgba(143,168,192,0.7)', fontSize:16 }}>Loading historical data...</p>
      </div>
    </div>
  )

  const chartData = data.map(d => {
    const point = { month: d.month }
    selectedRivers.forEach(r => {
      point[r] = d[`${r}_${metric}`]
    })
    return point
  })

  // Summary stats
  const latestData = data[data.length - 1] || {}
  const worstRiver = RIVERS.reduce((worst, r) => {
    const val = latestData[`${r.key}_BOD`] || 0
    return val > (latestData[`${worst.key}_BOD`] || 0) ? r : worst
  }, RIVERS[0])

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <style>{`@keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }`}</style>

      {/* Header */}
      <div style={{ position:'relative', padding:'60px 40px 60px', overflow:'hidden', borderBottom:'1px solid rgba(0,229,192,0.1)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(26,143,227,0.08) 0%, transparent 60%)' }} />
        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <PulseDot />
            <span style={{ color:'#00e5c0', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>12-Month Historical Analysis</span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-1px', marginBottom:8 }}>
            River Health Trends
          </h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:16 }}>
            BOD & DO trends across India's major rivers — monsoon spikes highlighted
          </p>

          {/* Summary cards */}
          <div style={{ display:'flex', gap:20, marginTop:32, flexWrap:'wrap' }}>
            {[
              { label:'Most Polluted', value:worstRiver.label, color:'#ff4444' },
              { label:'Monsoon Impact', value:'June — September', color:'#f5a623' },
              { label:'Safe BOD Limit', value:'< 3 mg/L', color:'#00e5c0' },
              { label:'Rivers Tracked', value:'5 rivers', color:'#1a8fe3' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}22`, borderRadius:12, padding:'12px 20px' }}>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{s.label}</p>
                <p style={{ color:s.color, fontSize:16, fontWeight:700 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px' }}>

        {/* Controls */}
        <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:8 }}>
            {['BOD', 'DO'].map(m => (
              <button key={m} onClick={() => setMetric(m)} style={{
                background: metric===m ? 'rgba(0,229,192,0.1)' : 'transparent',
                border: metric===m ? '1px solid rgba(0,229,192,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: metric===m ? '#00e5c0' : 'rgba(143,168,192,0.6)',
                padding:'6px 20px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              }}>{m === 'BOD' ? '🧪 BOD (Pollution)' : '💧 DO (Oxygen)'}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {RIVERS.map(r => (
              <button key={r.key} onClick={() => toggleRiver(r.key)} style={{
                background: selectedRivers.includes(r.key) ? `${r.color}18` : 'transparent',
                border: selectedRivers.includes(r.key) ? `1px solid ${r.color}44` : '1px solid rgba(255,255,255,0.08)',
                color: selectedRivers.includes(r.key) ? r.color : 'rgba(143,168,192,0.5)',
                padding:'4px 14px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              }}>{r.label.split(' — ')[1]}</button>
            ))}
          </div>
        </div>

        {/* Main Chart */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:20, padding:'28px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:18 }}>
              {metric === 'BOD' ? '🧪 BOD Levels (mg/L) — Lower is better' : '💧 Dissolved Oxygen (mg/L) — Higher is better'}
            </h3>
            <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>
              {metric === 'BOD' ? 'Safe limit: < 3 mg/L' : 'Safe limit: > 5 mg/L'}
            </span>
          </div>

          {/* Monsoon annotation */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <span style={{ width:20, height:3, background:'rgba(245,166,35,0.4)', display:'inline-block', borderRadius:2 }} />
            <span style={{ color:'rgba(143,168,192,0.5)', fontSize:12 }}>Shaded area = Monsoon season (Jun-Sep) — expect higher BOD, lower DO</span>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={chartData} margin={{ top:10, right:10, left:0, bottom:0 }}>
              <defs>
                {RIVERS.filter(r => selectedRivers.includes(r.key)).map(r => (
                  <linearGradient key={r.key} id={`grad-${r.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={r.color} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={r.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
                {/* Monsoon highlight */}
                <linearGradient id="monsoon" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent"/>
                  <stop offset="41.6%" stopColor="transparent"/>
                  <stop offset="41.6%" stopColor="rgba(245,166,35,0.06)"/>
                  <stop offset="75%" stopColor="rgba(245,166,35,0.06)"/>
                  <stop offset="75%" stopColor="transparent"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill:'rgba(143,168,192,0.6)', fontSize:12 }} axisLine={{ stroke:'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill:'rgba(143,168,192,0.6)', fontSize:12 }} axisLine={{ stroke:'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => {
                const r = RIVERS.find(r => r.key === value)
                return <span style={{ color:'rgba(143,168,192,0.8)', fontSize:12 }}>{r?.label || value}</span>
              }} />
              {RIVERS.filter(r => selectedRivers.includes(r.key)).map(r => (
                <Area
                  key={r.key}
                  type="monotone"
                  dataKey={r.key}
                  stroke={r.color}
                  strokeWidth={2}
                  fill={`url(#grad-${r.key})`}
                  dot={{ fill:r.color, strokeWidth:0, r:3 }}
                  activeDot={{ r:5, fill:r.color }}
                  name={r.key}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Per-river summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
          {RIVERS.map(r => {
            const latestBOD = data[data.length-1]?.[`${r.key}_BOD`] || 0
            const latestDO = data[data.length-1]?.[`${r.key}_DO`] || 0
            const avgBOD = data.length ? (data.reduce((a,d) => a + (d[`${r.key}_BOD`]||0), 0) / data.length).toFixed(1) : 0
            const color = latestBOD > 30 ? '#ff4444' : latestBOD > 10 ? '#f5a623' : '#00e5c0'
            return (
              <div key={r.key} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${r.color}22`, borderRadius:16, padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:r.color, display:'inline-block' }} />
                  <span style={{ color:'white', fontWeight:600, fontSize:13 }}>{r.label}</span>
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  <div>
                    <p style={{ color:'rgba(143,168,192,0.5)', fontSize:11, marginBottom:2 }}>Current BOD</p>
                    <p style={{ color:color, fontSize:20, fontWeight:800 }}>{latestBOD}</p>
                  </div>
                  <div>
                    <p style={{ color:'rgba(143,168,192,0.5)', fontSize:11, marginBottom:2 }}>Avg BOD</p>
                    <p style={{ color:'rgba(143,168,192,0.8)', fontSize:20, fontWeight:800 }}>{avgBOD}</p>
                  </div>
                  <div>
                    <p style={{ color:'rgba(143,168,192,0.5)', fontSize:11, marginBottom:2 }}>DO</p>
                    <p style={{ color: latestDO < 3 ? '#ff4444' : latestDO < 5 ? '#f5a623' : '#00e5c0', fontSize:20, fontWeight:800 }}>{latestDO}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}