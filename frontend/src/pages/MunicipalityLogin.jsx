import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'nadirakshak2026'

export default function MunicipalityLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (username.trim() === VALID_USERNAME && password.trim() === VALID_PASSWORD) {
      localStorage.setItem('nadirakshak_municipality_auth', 'true')
      localStorage.setItem('nadirakshak_municipality_user', username)
      navigate('/municipality')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%, rgba(26,143,227,0.08) 0%, transparent 60%)' }} />
      <form onSubmit={handleLogin} style={{
        position:'relative', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(26,143,227,0.2)',
        borderRadius:24, padding:'48px 40px', width:'100%', maxWidth:420,
      }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <span style={{ fontSize:40, display:'block', marginBottom:12 }}>🏛️</span>
          <h1 style={{ fontSize:24, fontWeight:800, color:'white', marginBottom:8 }}>Municipality Login</h1>
          <p style={{ color:'rgba(143,168,192,0.7)', fontSize:14 }}>Access the full NadiRakshak control panel</p>
        </div>

        <label style={{ display:'block', color:'rgba(143,168,192,0.8)', fontSize:13, marginBottom:8 }}>Username</label>
        <input
          type="text" value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(26,143,227,0.2)',
            borderRadius:10, padding:'12px 16px', color:'white', fontSize:14, marginBottom:20, outline:'none',
          }}
        />

        <label style={{ display:'block', color:'rgba(143,168,192,0.8)', fontSize:13, marginBottom:8 }}>Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(26,143,227,0.2)',
            borderRadius:10, padding:'12px 16px', color:'white', fontSize:14, marginBottom:8, outline:'none',
          }}
        />

        {error && <p style={{ color:'#ff4444', fontSize:13, marginBottom:16 }}>{error}</p>}

        <button type="submit" style={{
          width:'100%', background:'#1a8fe3', color:'white', padding:'14px', borderRadius:10,
          fontWeight:700, fontSize:15, border:'none', cursor:'pointer', marginTop:12,
        }}>
          Login →
        </button>

        <p style={{ textAlign:'center', color:'rgba(143,168,192,0.5)', fontSize:12, marginTop:24 }}>
          Demo credentials: admin / nadirakshak2026
        </p>
      </form>
    </div>
  )
}
