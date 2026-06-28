const express = require('express');
const { startScraper, getCachedData } = require('./cpcb-scraper');
const { initOpenAQ, getAirData } = require('./openaq');
const { sendSMS, sendAlertToMunicipality } = require('./sms');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── REAL CPCB RIVER DATA (scraped + structured) ──────────────────
const getRiverData = () => getCachedData();

// ── HOTSPOT DATA ─────────────────────────────────────────────────
const hotspotData = [
  { id:'HS-001', name:'Varanasi Ghat Drain Cluster', lat:25.3176, lon:83.0062, risk:94, type:'Drain Overflow', ward:'Ward 14', city:'Varanasi' },
  { id:'HS-002', name:'Kanpur Industrial Nallah', lat:26.4499, lon:80.3319, risk:87, type:'Industrial Discharge', ward:'Ward 7', city:'Kanpur' },
  { id:'HS-003', name:'Allahabad Sangam Bank', lat:25.4358, lon:81.8463, risk:76, type:'Bank Accumulation', ward:'Ward 22', city:'Allahabad' },
  { id:'HS-004', name:'Haridwar Upper Ganga', lat:29.9457, lon:78.1642, risk:52, type:'Tourist Waste', ward:'Ward 3', city:'Haridwar' },
  { id:'HS-005', name:'Delhi Yamuna Pushta', lat:28.6139, lon:77.2090, risk:91, type:'Urban Runoff', ward:'Ward 9', city:'Delhi' },
  { id:'HS-006', name:'Mathura Refinery Zone', lat:27.4924, lon:77.6737, risk:43, type:'Chemical Waste', ward:'Ward 2', city:'Mathura' },
];

// ── ROUTE 1: River Health ────────────────────────────────────────
app.get('/api/river-health', (req, res) => {
  const riverData = getRiverData();
const avgBod = Math.round(riverData.reduce((a, r) => a + r.bod, 0) / riverData.length);
  const healthIndex = Math.max(0, 100 - avgBod);
  res.json({
    status: 'ok',
    healthIndex,
    rivers: riverData,
    summary: `${riverData.filter(r => r.status === 'Critical' || r.status === 'Severe').length} rivers in critical condition`,
    lastUpdated: new Date().toISOString(),
  });
});

// ── ROUTE 2: Hotspots ────────────────────────────────────────────
app.get('/api/hotspots', (req, res) => {
  res.json({
    status: 'ok',
    total: hotspotData.length,
    highRisk: hotspotData.filter(h => h.risk > 80).length,
    hotspots: hotspotData,
    lastUpdated: new Date().toISOString(),
  });
});

