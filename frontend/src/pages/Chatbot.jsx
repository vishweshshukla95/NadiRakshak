import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

const SUGGESTIONS = [
  'Is Ganga safe at Varanasi today?',
  'Kya Yamuna mein nahana safe hai?',
  'Which river is most polluted?',
  'What is BOD?',
  'Monsoon mein plastic risk kyun badhta hai?',
  'Which city has worst air quality?',
  'What is NadiRakshak?',
  'Haridwar mein Ganga ka paani kaisa hai?',
]

function generateResponse(question, riverData, airData, monsoonData) {
  const q = question.toLowerCase()

  // River safety checks
  const riverKeywords = {
    'varanasi': 'Ganga-Varanasi',
    'ganga': 'Ganga-Varanasi',
    'yamuna': 'Yamuna-Delhi',
    'delhi': 'Yamuna-Delhi',
    'haridwar': 'Ganga-Haridwar',
    'lucknow': 'Gomti-Lucknow',
    'gomti': 'Gomti-Lucknow',
    'ahmedabad': 'Sabarmati-Ahmedabad',
    'sabarmati': 'Sabarmati-Ahmedabad',
    'kanpur': 'Ganga-Varanasi',
    'allahabad': 'Ganga-Varanasi',
    'prayagraj': 'Ganga-Varanasi',
  }

  // Find mentioned river
  let mentionedRiver = null
  let mentionedCity = null
  Object.entries(riverKeywords).forEach(([keyword, riverKey]) => {
    if (q.includes(keyword)) {
      mentionedRiver = riverData?.find(r => `${r.river}-${r.location.split(' ')[0]}` === riverKey || riverKey.includes(r.location.split(' ')[0]))
      mentionedCity = keyword
    }
  })

  // Safe/bathing/nahana questions
  if (q.includes('safe') || q.includes('nahana') || q.includes('bathe') || q.includes('swim') || q.includes('drink') || q.includes('peena')) {
    if (mentionedRiver) {
      const bod = mentionedRiver.bod
      const doVal = mentionedRiver.do
      const isSafe = bod < 3 && doVal > 5
      const isModerate = bod < 10 && doVal > 3

      if (isSafe) {
        return {
          en: `✅ ${mentionedRiver.river} at ${mentionedRiver.location} is relatively safe today. BOD is ${bod} mg/L (safe limit: 3 mg/L) and DO is ${doVal} mg/L. However, always check with local authorities before bathing.`,
          hi: `✅ ${mentionedRiver.location} में ${mentionedRiver.river} आज अपेक्षाकृत सुरक्षित है। BOD ${bod} mg/L है (सुरक्षित सीमा: 3 mg/L) और DO ${doVal} mg/L है।`,
          status: 'safe'
        }
      } else if (isModerate) {
        return {
          en: `⚠️ ${mentionedRiver.river} at ${mentionedRiver.location} is moderately polluted. BOD is ${bod} mg/L — above safe limit of 3 mg/L. Avoid bathing or drinking this water. Children and elderly should stay away.`,
          hi: `⚠️ ${mentionedRiver.location} में ${mentionedRiver.river} मध्यम रूप से प्रदूषित है। BOD ${bod} mg/L है — सुरक्षित सीमा 3 mg/L से अधिक। नहाने या पीने से बचें।`,
          status: 'warning'
        }
      } else {
        return {
          en: `🚨 UNSAFE! ${mentionedRiver.river} at ${mentionedRiver.location} is severely polluted. BOD is ${bod} mg/L — ${Math.round(bod/3)}x above safe limit! DO is only ${doVal} mg/L. Do NOT bathe, swim or use this water for any purpose.`,
          hi: `🚨 असुरक्षित! ${mentionedRiver.location} में ${mentionedRiver.river} गंभीर रूप से प्रदूषित है। BOD ${bod} mg/L है — सुरक्षित सीमा से ${Math.round(bod/3)} गुना अधिक! बिल्कुल न नहाएं।`,
          status: 'danger'
        }
      }
    } else {
      // General safety question
      const criticalRivers = riverData?.filter(r => r.bod > 20) || []
      return {
        en: `⚠️ Currently ${criticalRivers.length} rivers are in critical condition. Yamuna at Delhi is the most polluted with BOD of ${riverData?.find(r=>r.location.includes('Delhi'))?.bod || 68} mg/L — ${Math.round((riverData?.find(r=>r.location.includes('Delhi'))?.bod || 68)/3)}x above safe limit. Please specify which river you want to check.`,
        hi: `⚠️ वर्तमान में ${criticalRivers.length} नदियाँ गंभीर स्थिति में हैं। यमुना दिल्ली में सबसे प्रदूषित है। कृपया बताएं कि आप किस नदी के बारे में जानना चाहते हैं।`,
        status: 'warning'
      }
    }
  }

  // Most polluted question
  if (q.includes('most polluted') || q.includes('sabse ganda') || q.includes('worst')) {
    const worst = riverData?.reduce((a, b) => a.bod > b.bod ? a : b)
    return {
      en: `🚨 ${worst?.river} at ${worst?.location} is currently the most polluted river with BOD of ${worst?.bod} mg/L — ${Math.round(worst?.bod/3)}x above the safe limit of 3 mg/L. Coliform count is ${worst?.coliform?.toLocaleString()} MPN/100ml — dangerously high.`,
      hi: `🚨 ${worst?.location} में ${worst?.river} सबसे प्रदूषित नदी है। BOD ${worst?.bod} mg/L है — सुरक्षित सीमा से ${Math.round(worst?.bod/3)} गुना अधिक।`,
      status: 'danger'
    }
  }

  // BOD explanation
  if (q.includes('bod') || q.includes('biochemical')) {
    return {
      en: `🧪 BOD (Biochemical Oxygen Demand) measures how much oxygen bacteria need to break down organic waste in water. Higher BOD = more pollution. Safe BOD limit for rivers is < 3 mg/L. Yamuna at Delhi currently has BOD of ${riverData?.find(r=>r.location.includes('Delhi'))?.bod || 68} mg/L — critically dangerous!`,
      hi: `🧪 BOD (जैव रासायनिक ऑक्सीजन मांग) मापता है कि पानी में कितना प्रदूषण है। BOD जितना अधिक, पानी उतना प्रदूषित। सुरक्षित सीमा 3 mg/L से कम है।`,
      status: 'info'
    }
  }

  // Monsoon question
  if (q.includes('monsoon') || q.includes('barish') || q.includes('rain') || q.includes('plastic')) {
    const highRisk = monsoonData?.filter(m => m.risk_level === 'Critical').length || 3
    return {
      en: `🌧️ During monsoon (June-September), plastic pollution risk increases by 30-40%. Heavy rain washes plastic from drains into rivers. Currently ${highRisk} wards have critical overflow risk. NadiRakshak's monsoon predictor gives 48-hour advance warning to municipalities.`,
      hi: `🌧️ मानसून में (जून-सितंबर) प्लास्टिक प्रदूषण का खतरा 30-40% बढ़ जाता है। भारी बारिश नालों से प्लास्टिक नदियों में बहा देती है। अभी ${highRisk} वार्डों में गंभीर खतरा है।`,
      status: 'warning'
    }
  }

  // Air quality question
  if (q.includes('air') || q.includes('aqi') || q.includes('pollution') || q.includes('pm2.5')) {
    const worstCity = airData?.reduce((a, b) => a.aqi > b.aqi ? a : b)
    return {
      en: `🌫️ ${worstCity?.city} has the worst air quality with AQI of ${worstCity?.aqi} (${worstCity?.aqiStatus}). High air pollution increases plastic runoff risk into rivers by up to ${worstCity?.plasticRiskBoost}%. PM2.5: ${worstCity?.pm25} μg/m³.`,
      hi: `🌫️ ${worstCity?.city} की हवा सबसे खराब है, AQI ${worstCity?.aqi} (${worstCity?.aqiStatus})। उच्च वायु प्रदूषण नदियों में प्लास्टिक का खतरा ${worstCity?.plasticRiskBoost}% तक बढ़ा देता है।`,
      status: 'warning'
    }
  }

  // NadiRakshak explanation
  if (q.includes('nadirakshak') || q.includes('nadi rakshak') || q.includes('what is') || q.includes('kya hai')) {
    return {
      en: `🌊 NadiRakshak AI (River Guardian) is a predictive plastic pollution prevention system for India's rivers. Instead of reactive cleanup, it uses satellite imagery, ML models, and real-time data to predict where plastic will enter rivers — and alerts municipalities 48 hours in advance. Built for Hack4Humanity 2026.`,
      hi: `🌊 नदीरक्षक AI (नदी संरक्षक) भारत की नदियों के लिए एक पूर्वानुमान प्रणाली है। यह उपग्रह चित्र, ML मॉडल और वास्तविक समय डेटा का उपयोग करके नगरपालिकाओं को 48 घंटे पहले चेतावनी देती है।`,
      status: 'info'
    }
  }

  // Default response
  return {
    en: `🤔 I can answer questions about river safety, water quality, plastic pollution, and monsoon risks. Try asking: "Is Ganga safe at Varanasi?", "Which river is most polluted?", or "What is BOD?"`,
    hi: `🤔 मैं नदी सुरक्षा, जल गुणवत्ता, प्लास्टिक प्रदूषण के बारे में प्रश्नों का उत्तर दे सकता हूं। पूछें: "क्या वाराणसी में गंगा सुरक्षित है?"`,
    status: 'info'
  }
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      en: '🌊 Namaste! I am NadiRakshak AI — your river safety assistant. Ask me about river water quality, plastic pollution, or monsoon risks in Hindi or English!',
      hi: '🌊 नमस्ते! मैं नदीरक्षक AI हूं — आपका नदी सुरक्षा सहायक। मुझसे नदी जल गुणवत्ता, प्लास्टिक प्रदूषण या मानसून जोखिम के बारे में पूछें!',
      status: 'info'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [riverData, setRiverData] = useState([])
  const [airData, setAirData] = useState([])
  const [monsoonData, setMonsoonData] = useState([])
  const [lang, setLang] = useState('both')
  const bottomRef = useRef(null)

  useEffect(() => {
    Promise.all([
      axios.get('/api/river-health'),
      axios.get('/api/air-quality'),
      axios.get('/api/monsoon'),
    ]).then(([r1, r2, r3]) => {
      setRiverData(r1.data.rivers)
      setAirData(r2.data.cities)
      setMonsoonData(r3.data.predictions)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    const userMsg = { role:'user', text:input }
    const response = generateResponse(input, riverData, airData, monsoonData)
    setMessages(prev => [...prev, userMsg, { role:'bot', ...response }])
    setInput('')
  }

  function handleSuggestion(s) {
    const response = generateResponse(s, riverData, airData, monsoonData)
    setMessages(prev => [...prev,
      { role:'user', text:s },
      { role:'bot', ...response }
    ])
  }

  const statusColor = { safe:'#00e5c0', warning:'#f5a623', danger:'#ff4444', info:'#1a8fe3' }

  return (
    <div style={{ background:'#040d1a', minHeight:'100vh', color:'white', paddingTop:64, display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.6; } 100% { transform:translate(-50%,-50%) scale(3); opacity:0; } }`}</style>

      {/* Header */}
      <div style={{ position:'relative', padding:'40px 40px 40px', overflow:'hidden', borderBottom:'1px solid rgba(0,229,192,0.1)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(0,229,192,0.06) 0%, transparent 60%)' }} />
        <div style={{ position:'relative', maxWidth:800, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:'clamp(24px,3vw,40px)', fontWeight:800, letterSpacing:'-1px', marginBottom:4 }}>
              🤖 NadiRakshak Chatbot
            </h1>
            <p style={{ color:'rgba(143,168,192,0.8)', fontSize:15 }}>
              Ask about river safety in Hindi or English — powered by live data
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['both','en','hi'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang===l ? 'rgba(0,229,192,0.1)' : 'transparent',
                border: lang===l ? '1px solid rgba(0,229,192,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: lang===l ? '#00e5c0' : 'rgba(143,168,192,0.6)',
                padding:'5px 14px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer',
              }}>{l === 'both' ? '🌐 Both' : l === 'en' ? '🇬🇧 EN' : '🇮🇳 HI'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, maxWidth:800, width:'100%', margin:'0 auto', padding:'24px 40px', overflowY:'auto', maxHeight:'calc(100vh - 300px)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom:20, display:'flex', flexDirection:'column', alignItems: m.role==='user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'user' ? (
              <div style={{ background:'rgba(0,229,192,0.1)', border:'1px solid rgba(0,229,192,0.2)', borderRadius:'16px 16px 4px 16px', padding:'12px 18px', maxWidth:'70%' }}>
                <p style={{ color:'white', fontSize:15 }}>{m.text}</p>
              </div>
            ) : (
              <div style={{ maxWidth:'85%' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>🌊</span>
                  <span style={{ color:'#00e5c0', fontSize:12, fontWeight:600 }}>NadiRakshak AI</span>
                  {m.status && <span style={{ background:`${statusColor[m.status]}18`, color:statusColor[m.status], fontSize:11, padding:'2px 8px', borderRadius:100, fontWeight:600 }}>{m.status}</span>}
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${statusColor[m.status] || '#00e5c0'}22`, borderRadius:'4px 16px 16px 16px', padding:'14px 18px' }}>
                  {(lang === 'both' || lang === 'en') && m.en && (
                    <p style={{ color:'rgba(220,235,250,0.95)', fontSize:15, lineHeight:1.7, marginBottom: lang==='both' && m.hi ? 12 : 0 }}>{m.en}</p>
                  )}
                  {lang === 'both' && m.hi && <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'8px 0' }} />}
                  {(lang === 'both' || lang === 'hi') && m.hi && (
                    <p style={{ color:'rgba(200,220,240,0.85)', fontSize:14, lineHeight:1.8 }}>{m.hi}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ maxWidth:800, margin:'0 auto', padding:'0 40px 16px', width:'100%' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {SUGGESTIONS.slice(0,4).map(s => (
            <button key={s} onClick={() => handleSuggestion(s)} style={{
              background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
              color:'rgba(143,168,192,0.7)', padding:'6px 14px', borderRadius:100,
              fontSize:12, cursor:'pointer', transition:'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ maxWidth:800, margin:'0 auto', padding:'0 40px 32px', width:'100%' }}>
        <div style={{ display:'flex', gap:12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about river safety... (Hindi or English)"
            style={{
              flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,229,192,0.2)',
              borderRadius:12, padding:'14px 20px', color:'white', fontSize:15, outline:'none',
            }}
          />
          <button onClick={handleSend} style={{
            background:'linear-gradient(135deg,#00e5c0,#1a8fe3)', color:'#040d1a',
            border:'none', borderRadius:12, padding:'14px 28px', fontSize:15,
            fontWeight:700, cursor:'pointer',
          }}>Send →</button>
        </div>
      </div>
    </div>
  )
}