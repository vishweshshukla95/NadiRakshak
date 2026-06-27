from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import uvicorn
import random
from datetime import datetime

app = FastAPI(title="NadiRakshak Monsoon Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── TRAIN A SIMPLE MODEL ON SYNTHETIC DATA ───────────────────────
# Features: rainfall_mm, wind_speed, plastic_accumulation,
#           drain_capacity, historical_overflow, temperature
np.random.seed(42)
n = 500

rainfall       = np.random.uniform(0, 150, n)
wind_speed     = np.random.uniform(0, 80, n)
plastic_level  = np.random.uniform(0, 100, n)
drain_capacity = np.random.uniform(10, 100, n)
hist_overflow  = np.random.uniform(0, 1, n)
temperature    = np.random.uniform(20, 45, n)

# Overflow happens when rain is high + plastic is high + drain is low
overflow = (
    (rainfall > 60) &
    (plastic_level > 50) &
    (drain_capacity < 50)
).astype(int)

X = np.column_stack([
    rainfall, wind_speed, plastic_level,
    drain_capacity, hist_overflow, temperature
])
y = overflow

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

print("✅ Monsoon predictor model trained successfully")

# ── WARD DATA ────────────────────────────────────────────────────
wards = [
    { "ward": "Ward 14", "city": "Varanasi", "river": "Ganga",
      "rainfall_mm": 89, "wind_speed": 42, "plastic_level": 87,
      "drain_capacity": 23, "hist_overflow": 0.8, "temperature": 34 },
    { "ward": "Ward 7", "city": "Kanpur", "river": "Ganga",
      "rainfall_mm": 72, "wind_speed": 38, "plastic_level": 74,
      "drain_capacity": 31, "hist_overflow": 0.7, "temperature": 36 },
    { "ward": "Ward 22", "city": "Allahabad", "river": "Ganga",
      "rainfall_mm": 65, "wind_speed": 28, "plastic_level": 61,
      "drain_capacity": 45, "hist_overflow": 0.5, "temperature": 35 },
    { "ward": "Ward 3", "city": "Haridwar", "river": "Ganga",
      "rainfall_mm": 41, "wind_speed": 22, "plastic_level": 38,
      "drain_capacity": 68, "hist_overflow": 0.3, "temperature": 29 },
    { "ward": "Ward 9", "city": "Delhi", "river": "Yamuna",
      "rainfall_mm": 78, "wind_speed": 35, "plastic_level": 91,
      "drain_capacity": 18, "hist_overflow": 0.9, "temperature": 38 },
    { "ward": "Ward 2", "city": "Mathura", "river": "Yamuna",
      "rainfall_mm": 35, "wind_speed": 18, "plastic_level": 43,
      "drain_capacity": 72, "hist_overflow": 0.2, "temperature": 37 },
]

# ── REQUEST MODEL ─────────────────────────────────────────────────
class PredictRequest(BaseModel):
    rainfall_mm: float
    wind_speed: float
    plastic_level: float
    drain_capacity: float
    hist_overflow: float
    temperature: float

# ── ROUTES ───────────────────────────────────────────────────────
@app.get("/")
def root():
    return { "service": "NadiRakshak Monsoon Predictor", "status": "live" }

@app.get("/predict/all")
def predict_all():
    results = []
    for w in wards:
        features = np.array([[
            w["rainfall_mm"], w["wind_speed"], w["plastic_level"],
            w["drain_capacity"], w["hist_overflow"], w["temperature"]
        ]])
        features_scaled = scaler.transform(features)
        prob = model.predict_proba(features_scaled)[0][1]
        risk_pct = round(prob * 100, 1)

        if risk_pct > 70:
            level = "Critical"
            hindi = f"{w['ward']}, {w['city']} — अगले 48 घंटों में नाला उफान का खतरा {risk_pct}%। तुरंत सफाई करें।"
        elif risk_pct > 45:
            level = "High"
            hindi = f"{w['ward']}, {w['city']} — मानसून प्रवाह खतरा {risk_pct}%। सफाई दल तैयार रखें।"
        else:
            level = "Moderate"
            hindi = f"{w['ward']}, {w['city']} — खतरा {risk_pct}%। निगरानी जारी रखें।"

        results.append({
            "ward": w["ward"],
            "city": w["city"],
            "river": w["river"],
            "risk_percent": risk_pct,
            "overflow_predicted": bool(prob > 0.5),
            "risk_level": level,
            "hindi_alert": hindi,
            "features": {
                "rainfall_mm": w["rainfall_mm"],
                "wind_speed_kmh": w["wind_speed"],
                "plastic_level_pct": w["plastic_level"],
                "drain_capacity_pct": w["drain_capacity"],
                "temperature_c": w["temperature"],
            },
            "timestamp": datetime.now().isoformat()
        })

    results.sort(key=lambda x: x["risk_percent"], reverse=True)
    return {
        "status": "ok",
        "model": "RandomForest (100 estimators)",
        "predictions": results,
        "high_risk_count": len([r for r in results if r["risk_percent"] > 70]),
        "generated_at": datetime.now().isoformat()
    }

@app.post("/predict/single")
def predict_single(req: PredictRequest):
    features = np.array([[
        req.rainfall_mm, req.wind_speed, req.plastic_level,
        req.drain_capacity, req.hist_overflow, req.temperature
    ]])
    features_scaled = scaler.transform(features)
    prob = model.predict_proba(features_scaled)[0][1]
    risk_pct = round(prob * 100, 1)
    return {
        "status": "ok",
        "risk_percent": risk_pct,
        "overflow_predicted": bool(prob > 0.5),
        "risk_level": "Critical" if risk_pct > 70 else "High" if risk_pct > 45 else "Moderate",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)