// ── ROUTE 3: Smart Template Alerts ──────────────────────────────
app.get('/api/alerts', (req, res) => {
  const alertTemplates = {
    'Drain Overflow': {
      hindi: (ward, city, risk) => `${ward}, ${city} — नाले में प्लास्टिक जमा है। ${risk}% खतरा। बारिश से पहले सफाई करें।`,
      action: 'नाला साफ करें',
    },
    'Industrial Discharge': {
      hindi: (ward, city, risk) => `${ward}, ${city} — औद्योगिक कचरा नदी में मिल रहा है। ${risk}% खतरा। तुरंत जांच करें।`,
      action: 'कारखाना जांचें',
    },
    'Bank Accumulation': {
      hindi: (ward, city, risk) => `${ward}, ${city} — नदी किनारे प्लास्टिक जमा हो रहा है। ${risk}% खतरा। सफाई दल भेजें।`,
      action: 'सफाई दल भेजें',
    },
    'Tourist Waste': {
      hindi: (ward, city, risk) => `${ward}, ${city} — पर्यटकों का कचरा नदी किनारे है। ${risk}% खतरा। कचरा पेटी लगाएं।`,
      action: 'कचरा पेटी लगाएं',
    },
    'Urban Runoff': {
      hindi: (ward, city, risk) => `${ward}, ${city} — शहरी बहाव से प्लास्टिक नदी में जा रहा है। ${risk}% खतरा।`,
      action: 'नाली बंद करें',
    },
    'Chemical Waste': {
      hindi: (ward, city, risk) => `${ward}, ${city} — रासायनिक कचरा नदी में मिल रहा है। ${risk}% खतरा। प्रदूषण बोर्ड को सूचित करें।`,
      action: 'CPCB को सूचित करें',
    },
  };

  const englishTemplates = {
    'Drain Overflow': (ward, city, risk) => `${ward}, ${city} — Drain overflow risk at ${risk}%. Clean before next rainfall.`,
    'Industrial Discharge': (ward, city, risk) => `${ward}, ${city} — Industrial discharge detected at ${risk}% risk. Immediate inspection required.`,
    'Bank Accumulation': (ward, city, risk) => `${ward}, ${city} — Plastic accumulation on riverbank at ${risk}% risk. Deploy cleanup crew.`,
    'Tourist Waste': (ward, city, risk) => `${ward}, ${city} — Tourist waste buildup at ${risk}% risk. Install waste bins and deploy team.`,
    'Urban Runoff': (ward, city, risk) => `${ward}, ${city} — Urban runoff carrying plastic at ${risk}% risk. Block drainage channels.`,
    'Chemical Waste': (ward, city, risk) => `${ward}, ${city} — Chemical waste discharge at ${risk}% risk. Notify CPCB immediately.`,
  };

  const alerts = hotspotData
    .filter(h => h.risk > 60)
    .sort((a, b) => b.risk - a.risk)
    .map(h => {
      const template = alertTemplates[h.type] || alertTemplates['Drain Overflow'];
      const engTemplate = englishTemplates[h.type] || englishTemplates['Drain Overflow'];
      return {
        id: `ALERT-${h.id}`,
        ward: h.ward,
        city: h.city,
        hotspotName: h.name,
        riskScore: h.risk,
        type: h.type,
        priority: h.risk > 85 ? 'Critical' : h.risk > 70 ? 'High' : 'Medium',
        english: engTemplate(h.ward, h.city, h.risk),
        hindi: template.hindi(h.ward, h.city, h.risk),
        action: template.action,
        timestamp: new Date().toISOString(),
      };
    });

  res.json({
    status: 'ok',
    total: alerts.length,
    critical: alerts.filter(a => a.priority === 'Critical').length,
    alerts,
    lastUpdated: new Date().toISOString(),
  });
});
// ── ROUTE 4: LLM Alert Generator ────────────────────────────────
app.post('/api/generate-alert', async (req, res) => {
  const { ward, city, riskScore, type, riverName } = req.body;

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `You are NadiRakshak AI, a river pollution prevention system for India.
Generate a SHORT municipality alert for the following situation:
- Ward: ${ward}, ${city}
- Risk Score: ${riskScore}%
- Issue Type: ${type}
- Nearby River: ${riverName || 'Ganga'}

Respond ONLY with a JSON object like this:
{
  "english": "short 1-sentence alert in English for municipality officer",
  "hindi": "same alert in Hindi (Devanagari script)",
  "action": "specific action to take in 5 words or less"
}
No extra text, just the JSON.`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const text = response.data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ status: 'ok', alert: parsed });
  } catch (err) {
    console.error('LLM error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});
// ── ROUTE 5: Monsoon Predictions ────────────────────────────────
app.get('/api/monsoon', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8001/predict/all');
    res.json(response.data);
  } catch (err) {
    console.error('Monsoon predictor error:', err.message);
    res.status(500).json({ status: 'error', message: 'Monsoon predictor offline' });
  }
});
// ── ROUTE 6: Air Quality (OpenAQ) ────────────────────────────────
app.get('/api/air-quality', async (req, res) => {
  const { data, lastFetched } = getAirData();
  res.json({ status:'ok', cities:Object.values(data), lastFetched, total:Object.keys(data).length });
});


// ── ROUTE 7: Send SMS Alert ───────────────────────────────────────
app.post('/api/send-sms', async (req, res) => {
  const { phones, ward, city, risk, hindi, english } = req.body;
  if (!phones || !phones.length) {
    return res.status(400).json({ status:'error', message:'No phone numbers provided' });
  }
  try {
    const results = await sendAlertToMunicipality(ward, city, risk, hindi, english, phones);
    const successful = results.filter(r => r.success).length;
    res.json({ status:'ok', message:`SMS sent to ${successful}/${phones.length} numbers`, results });
  } catch (err) {
    res.status(500).json({ status:'error', message: err.message });
  }
});
// ── ROUTE 8: Historical Trend Data ───────────────────────────────
app.get('/api/historical', (req, res) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const currentMonth = new Date().getMonth()

  // Generate 12 months of realistic historical data per river
  const rivers = {
    'Ganga-Varanasi': { baseBOD:38, baseDO:3.5, baseColiform:85000 },
    'Yamuna-Delhi': { baseBOD:62, baseDO:1.1, baseColiform:420000 },
    'Ganga-Haridwar': { baseBOD:8, baseDO:7.5, baseColiform:3000 },
    'Gomti-Lucknow': { baseBOD:24, baseDO:4.5, baseColiform:32000 },
    'Sabarmati-Ahmedabad': { baseBOD:6, baseDO:6.5, baseColiform:1800 },
  }

  const historicalData = months.map((month, i) => {
    const isMonsoon = i >= 5 && i <= 9
    const monsoonFactor = isMonsoon ? 1.4 : 1.0
    const trend = 1 - (i * 0.005) // slight improvement over year

    const dataPoint = { month }
    Object.entries(rivers).forEach(([name, base]) => {
      const variation = 0.9 + Math.random() * 0.2
      dataPoint[name + '_BOD'] = parseFloat((base.baseBOD * monsoonFactor * trend * variation).toFixed(1))
      dataPoint[name + '_DO'] = parseFloat((base.baseDO * (isMonsoon ? 0.85 : 1.0) * variation).toFixed(1))
    })
    return dataPoint
  })

  res.json({
    status: 'ok',
    data: historicalData,
    rivers: Object.keys(rivers),
    lastUpdated: new Date().toISOString(),
  })
})
app.listen(PORT, () => {
  console.log(`NadiRakshak backend running on port ${PORT}`);
  startScraper();
  initOpenAQ();
});