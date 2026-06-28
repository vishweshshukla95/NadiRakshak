import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import HotspotMap from './pages/HotspotMap'
import Trends from './pages/Trends'
import Chatbot from './pages/Chatbot'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

function RiverWave({ opacity = 0.18 }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
      style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'120px', opacity }}>
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5c0" />
          <stop offset="50%" stopColor="#1a8fe3" />
          <stop offset="100%" stopColor="#00e5c0" />
        </linearGradient>
      </defs>
      <path fill="url(#waveGrad)">
        <animate attributeName="d" dur="6s" repeatCount="indefinite"
          values="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z;M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z;M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"/>
      </path>
    </svg>
  )
}

function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4, alpha: Math.random() * 0.5 + 0.1,
    }))
    let raf
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,229,192,${p.alpha})`; ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

function AnimatedNumber({ target, suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.floor(val)}{suffix}</>
}

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = [
    { to:'/', label:'Home' }, { to:'/dashboard', label:'Dashboard' },
    { to:'/alerts', label:'Alerts' }, { to:'/hotspots', label:'Hotspot Map' },
    { to:'/trends', label:'Trends' },
    { to:'/chatbot', label:'Ask AI' },
    { to:'/about', label:'About' },
  ]
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background: scrolled ? 'rgba(4,13,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,229,192,0.15)' : 'none',
      transition:'all 0.4s ease', padding:'0 40px', height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:26 }}>🌊</span>
        <span style={{ color:'#00e5c0', fontWeight:700, fontSize:18, letterSpacing:'-0.5px' }}>NadiRakshak</span>
        <span style={{ color:'rgba(0,229,192,0.5)', fontSize:12, marginLeft:2 }}>AI</span>
      </Link>
      <div style={{ display:'flex', gap:4 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: location.pathname === l.to ? '#00e5c0' : 'rgba(143,168,192,0.8)',
            textDecoration:'none', padding:'6px 16px', borderRadius:8, fontSize:14,
            background: location.pathname === l.to ? 'rgba(0,229,192,0.08)' : 'transparent',
            border: location.pathname === l.to ? '1px solid rgba(0,229,192,0.2)' : '1px solid transparent',
            transition:'all 0.2s',
          }}>{l.label}</Link>
        ))}
      </div>
    </nav>
  )
}
function Home() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  const stats = [
    { num:4.13, suffix:'M', label:'tonnes plastic waste yearly', decimals:2 },
    { num:80, suffix:'%', label:'water samples contain microplastics', decimals:0 },
    { num:258, suffix:'M', label:'litres sewage daily into Ganga', decimals:0 },
    { num:1.63, suffix:'B', label:'USD spent on cleanup — failing', decimals:2 },
  ]
  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', overflow:'hidden' }}>
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 24px' }}>
        <ParticleField />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 60%, rgba(0,229,192,0.06) 0%, transparent 70%)' }} />
        <div style={{ position:'relative', zIndex:1, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(30px)', transition:'all 1s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,229,192,0.08)', border:'1px solid rgba(0,229,192,0.2)', borderRadius:100, padding:'6px 16px', marginBottom:32, fontSize:13, color:'#00e5c0' }}>
            <PulseDot /><span>Live monitoring active — Ganga & Yamuna</span>
          </div>
          <h1 style={{ fontSize:'clamp(40px,7vw,88px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-2px', marginBottom:24, maxWidth:900 }}>
            <span style={{ color:'white' }}>Don't clean the river.</span><br/>
            <span style={{ background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Predict. Prevent. Protect.
            </span>
          </h1>
          <p style={{ fontSize:20, color:'rgba(143,168,192,0.9)', maxWidth:580, margin:'0 auto 48px', lineHeight:1.7 }}>
            AI-powered predictive plastic pollution prevention for India's rivers. Stop the crisis before it reaches the water.
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/dashboard" style={{ background:'#00e5c0', color:'#040d1a', padding:'14px 32px', borderRadius:10, fontWeight:700, fontSize:15, textDecoration:'none' }}>
              Open Dashboard →
            </Link>
            <Link to="/about" style={{ background:'transparent', color:'#00e5c0', padding:'14px 32px', borderRadius:10, fontWeight:600, fontSize:15, textDecoration:'none', border:'1px solid rgba(0,229,192,0.3)' }}>
              How it works
            </Link>
          </div>
        </div>
        <RiverWave opacity={0.12} />
      </div>
      <div style={{ padding:'100px 40px', background:'rgba(0,0,0,0.3)' }}>
        <p style={{ textAlign:'center', color:'rgba(0,229,192,0.7)', fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 }}>The scale of the crisis</p>
        <h2 style={{ textAlign:'center', fontSize:'clamp(28px,4vw,48px)', fontWeight:700, marginBottom:64, color:'white' }}>India's rivers are drowning in plastic</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:24, maxWidth:1100, margin:'0 auto' }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(0,229,192,0.1)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
              <div style={{ fontSize:'clamp(36px,5vw,56px)', fontWeight:800, color:'#00e5c0', fontVariantNumeric:'tabular-nums' }}>
                <AnimatedNumber target={s.num} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <p style={{ color:'rgba(143,168,192,0.8)', fontSize:14, marginTop:8, lineHeight:1.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'100px 40px' }}>
        <p style={{ textAlign:'center', color:'rgba(0,229,192,0.7)', fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 }}>Three AI modules</p>
        <h2 style={{ textAlign:'center', fontSize:'clamp(28px,4vw,48px)', fontWeight:700, marginBottom:64, color:'white' }}>How NadiRakshak works</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24, maxWidth:1100, margin:'0 auto' }}>
          {[
            { icon:'🛰️', title:'Satellite Hotspot AI', color:'#1a8fe3', desc:'Sentinel-2 satellite imagery scanned weekly. AI detects plastic accumulation on riverbanks and drains before monsoon washes it in.', tag:'Computer Vision' },
            { icon:'🌧️', title:'Monsoon Flow Predictor', color:'#f5a623', desc:'Combines weather forecasts, terrain maps, and historical dump locations to predict which drains overflow 48 hours before heavy rain.', tag:'Predictive ML' },
            { icon:'📊', title:'River Health Dashboard', color:'#00e5c0', desc:'Live CPCB data explained in plain Hindi & English. Citizens ask "Is it safe to bathe in Ganga at Varanasi today?" and get an instant AI answer.', tag:'LLM + Real-time Data' },
          ].map((m,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${m.color}22`, borderRadius:20, padding:'36px 28px', position:'relative', overflow:'hidden', transition:'transform 0.3s, border-color 0.3s', cursor:'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=m.color+'55' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=m.color+'22' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${m.color},transparent)` }} />
              <span style={{ fontSize:40, display:'block', marginBottom:20 }}>{m.icon}</span>
              <span style={{ background:`${m.color}18`, color:m.color, fontSize:11, fontWeight:600, letterSpacing:'0.08em', padding:'3px 10px', borderRadius:100, textTransform:'uppercase' }}>{m.tag}</span>
              <h3 style={{ color:'white', fontSize:22, fontWeight:700, margin:'16px 0 12px' }}>{m.title}</h3>
              <p style={{ color:'rgba(143,168,192,0.8)', fontSize:15, lineHeight:1.7 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'100px 40px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, rgba(0,229,192,0.05) 0%, transparent 70%)' }} />
        <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:800, color:'white', marginBottom:16, position:'relative' }}>Ready to protect India's rivers?</h2>
        <p style={{ color:'rgba(143,168,192,0.8)', fontSize:18, marginBottom:40, position:'relative' }}>Open the live dashboard and see real-time river health data.</p>
        <Link to="/dashboard" style={{ position:'relative', background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', color:'#040d1a', padding:'16px 40px', borderRadius:12, fontWeight:700, fontSize:16, textDecoration:'none', display:'inline-block' }}>
          Launch Dashboard →
        </Link>
      </div>
    </div>
  )
}

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
        <ParticleField />
        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ fontSize:'clamp(32px,5vw,64px)', fontWeight:800, letterSpacing:'-2px', marginBottom:16 }}>
            How <span style={{ background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>NadiRakshak</span> works
          </h1>
          <p style={{ color:'rgba(143,168,192,0.8)', fontSize:18, maxWidth:600, margin:'0 auto' }}>Six steps from satellite to cleaner river</p>
        </div>
        <RiverWave opacity={0.1} />
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
    <BrowserRouter>
      <style>{`
        @keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#040d1a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#040d1a; }
        ::-webkit-scrollbar-thumb { background:rgba(0,229,192,0.3); border-radius:3px; }
      `}</style>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/hotspots" element={<HotspotMap />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}