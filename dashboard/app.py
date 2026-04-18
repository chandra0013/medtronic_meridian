from __future__ import annotations

import io
import json
import os
from pathlib import Path

import pandas as pd
import requests
import streamlit as st

# Configuration
BACKEND_URL = os.getenv('MEDSENSE_BACKEND_URL', 'http://localhost:8000')
# Correcting path to be robust across environments
BASE_DIR = Path(__file__).resolve().parents[1]
SAMPLE_DEVICE_PATH = BASE_DIR / 'backend' / 'app' / 'data' / 'sample_device_data.csv'

# Branding Colors
MEDTRONIC_NAVY = "#003087"
MEDTRONIC_BLUE = "#0055A5"
NOVARTIS_RED = "#E40046"

st.set_page_config(page_title='MedSense AI | Enterprise Intelligence', page_icon='🏥', layout='wide')

# Custom CSS for Premium Look
st.markdown(
    f"""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        html, body, [class*="css"] {{
            font-family: 'Outfit', sans-serif;
        }}
        
        .main {{
            background: #f8fafc;
        }}
        
        .hero {{
            padding: 2.5rem;
            border-radius: 24px;
            background: linear-gradient(135deg, {MEDTRONIC_NAVY} 0%, {MEDTRONIC_BLUE} 40%, {NOVARTIS_RED} 100%);
            color: white;
            margin-bottom: 2rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }}
        
        .hero h1 {{
            font-weight: 700;
            font-size: 2.8rem;
            margin-bottom: 0.5rem;
            color: white;
            border: none;
        }}
        
        .hero p {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}
        
        .stButton>button {{
            border-radius: 12px;
            padding: 0.6rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }}
        
        .stButton>button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }}
        
        .card {{
            background: white;
            padding: 1.5rem;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            margin-bottom: 1rem;
        }}
        
        .metric-label {{
            color: #64748b;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
        }}
        
        .metric-value {{
            font-size: 1.8rem;
            font-weight: 700;
            color: {MEDTRONIC_NAVY};
        }}
        
        div[data-testid="stExpander"] {{
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            background: white;
        }}
    </style>
    """,
    unsafe_allow_html=True,
)

# Hero Section
st.markdown(
    f"""
    <div class='hero'>
        <h1>🏥 MedSense AI</h1>
        <p>Enterprise Healthcare Intelligence for Medtronic (Devices) & Novartis (Pharmacovigilance).</p>
    </div>
    """,
    unsafe_allow_html=True,
)

@st.cache_data
def load_sample_device_data() -> pd.DataFrame:
    if SAMPLE_DEVICE_PATH.exists():
        return pd.read_csv(SAMPLE_DEVICE_PATH)
    return pd.DataFrame()

