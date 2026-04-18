from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health() -> None:
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_device_analysis() -> None:
    payload = {
        'records': [
            {'heart_rate': 78, 'glucose': 100, 'impedance': 50, 'temperature': 36.7},
            {'heart_rate': 150, 'glucose': 55, 'impedance': 18, 'temperature': 38.7},
            {'heart_rate': 80, 'glucose': 103, 'impedance': 51, 'temperature': 36.8},
            {'heart_rate': 79, 'glucose': 104, 'impedance': 52, 'temperature': 36.9},
        ],
        'feature_columns': ['heart_rate', 'glucose', 'impedance', 'temperature'],
        'contamination': 0.25,
    }
    r = client.post('/analyze/device', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body['total_records'] == 4
    assert body['anomaly_count'] >= 1


def test_drug_signal() -> None:
    payload = {
        'report_text': 'Patient on warfarin had spontaneous bleeding with dizziness and fatigue.',
        'top_k': 2,
    }
    r = client.post('/analyze/drug-signal', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert 'warfarin' in body['extracted_drugs']
    assert body['signal_strength'] in {'Weak', 'Moderate', 'Strong'}
    assert len(body['evidence']) == 2
