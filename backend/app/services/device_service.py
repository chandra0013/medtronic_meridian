from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from .llm_service import generate_device_explanation

DEFAULT_FEATURE_PRIORITY = [
    'heart_rate',
    'glucose',
    'impedance',
    'temperature',
    'battery_voltage',
    'signal_quality',
]


def _pick_numeric_features(df: pd.DataFrame, user_features: List[str] | None = None) -> List[str]:
    if user_features:
        return [c for c in user_features if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    ordered = [c for c in DEFAULT_FEATURE_PRIORITY if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    remaining = [c for c in df.select_dtypes(include=[np.number]).columns if c not in ordered]
    return ordered + remaining


def _risk_level(score: float) -> str:
    if score <= -0.18:
        return 'High'
    if score <= -0.08:
        return 'Medium'
    return 'Low'


def analyze_records(records: List[Dict[str, Any]], feature_columns: List[str] | None, contamination: float, user_question: str | None = None) -> Dict[str, Any]:
    if not records:
        raise ValueError('No device records provided.')

    df = pd.DataFrame(records).copy()
    features = _pick_numeric_features(df, feature_columns)
    if not features:
        raise ValueError('No numeric feature columns found for anomaly detection.')

    clean = df[features].astype(float).fillna(df[features].astype(float).median())
    model = IsolationForest(contamination=contamination, random_state=42)
    preds = model.fit_predict(clean)
    scores = model.decision_function(clean)

    means = clean.mean()
    stds = clean.std(ddof=0).replace(0, 1.0)

    anomalies = []
    for idx, (pred, score) in enumerate(zip(preds, scores)):
        if pred == -1:
            row = df.iloc[idx].to_dict()
            deviations = {col: float((clean.iloc[idx][col] - means[col]) / stds[col]) for col in features}
            explanation, recommendation = generate_device_explanation(row, deviations, user_question=user_question)
            anomalies.append(
                {
                    'row_index': int(idx),
                    'anomaly_score': float(score),
                    'risk_level': _risk_level(float(score)),
                    'explanation': explanation,
                    'recommendation': recommendation,
                    'row': row,
                }
            )

    anomalies = sorted(anomalies, key=lambda x: x['anomaly_score'])
    summary = (
        f"Processed {len(df)} records using features {features}. "
        f"Detected {len(anomalies)} anomalous records. "
        f"This prototype uses Isolation Forest for unsupervised anomaly detection and plain-language explanation for triage."
    )

    return {
        'total_records': int(len(df)),
        'features_used': features,
        'anomaly_count': int(len(anomalies)),
        'anomalies': anomalies,
        'summary': summary,
    }
