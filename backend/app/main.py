from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import APP_NAME, APP_VERSION
from .schemas import (
    ChatExplainRequest,
    ChatExplainResponse,
    DeviceAnalysisRequest,
    DeviceAnalysisResponse,
    HealthResponse,
    PharmacovigilanceRequest,
    PharmacovigilanceResponse,
)
from .services.device_service import analyze_records
from .services.llm_service import answer_context_question
from .services.pharmacovigilance_service import analyze_report

app = FastAPI(title=APP_NAME, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health', response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status='ok', app=APP_NAME, version=APP_VERSION)


@app.post('/analyze/device', response_model=DeviceAnalysisResponse)
def analyze_device(payload: DeviceAnalysisRequest) -> DeviceAnalysisResponse:
    try:
        result = analyze_records(
            records=payload.records,
            feature_columns=payload.feature_columns,
            contamination=payload.contamination,
            user_question=payload.user_question,
        )
        return DeviceAnalysisResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post('/analyze/drug-signal', response_model=PharmacovigilanceResponse)
def analyze_drug_signal(payload: PharmacovigilanceRequest) -> PharmacovigilanceResponse:
    try:
        result = analyze_report(payload.report_text, top_k=payload.top_k, user_question=payload.user_question)
        return PharmacovigilanceResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post('/chat/explain', response_model=ChatExplainResponse)
def chat_explain(payload: ChatExplainRequest) -> ChatExplainResponse:
    answer = answer_context_question(payload.context_type, payload.context, payload.question)
    return ChatExplainResponse(answer=answer)
