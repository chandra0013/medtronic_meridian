import pandas as pd
import numpy as np
import random
from pathlib import Path
import os

# Define paths
DATA_DIR = Path("d:/Apps/medsense_ai_project/backend/app/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def generate_device_data(n_rows=100):
    """
    Generates synthetic heart rate, impedance, and glucose data with injected anomalies.
    """
    np.random.seed(42)
    
    # Base data
    data = {
        'timestamp': pd.date_range(start='2026-04-12', periods=n_rows, freq='5min').strftime('%Y-%m-%d %H:%M:%S'),
        'heart_rate': np.random.normal(75, 5, n_rows),
        'glucose': np.random.normal(100, 10, n_rows),
        'impedance': np.random.normal(500, 20, n_rows),
        'battery_voltage': np.random.uniform(3.5, 4.2, n_rows),
        'signal_quality': np.random.uniform(0.8, 1.0, n_rows)
    }
    
    df = pd.DataFrame(data)
    
    # Inject anomalies
    for _ in range(int(n_rows * 0.05)):
        idx = np.random.randint(0, n_rows)
        anomaly_type = random.choice(['tachycardia', 'hypoglycemia', 'sensor_fault'])
        if anomaly_type == 'tachycardia':
            df.loc[idx, 'heart_rate'] = np.random.uniform(140, 180)
        elif anomaly_type == 'hypoglycemia':
            df.loc[idx, 'glucose'] = np.random.uniform(30, 50)
        else:
            df.loc[idx, 'impedance'] = np.random.uniform(800, 1200)
            df.loc[idx, 'signal_quality'] = np.random.uniform(0.1, 0.3)
            
    df.to_csv(DATA_DIR / "sample_device_data.csv", index=False)
    print(f"Generated {len(df)} device records.")

def generate_faers_data(n_rows=500):
    """
    Generates synthetic adverse event data.
    """
    drugs = ["Warfarin", "Lisinopril", "Metformin", "Atorvastatin", "Amoxicillin", "Ibuprofen", "Omeprazole"]
    symptoms = ["Dizziness", "Rash", "Nausea", "Spontaneous bleeding", "Fatigue", "Hypoglycemia", "Coughed up blood"]
    
    data = []
    for i in range(n_rows):
        drug = random.choice(drugs)
        symptom = random.choice(symptoms)
        narrative = f"Patient taking {drug} reported {symptom} after {random.randint(1, 14)} days of treatment. "
        if random.random() > 0.7:
            second_symptom = random.choice([s for s in symptoms if s != symptom])
            narrative += f"Patient also experienced {second_symptom}."
            
        data.append({
            'source_id': f"AE-{10000+i}",
            'title': f"Adverse Event Report: {drug} & {symptom}",
            'drug': drug,
            'symptom': symptom,
            'snippet': narrative
        })
        
    df = pd.DataFrame(data)
    df.to_csv(DATA_DIR / "drug_signal_knowledge.csv", index=False)
    print(f"Generated {len(df)} FAERS records.")

if __name__ == "__main__":
    generate_device_data()
    generate_faers_data()
