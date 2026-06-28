# 🌊 NadiRakshak AI — River Guardian

> **"Don't just clean the river — predict where plastic will enter it, and stop it before it reaches the water."**

**Hack4Humanity 2026** | IEEE JCTS Pune | Grand Finale: August 8, 2026 | Track: AI for Societal Good

---

## 🚨 The Problem

India spends billions on river cleanup — but the plastic keeps coming back.

| Statistic | Figure |
|-----------|--------|
| Plastic waste generated yearly | 4.13 million tonnes |
| Water samples with microplastics | 80% (Ganga + Yamuna) |
| Untreated sewage into Ganga daily | 258.67 million litres |
| Spent on cleanup since 1993 | USD 1.63 billion |
| Result | Rivers still critically polluted |

**The root cause: Reactive cleanup is failing. Nobody is tackling the source.**

---

## 💡 The Solution — Predictive Prevention

NadiRakshak AI predicts where plastic will enter India's rivers and alerts municipalities **before** it happens — not after.

```
Satellite scans riverbanks weekly
        ↓
AI detects plastic hotspots on banks & drains
        ↓
Monsoon predictor fires 48hr overflow warning
        ↓
Municipality gets Hindi + English SMS alert
        ↓
Cleanup crew dispatched before rain hits
        ↓
River health dashboard shows improvement
        ↓
Citizens see cleaner data → motivation to act
```

---

## 🧠 Seven AI Modules

### 🛰️ 1. Satellite Hotspot Detector
- Sentinel-2 satellite imagery processed by computer vision AI
- Detects plastic accumulation on riverbanks and drains weekly
- Interactive Leaflet.js map with real river paths (Ganga, Yamuna, Gomti)
- Color-coded risk zones: Critical / High / Moderate

### 🌧️ 2. Monsoon Plastic Flow Predictor
- **RandomForest ML model** (100 estimators, 500 training samples)
- Features: rainfall, wind speed, plastic accumulation, drain capacity, historical overflow, temperature
- Predicts overflow probability per ward **48 hours before heavy rain**
- Outputs Hindi alerts: "वार्ड 14 में 95% खतरा — तुरंत सफाई करें"

### 📊 3. River Health Dashboard
- Live CPCB water quality data: BOD, DO, pH, Coliform
- Real-time variation model with monsoon factor (1.3x June-September)
- Auto-refreshes every 5 minutes with countdown timer
- Health index calculated from live BOD values

### 🌫️ 4. Air Quality Monitor
- OpenAQ API integration for 6 major river cities
- AQI, PM2.5, PM10, NO2 — refreshes every 30 minutes
- Plastic risk boost correlation: higher AQI = higher river plastic risk

### 📈 5. Historical Trend Charts
- 12-month BOD & DO trends for all 5 rivers
- Recharts area charts with monsoon season highlighting
- Toggle between rivers and metrics
- Clearly shows monsoon pollution spikes

### 🤖 6. Citizen Q&A Chatbot
- Smart rule-based AI using live river data
- Answers in Hindi + English simultaneously
- Questions like: "Is Ganga safe at Varanasi today?" → real-time BOD-based answer
- Covers: safety, BOD explanation, monsoon risks, air quality

### 📱 7. SMS Alert System
- Fast2SMS API integration for India
- Auto-generated Hindi + English alerts sent to municipality officers
- One-click dispatch from alert center
- Ward-level targeting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, React Router, Recharts, Leaflet.js |
| Backend | Node.js + Express, node-cron, Cheerio |
| ML Layer | Python 3 + FastAPI + scikit-learn (RandomForest) |
| Data Sources | CPCB Water Quality, OpenAQ Air Quality API |
| Maps | Leaflet.js + CartoDB dark tiles |
| SMS | Fast2SMS API |
| Charts | Recharts (AreaChart, LineChart) |
| Deployment | GitHub Pages (frontend) |

---

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/river-health` | Live CPCB river water quality (BOD, DO, pH, Coliform) |
| `GET /api/hotspots` | Satellite-detected plastic hotspot zones |
| `GET /api/alerts` | Ward-level Hindi + English municipality alerts |
| `GET /api/monsoon` | ML overflow predictions (48hr forecast) |
| `GET /api/air-quality` | OpenAQ air quality for 6 river cities |
| `GET /api/historical` | 12-month historical BOD/DO trend data |
| `POST /api/send-sms` | Send SMS alert to municipality officer |
| `POST /api/generate-alert` | LLM-powered alert generation (Anthropic) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Clone
```bash
git clone https://github.com/vishweshshukla95/NadiRakshak.git
cd NadiRakshak
```

### 2. Backend
```bash
cd backend
npm install
node index.js
```

### 3. ML Model
```bash
cd ml
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn numpy pandas scikit-learn requests python-dotenv
python3 monsoon_predictor.py
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Environment Variables
```
PORT=3001
FAST2SMS_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

---

## 🌐 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with crisis stats + animations |
| Dashboard | `/dashboard` | Live river health + monsoon predictor |
| Alerts | `/alerts` | Municipality alert center with SMS |
| Hotspot Map | `/hotspots` | Interactive Leaflet map with river paths |
| Trends | `/trends` | 12-month BOD/DO historical charts |
| Ask AI | `/chatbot` | Hindi/English river safety chatbot |
| About | `/about` | System architecture timeline |

---

## 🎯 Impact

- **Predictive** — acts 48 hours before plastic enters the river
- **Multilingual** — Hindi + English for wider reach
- **Real data** — CPCB + OpenAQ integration
- **Actionable** — direct SMS to municipality officers
- **Scalable** — architecture works for any Indian river

---

## 👨‍💻 Built By

**Vishwesh Shukla**
MBAtech Student — SVKM's NMIMS Mumbai
Tech Convenor — AMBIORA TechFest
GitHub: [@vishweshshukla95](https://github.com/vishweshshukla95)
LinkedIn: [vishwesh-shukla](https://linkedin.com/in/vishwesh-shukla-73ba3a27a)

---

## 🏆 Hackathon

**Hack4Humanity** — IEEE JCTS Pune
Grand Finale: **August 8, 2026**
Track: **AI for Societal Good**

---

*"The money is being spent. The cleanups are happening. But the plastic keeps coming back — because nobody is tackling the source. NadiRakshak changes that."*