from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str


class DeviceAnalysisRequest(BaseModel):
    records: List[Dict[str, Any]] = Field(..., description='List of device signal rows')
    feature_columns: Optional[List[str]] = None
    contamination: float = 0.08
    user_question: Optional[str] = None


class DeviceAnomalyRecord(BaseModel):
    row_index: int
    anomaly_score: float
    risk_level: str
    explanation: str
    recommendation: str
    row: Dict[str, Any]


class DeviceAnalysisResponse(BaseModel):
    total_records: int
    features_used: List[str]
    anomaly_count: int
    anomalies: List[DeviceAnomalyRecord]
    summary: str


class PharmacovigilanceRequest(BaseModel):
    report_text: str
    top_k: int = 3
    user_question: Optional[str] = None


class SignalEvidence(BaseModel):
    source_id: str
    title: str
    similarity_score: float
    snippet: str


class PharmacovigilanceResponse(BaseModel):
    extracted_drugs: List[str]
    extracted_symptoms: List[str]
    signal_strength: str
    triage_priority: str
    mechanism_hypothesis: str
    recommended_action: str
    narrative: str
    evidence: List[SignalEvidence]


class ChatExplainRequest(BaseModel):
    context_type: str = Field(..., pattern='^(device|drug_signal)$')
    context: Dict[str, Any]
    question: str


class ChatExplainResponse(BaseModel):
    answer: str