def post_json(route: str, payload: dict) -> dict:
    resp = requests.post(f"{BACKEND_URL}{route}", json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()

def device_tab() -> None:
    st.markdown(f"### <span style='color:{MEDTRONIC_NAVY}'>🔬 Device Anomaly (Medtronic)</span>", unsafe_allow_html=True)
    st.caption("Monitoring life-critical signals for pacemakers, insulin pumps, and neurostimulators.")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        with st.container():
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            use_sample = st.checkbox('Load enterprise telemetry dataset', value=True)
            uploaded = st.file_uploader('Upload Sensor Data (CSV)', type=['csv'])
            st.markdown("</div>", unsafe_allow_html=True)
    
    with col2:
        with st.container():
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            st.markdown("<label class='metric-label'>Anomaly Sensitivity</label>", unsafe_allow_html=True)
            contamination = st.slider('', min_value=0.01, max_value=0.20, value=0.05, step=0.01)
            st.markdown("</div>", unsafe_allow_html=True)

    if use_sample:
        df = load_sample_device_data()
    elif uploaded is not None:
        df = pd.read_csv(uploaded)
    else:
        st.info('Please load a dataset to begin.')
        return

    if df.empty:
        st.warning("Dataset is missing. Ensure synthetic data generation has run.")
        return

    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    chosen_features = st.multiselect('Target Signals', options=numeric_cols, default=numeric_cols[:3] if len(numeric_cols) >= 3 else numeric_cols)
    
    if st.button('Execute Anomaly Analysis', type='primary'):
        if not chosen_features:
            st.error('Please select at least one signal feature.')
            return
            
        with st.spinner('Isolation Forest engine processing...'):
            payload = {
                'records': df.to_dict(orient='records'),
                'feature_columns': chosen_features,
                'contamination': contamination,
            }
            try:
                result = post_json('/analyze/device', payload)
                
                # Metrics Row
                m1, m2, m3 = st.columns(3)
                m1.markdown(f"<div class='card'><div class='metric-label'>Records Checked</div><div class='metric-value'>{result['total_records']}</div></div>", unsafe_allow_html=True)
                m2.markdown(f"<div class='card'><div class='metric-label'>Features Used</div><div class='metric-value'>{len(result['features_used'])}</div></div>", unsafe_allow_html=True)
                m3.markdown(f"<div class='card'><div class='metric-label'>Alerts Triggered</div><div class='metric-value' style='color:{NOVARTIS_RED}'>{result['anomaly_count']}</div></div>", unsafe_allow_html=True)
                
                st.write(result['summary'])
                
                if result['anomalies']:
                    st.divider()
                    st.subheader("🚩 Detected Anomalies")
                    anomaly_df = pd.DataFrame([
                        {'idx': a['row_index'], 'risk': a['risk_level'], 'score': round(a['anomaly_score'], 3), **a['row']}
                        for a in result['anomalies']
                    ])
                    st.dataframe(anomaly_df, use_container_width=True)
                    
                    selected_idx = st.selectbox('Investigate Anomaly', options=list(range(len(result['anomalies']))), 
                                                format_func=lambda i: f"Row {result['anomalies'][i]['row_index']} | Risk: {result['anomalies'][i]['risk_level']}")
                    
                    selected = result['anomalies'][selected_idx]
                    
                    c1, c2 = st.columns([1, 1])
                    with c1:
                        st.info(f"**🤖 AI Explanation:**\n\n{selected['explanation']}")
                    with c2:
                        st.success(f"**📋 Clinical Recommendation:**\n\n{selected['recommendation']}")
                        
                    # Follow-up Chat
                    st.markdown("#### 💬 Ask about this anomaly")
                    q = st.text_input("e.g., 'What are the implications for battery life?'")
                    if q:
                        with st.spinner("Analyzing context..."):
                            chat_res = post_json('/chat/explain', {'context_type': 'device', 'context': selected, 'question': q})
                            st.markdown(f"<div style='background:#f1f5f9; padding: 1rem; border-radius: 12px;'>{chat_res['answer']}</div>", unsafe_allow_html=True)
                else:
                    st.success("No anomalies detected.")
                    
            except Exception as e:
                st.error(f"Backend error: {e}")

def drug_tab() -> None:
    st.markdown(f"### <span style='color:{NOVARTIS_RED}'>💊 Drug Signal (Novartis)</span>", unsafe_allow_html=True)
    st.caption("RAG-enhanced pharmacovigilance for automated signal detection from adverse event text.")
    
    st.markdown("<div class='card'>", unsafe_allow_html=True)
    default_text = "Patient taking Warfarin reported spontaneous bleeding and coughed up blood after 5 days."
    ae_text = st.text_area("Narrative Report", value=default_text, height=150)
    top_k = st.slider('Evidence Depth', 1, 10, 3)
    st.markdown("</div>", unsafe_allow_html=True)

    if st.button('Detect Safety Signal', type='primary'):
        if not ae_text:
            st.warning("Narrative required.")
            return
            
        with st.spinner('Querying ChromaDB + LLM Report...'):
            try:
                result = post_json('/analyze/drug-signal', {'report_text': ae_text, 'top_k': top_k})
                
                # Metrics Row
                m1, m2, m3 = st.columns(3)
                m1.markdown(f"<div class='card'><div class='metric-label'>Signal Strength</div><div class='metric-value'>{result['signal_strength']}</div></div>", unsafe_allow_html=True)
                m2.markdown(f"<div class='card'><div class='metric-label'>Priority</div><div class='metric-value'>{result['triage_priority']}</div></div>", unsafe_allow_html=True)
                m3.markdown(f"<div class='card'><div class='metric-label'>Evidence Base</div><div class='metric-value'>{len(result['evidence'])} matches</div></div>", unsafe_allow_html=True)
                
                st.markdown("### 📋 Pharmacovigilance Signal Report")
                st.info(f"**Entities Extract:** {result['extracted_drugs']} | {result['extracted_symptoms']}")
                
                st.markdown("#### 🧪 Mechanistic Hypothesis")
                st.write(result['mechanism_hypothesis'])
                
                st.markdown("#### 📝 Narrative Summary")
                st.write(result['narrative'])
                
                st.markdown("#### 🚨 Recommended Action")
                st.warning(result['recommended_action'])
                
                with st.expander("📚 Supporting Evidence"):
                    for ev in result['evidence']:
                        st.markdown(f"**{ev['title']}**")
                        st.caption(ev['snippet'])
                        st.divider()
                        
            except Exception as e:
                st.error(f"Backend error: {e}")

# Main Tabs
tabs = st.tabs(['🔬 Device Anomaly', '💊 Drug Signal', '🏢 Architecture'])
with tabs[0]:
    device_tab()
with tabs[1]:
    drug_tab()
with tabs[2]:
    st.markdown("### System Architecture")
    st.markdown("""
    - **Frontend:** Streamlit with Custom CSS
    - **Backend:** FastAPI
    - **Analytics:** 
        - Isolation Forest (Device)
        - SpaCy NER + ChromaDB RAG (Drug Signal)
    - **LLM:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o
    """)
    try:
        health = post_json('/health', {})
        st.success(f"System Online: {health['app']} v{health['version']}")
    except:
        st.error("System Offline")
