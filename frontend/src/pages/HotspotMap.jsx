import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import axios from 'axios'

// ── RIVER PATHS ──────────────────────────────────────────────────
const riverPaths = {
  ganga: [
    [30.9, 78.9], [29.9, 78.2], [29.4, 79.2], [28.0, 79.9],
    [27.9, 80.3], [27.5, 81.0], [26.8, 81.9], [26.4, 80.3],
    [25.4, 81.8], [25.3, 83.0], [25.6, 85.1], [25.2, 86.0],
    [24.8, 87.9], [23.4, 88.4],
  ],
  yamuna: [
    [30.7, 77.8], [29.9, 77.7], [28.6, 77.2], [27.5, 77.7],
    [27.2, 78.0], [26.4, 80.3],
  ],
  gomti: [
    [28.5, 80.5], [27.8, 80.8], [26.8, 80.9], [26.1, 82.4],
  ],
}

// ── HOTSPOT DATA ─────────────────────────────────────────────────
const hotspots = [
  { id:'HS-001', name:'Varanasi Ghat Drain Cluster', lat:25.3176, lon:83.0062, risk:94, type:'Drain Overflow', ward:'Ward 14', city:'Varanasi', river:'Ganga' },
  { id:'HS-002', name:'Kanpur Industrial Nallah', lat:26.4499, lon:80.3319, risk:87, type:'Industrial Discharge', ward:'Ward 7', city:'Kanpur', river:'Ganga' },
  { id:'HS-003', name:'Allahabad Sangam Bank', lat:25.4358, lon:81.8463, risk:76, type:'Bank Accumulation', ward:'Ward 22', city:'Allahabad', river:'Ganga' },
  { id:'HS-004', name:'Haridwar Upper Ganga', lat:29.9457, lon:78.1642, risk:52, type:'Tourist Waste', ward:'Ward 3', city:'Haridwar', river:'Ganga' },
  { id:'HS-005', name:'Delhi Yamuna Pushta', lat:28.6139, lon:77.2090, risk:91, type:'Urban Runoff', ward:'Ward 9', city:'Delhi', river:'Yamuna' },
  { id:'HS-006', name:'Mathura Refinery Zone', lat:27.4924, lon:77.6737, risk:43, type:'Chemical Waste', ward:'Ward 2', city:'Mathura', river:'Yamuna' },
]

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

function RiverWave({ opacity = 0.08 }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
      style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'120px', opacity }}>
      <defs>
        <linearGradient id="waveGradM" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a8fe3" />
          <stop offset="100%" stopColor="#00e5c0" />
        </linearGradient>
      </defs>
      <path fill="url(#waveGradM)">
        <animate attributeName="d" dur="6s" repeatCount="indefinite"
          values="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z;M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z;M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"/>
      </path>
    </svg>
  )
}

