# MedSense AI

MedSense AI is a demo-ready healthcare intelligence prototype designed around two practical workflows:

1. **Medical device anomaly detection** for Medtronic-style signal triage
2. **Pharmacovigilance signal detection** for Novartis-style adverse event review

It is built as a real mini-product, not just notebook code:
- **FastAPI backend** for analytics APIs
- **Streamlit dashboard** for analyst-facing inspection and demo
- **Optional OpenAI integration** for richer explanations
- **Deterministic fallback logic** so the project still runs without any API key

## Project Structure

```text
medsense_ai_project/
├── backend/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── schemas.py
│       ├── services/
│       └── data/
├── dashboard/
│   └── app.py
├── tests/
├── scripts/
├── requirements.txt
└── .env.example
```

## What the System Does

### 1) Device Intelligence
- Accepts CSV device/sensor records
- Selects numeric features
- Runs **Isolation Forest** anomaly detection
- Assigns risk levels
- Generates plain-language explanations and triage recommendations
- Supports follow-up analyst questions

### 2) Drug Safety Intelligence
- Accepts adverse event report text
- Extracts simple drug/symptom entities
- Retrieves similar evidence from a local knowledge base using **TF-IDF cosine similarity**
- Produces signal strength, triage priority, mechanism hypothesis, and recommended action
- Supports follow-up safety questions

## Why This Architecture Is Strong

This project aligns tightly with enterprise AI and data science internship expectations:
- **Python mandatory** → core backend is fully Python
- **Agentic / AI solutions** → explanation layer + analyst Q&A
- **ML project experience** → anomaly detection and retrieval scoring
- **Databases / data engineering mindset** → modular services and reusable API design
- **Web frameworks** → FastAPI + Streamlit
- **Human-centric analytics** → explanations designed for operational users

## Setup

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate        # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Optional environment variables

Copy `.env.example` values into your shell or local env file.

```bash
export OPENAI_API_KEY="your_key_here"
export OPENAI_MODEL="gpt-4.1-mini"
export MEDSENSE_BACKEND_URL="http://localhost:8000"
```

If `OPENAI_API_KEY` is not provided, the app still works with the built-in fallback explanation engine.

## Run the App

### Start backend

```bash
bash scripts/run_backend.sh
```

Backend health check:

```bash
curl http://localhost:8000/health
```

### Start dashboard

In a second terminal:

```bash
bash scripts/run_dashboard.sh
```

Open:
- Backend docs: `http://localhost:8000/docs`
- Dashboard: `http://localhost:8501`

## Run Tests

```bash
PYTHONPATH=. pytest -q
```

## Suggested Demo Flow

### Demo 1: Device anomaly
1. Open the dashboard
2. Use the sample CSV
3. Run the device analysis
4. Show flagged rows with high-risk readings
5. Click into one anomaly and read the explanation + recommendation
6. Ask a follow-up question

### Demo 2: Drug safety signal
1. Paste or keep the sample adverse event narrative
2. Run signal analysis
3. Show extracted drugs/symptoms
4. Show supporting retrieved evidence
5. Explain why this is a decision-support tool, not just a raw model

## Important Note

This project is a **prototype for interview/demo use**. It is not intended for clinical diagnosis or production pharmacovigilance decisions without validation, governance, and expert review.
