import { Link, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

function PulseDot({ color = '#00e5c0' }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, marginRight:8 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, animation:'pulse 1.8s ease-out infinite' }} />
      <span style={{ position:'absolute', inset:2, borderRadius:'50%', background:color }} />
    </span>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 24px' }}>
      <ParticleField />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 60%, rgba(0,229,192,0.06) 0%, transparent 70%)' }} />

      <div style={{ position:'relative', zIndex:1, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(30px)', transition:'all 1s ease', maxWidth:760 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,229,192,0.08)', border:'1px solid rgba(0,229,192,0.2)', borderRadius:100, padding:'6px 16px', marginBottom:32, fontSize:13, color:'#00e5c0' }}>
          <PulseDot /><span>Live monitoring active — Ganga & Yamuna</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:24 }}>
          <span style={{ fontSize:44 }}>🌊</span>
          <span style={{ color:'#00e5c0', fontWeight:800, fontSize:36, letterSpacing:'-1px' }}>NadiRakshak</span>
          <span style={{ color:'rgba(0,229,192,0.5)', fontSize:18, marginTop:6 }}>AI</span>
        </div>

        <h1 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:800, lineHeight:1.15, letterSpacing:'-1px', marginBottom:20 }}>
          <span style={{ color:'white' }}>Don't clean the river.</span><br/>
          <span style={{ background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Predict. Prevent. Protect.
          </span>
        </h1>
        <p style={{ fontSize:17, color:'rgba(143,168,192,0.9)', maxWidth:520, margin:'0 auto 48px', lineHeight:1.7 }}>
          AI-powered predictive plastic pollution prevention for India's rivers. Choose how you'd like to enter.
        </p>

        <div style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/citizen')} style={{
            background:'#00e5c0', color:'#040d1a', padding:'20px 36px', borderRadius:16,
            fontWeight:700, fontSize:16, border:'none', cursor:'pointer', minWidth:220,
            display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            boxShadow:'0 8px 30px rgba(0,229,192,0.25)', transition:'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <span style={{ fontSize:28 }}>🙋</span>
            Continue as Citizen
            <span style={{ fontSize:12, fontWeight:400, opacity:0.7 }}>Report, track, explore — no login</span>
          </button>

          <button onClick={() => navigate('/municipality/login')} style={{
            background:'transparent', color:'#1a8fe3', padding:'20px 36px', borderRadius:16,
            fontWeight:700, fontSize:16, border:'1px solid rgba(26,143,227,0.4)', cursor:'pointer', minWidth:220,
            display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            transition:'transform 0.2s, background 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(26,143,227,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='transparent' }}>
            <span style={{ fontSize:28 }}>🏛️</span>
            Municipality Login
            <span style={{ fontSize:12, fontWeight:400, opacity:0.7 }}>Full dashboard & controls</span>
          </button>
        </div>
      </div>
    </div>
  )
}