export default function HotspotMap() {
  const [selected, setSelected] = useState(null)
  const [airData, setAirData] = useState({})
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    axios.get('/api/air-quality').then(r => {
      const map = {}
      r.data.cities.forEach(c => { map[c.city] = c })
      setAirData(map)
    })
  }, [])

  const getColor = (risk) => risk > 80 ? '#ff4444' : risk > 60 ? '#f5a623' : '#00e5c0'
  const getRadius = (risk) => risk > 80 ? 18 : risk > 60 ? 14 : 10

  const filtered = filter === 'All' ? hotspots : hotspots.filter(h => {
    if (filter === 'Critical') return h.risk > 80
    if (filter === 'High') return h.risk > 60 && h.risk <= 80
    if (filter === 'Moderate') return h.risk <= 60
    return true
  })

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <style>{`
        @keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }
        .leaflet-container { background:#0a1628 !important; } .leaflet-map-pane, .leaflet-tile-pane { z-index:1; } #map-container { height:500px; width:100%; }
        .leaflet-popup-content-wrapper { background:#0d1f3c !important; border:1px solid rgba(0,229,192,0.2) !important; border-radius:12px !important; color:white !important; }
        .leaflet-popup-tip { background:#0d1f3c !important; }
        .leaflet-popup-close-button { color:#00e5c0 !important; }
        .leaflet-control-zoom a { background:#0d1f3c !important; color:#00e5c0 !important; border-color:rgba(0,229,192,0.2) !important; }
        .leaflet-control-attribution { background:rgba(4,13,26,0.8) !important; color:rgba(143,168,192,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{ position:'relative', padding:'60px 40px 80px', overflow:'hidden', borderBottom:'1px solid rgba(26,143,227,0.1)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(26,143,227,0.08) 0%, transparent 60%)' }} />
        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <PulseDot color="#1a8fe3" />
            <span style={{ color:'#1a8fe3', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Sentinel-2 Satellite Feed — Live
            </span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-1px', marginBottom:8 }}>
            Plastic Hotspot Map
          </h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:16 }}>
            AI-detected accumulation zones on Ganga, Yamuna & Gomti river basins
          </p>

          {/* Stats */}
          <div style={{ display:'flex', gap:20, marginTop:24, flexWrap:'wrap' }}>
            {[
              { label:'Total Hotspots', value:hotspots.length, color:'#1a8fe3' },
              { label:'Critical (>80%)', value:hotspots.filter(h=>h.risk>80).length, color:'#ff4444' },
              { label:'High (60-80%)', value:hotspots.filter(h=>h.risk>60&&h.risk<=80).length, color:'#f5a623' },
              { label:'Moderate (<60%)', value:hotspots.filter(h=>h.risk<=60).length, color:'#00e5c0' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}22`, borderRadius:12, padding:'10px 16px' }}>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.label}</p>
                <p style={{ color:s.color, fontSize:24, fontWeight:800 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
        <RiverWave />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px' }}>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {['All','Critical','High','Moderate'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter===f ? 'rgba(0,229,192,0.1)' : 'transparent',
              border: filter===f ? '1px solid rgba(0,229,192,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: filter===f ? '#00e5c0' : 'rgba(143,168,192,0.6)',
              padding:'6px 18px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
            }}>{f}</button>
          ))}
        </div>

        {/* MAP */}
        <div id="map-container" style={{ borderRadius:20, overflow:'hidden', border:'1px solid rgba(26,143,227,0.2)', marginBottom:32, height:'500px', width:'100%', position:'relative' }}>
          <MapContainer
            center={[27.5, 80.0]}
            zoom={5}
            style={{ height:'500px', width:'100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* River paths */}
            <Polyline
              positions={riverPaths.ganga}
              pathOptions={{ color:'#1a8fe3', weight:3, opacity:0.7, dashArray:'8 4' }}
            />
            <Polyline
              positions={riverPaths.yamuna}
              pathOptions={{ color:'#00e5c0', weight:3, opacity:0.7, dashArray:'8 4' }}
            />
            <Polyline
              positions={riverPaths.gomti}
              pathOptions={{ color:'#a855f7', weight:2, opacity:0.6, dashArray:'6 4' }}
            />

            {/* Hotspot markers */}
            {filtered.map(h => (
              <CircleMarker
                key={h.id}
                center={[h.lat, h.lon]}
                radius={getRadius(h.risk)}
                pathOptions={{
                  color: getColor(h.risk),
                  fillColor: getColor(h.risk),
                  fillOpacity: 0.7,
                  weight: 2,
                }}
                eventHandlers={{ click: () => setSelected(h) }}
              >
                <Popup>
                  <div style={{ minWidth:200 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <span style={{ color:'rgba(143,168,192,0.6)', fontSize:11 }}>{h.id}</span>
                      <span style={{ background:`${getColor(h.risk)}22`, color:getColor(h.risk), fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:100 }}>
                        {h.risk}% risk
                      </span>
                    </div>
                    <p style={{ color:'white', fontWeight:700, fontSize:14, marginBottom:4 }}>{h.name}</p>
                    <p style={{ color:'rgba(143,168,192,0.7)', fontSize:12, marginBottom:4 }}>{h.ward}, {h.city}</p>
                    <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12, marginBottom:8 }}>{h.type} — {h.river} River</p>
                    {airData[h.city] && (
                      <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'8px', marginTop:8 }}>
                        <p style={{ color:'rgba(143,168,192,0.6)', fontSize:11, marginBottom:4 }}>Air Quality</p>
                        <p style={{ color:'white', fontSize:13, fontWeight:600 }}>AQI: {airData[h.city].aqi} — {airData[h.city].aqiStatus}</p>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
          <span style={{ color:'rgba(143,168,192,0.6)', fontSize:13 }}>Legend:</span>
          {[['#ff4444','Critical (>80%)'],['#f5a623','High (60-80%)'],['#00e5c0','Moderate (<60%)']].map(([c,l]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:12, height:12, borderRadius:'50%', background:c, display:'inline-block' }} />
              <span style={{ color:'rgba(143,168,192,0.7)', fontSize:13 }}>{l}</span>
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:20, height:3, background:'#1a8fe3', display:'inline-block', borderRadius:2 }} />
            <span style={{ color:'rgba(143,168,192,0.7)', fontSize:13 }}>Ganga</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:20, height:3, background:'#00e5c0', display:'inline-block', borderRadius:2 }} />
            <span style={{ color:'rgba(143,168,192,0.7)', fontSize:13 }}>Yamuna</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:20, height:3, background:'#a855f7', display:'inline-block', borderRadius:2 }} />
            <span style={{ color:'rgba(143,168,192,0.7)', fontSize:13 }}>Gomti</span>
          </div>
        </div>

        {/* Hotspot cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:16 }}>
          {filtered.map((h) => {
            const color = getColor(h.risk)
            const air = airData[h.city]
            return (
              <div key={h.id} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${color}22`, borderRadius:16, padding:'20px', cursor:'pointer', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=color+'55'}
                onMouseLeave={e => e.currentTarget.style.borderColor=color+'22'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <span style={{ color:'rgba(143,168,192,0.5)', fontSize:11, fontFamily:'monospace' }}>{h.id}</span>
                  <span style={{ background:`${color}18`, color, fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:100 }}>{h.risk}% risk</span>
                </div>
                <h4 style={{ color:'white', fontWeight:700, fontSize:15, marginBottom:6 }}>{h.name}</h4>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12, marginBottom:4 }}>📍 {h.lat}°N, {h.lon}°E</p>
                <p style={{ color:'rgba(143,168,192,0.6)', fontSize:12, marginBottom:12 }}>{h.type} — {h.river} River</p>
                <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, marginBottom:12 }}>
                  <div style={{ width:`${h.risk}%`, height:'100%', background:color, borderRadius:2 }} />
                </div>
                {air && (
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    <span style={{ color:'rgba(143,168,192,0.6)', fontSize:12 }}>AQI: <span style={{ color:'white', fontWeight:600 }}>{air.aqi}</span></span>
                    <span style={{ color:'rgba(143,168,192,0.6)', fontSize:12 }}>PM2.5: <span style={{ color:'white', fontWeight:600 }}>{air.pm25}</span></span>
                    <span style={{ background:`${color}18`, color, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>{air.aqiStatus}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}