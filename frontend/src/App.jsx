import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import MunicipalityLogin from './pages/MunicipalityLogin'
import CitizenLayout from './components/CitizenLayout'
import MunicipalityLayout from './components/MunicipalityLayout'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import HotspotMap from './pages/HotspotMap'
import Trends from './pages/Trends'
import Chatbot from './pages/Chatbot'
import Report from './pages/Report'
import MyImpact from './pages/MyImpact'
import Leaderboard from './pages/Leaderboard'

function About() {
  const steps = [
    { icon:'🛰️', title:'Satellite scans riverbanks weekly', desc:'Sentinel-2 imagery processed by computer vision AI to detect plastic accumulation on banks, drains, and nallahs.' },
    { icon:'🤖', title:'AI detects plastic hotspots', desc:'Trained model classifies plastic vs non-plastic terrain, generating a weekly risk map for municipalities.' },
    { icon:'🌧️', title:'Monsoon predictor fires 48h warning', desc:'Weather + terrain + historical data predicts which drains will overflow plastic into the river before rain hits.' },
    { icon:'📱', title:'Municipality gets Hindi alert', desc:"LLM generates plain-language warnings — \"Ward 14 drain has high accumulation. Clean before Tuesday's rain.\"" },
    { icon:'🧹', title:'Cleanup crew dispatched', desc:'Ward workers reach the drain before the monsoon. Plastic stopped before it enters the river.' },
    { icon:'📊', title:'River health score improves', desc:'Dashboard reflects cleaner data. Citizens see results. Motivation loops back into civic action.' },
  ]
  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64 }}>
      <div style={{ position:'relative', padding:'80px 40px', textAlign:'center', overflow:'hidden' }}>
        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ fontSize:'clamp(32px,5vw,64px)', fontWeight:800, letterSpacing:'-2px', marginBottom:16 }}>
            How <span style={{ background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>NadiRakshak</span> works
          </h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:18, maxWidth:600, margin:'0 auto' }}>Six steps from satellite to cleaner river</p>
        </div>
      </div>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'60px 40px' }}>
        {steps.map((s,i) => (
          <div key={i} style={{ display:'flex', gap:32, marginBottom:56, position:'relative' }}>
            {i < steps.length-1 && (
              <div style={{ position:'absolute', left:28, top:64, width:2, height:'calc(100% + 16px)', background:'linear-gradient(to bottom,rgba(0,229,192,0.3),transparent)' }} />
            )}
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(0,229,192,0.08)', border:'1px solid rgba(0,229,192,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span style={{ color:'rgba(0,229,192,0.5)', fontSize:12, fontFamily:'monospace', fontWeight:700 }}>0{i+1}</span>
                <h3 style={{ color:'white', fontWeight:700, fontSize:20 }}>{s.title}</h3>
              </div>
              <p style={{ color:'rgba(143,168,192,0.8)', fontSize:16, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/NadiRakshak">
      <style>{`
        @keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#040d1a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#040d1a; }
        ::-webkit-scrollbar-thumb { background:rgba(0,229,192,0.3); border-radius:3px; }
      `}</style>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/municipality/login" element={<MunicipalityLogin />} />

        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="report" element={<Report />} />
          <Route path="trends" element={<Trends />} />
          <Route path="ask-ai" element={<Chatbot />} />
          <Route path="my-impact" element={<MyImpact />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="about" element={<About />} />
        </Route>

        <Route path="/municipality" element={<MunicipalityLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="hotspots" element={<HotspotMap />} />
          <Route path="trends" element={<Trends />} />
          <Route path="reports" element={<Report />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
