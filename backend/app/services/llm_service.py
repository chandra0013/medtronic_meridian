from __future__ import annotations

import os
from typing import Any, Dict, List

# API Keys from configuration
from ..config import ANTHROPIC_API_KEY, OPENAI_API_KEY, GROQ_API_KEY

def _safe_join(items: List[str]) -> str:
    return ', '.join(items) if items else 'none identified'

def explain_anomaly(row: Dict[str, Any], context_docs: List[str] = None, user_question: str | None = None) -> str:
    """
    Explains a medical device anomaly using Anthropic/OpenAI as specified in the Battle Plan.
    """
    prompt = f"""
    You are a medical device AI assistant for Medtronic.
    A device reading has been flagged as anomalous: {row}
    Relevant clinical context: {context_docs or 'No additional context provided.'}
    {f"User question: {user_question}" if user_question else ""}
    
    Explain in 3 sentences:
    1. Why this reading is anomalous (referencing specific deviations if possible)
    2. What clinical risk it may indicate (e.g. tachycardia, hypoglycemia, sensor failure)
    3. Recommended next action for the clinical team
    
    Keep the tone professional, cautious, and helpful.
    """
    
    # Try Groq first for ultra-fast "Decision Intelligence"
    if GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-70b-8192",
                max_tokens=300,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")

    # Fallback to Anthropic
    if ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620", # Using current stable sonnet
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            print(f"Anthropic error: {e}")

    # Fallback to OpenAI
    if OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error: {e}")

    # Deterministic Fallback
    return f"Anomaly detected in {list(row.keys())}. High deviations observed. Recommended action: Clinical review and sensor recalibration."

def generate_drug_signal_report(drug: str, symptom: str, similar_cases: List[Dict], literature: List[str] = None) -> str:
    """
    Generates a structured pharmacovigilance signal report as specified in the Battle Plan.
    """
    prompt = f"""
    You are a pharmacovigilance AI assistant for Novartis.
    Drug: {drug}, Reported symptom: {symptom}
    Similar adverse event cases found: {similar_cases}
    Supporting literature: {literature or 'N/A'}
    
    Generate a structured pharmacovigilance signal report with:
    - Signal strength (Weak/Moderate/Strong)
    - Mechanistic hypothesis (How the drug might cause this symptom)
    - Recommended action for safety team (e.g., monitor, update label, escalate)
    
    Use a professional and technical tone.
    """

    # Try Groq first
    if GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-70b-8192",
                max_tokens=500,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")

    # Fallback to Anthropic
    if ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            print(f"Anthropic error: {e}")

    # Fallback to OpenAI
    if OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error: {e}")

    # Deterministic Fallback
    return f"Signal Strength: Moderate. Hypothesis: Potential association between {drug} and {symptom}. Action: Escalate to safety team for clinical adjudication."

def answer_context_question(context_type: str, context: Dict[str, Any], question: str) -> str:
    """
    Provides a conversational answer to a user question given the current context.
    """
    prompt = f"""
    You are an AI medical assistant. 
    Context Type: {context_type}
    Current Analysis: {context}
    User Question: {question}
    
    Provide a concise, helpful answer based on the analysis context.
    """
    
    # Try Groq first
    if GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-70b-8192",
                max_tokens=300,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")

    # Fallback to Anthropic
    if ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            print(f"Anthropic error: {e}")
            
    # Fallback to OpenAI or simple string
    return f"Based on the {context_type} analysis, the answer to your question '{question}' is focused on the flagged data. Please refer to the recommendation section."

# Backward compatibility wrappers for existing service calls
def generate_device_explanation(row: Dict[str, Any], deviations: Dict[str, float], user_question: str | None = None) -> tuple[str, str]:
    explanation = explain_anomaly(row, context_docs=[str(deviations)], user_question=user_question)
    return explanation, "Review the flagged row and clinical history."

def generate_signal_narrative(
    drugs: List[str],
    symptoms: List[str],
    evidence_titles: List[str],
    signal_strength: str,
    triage_priority: str,
    user_question: str | None = None,
) -> tuple[str, str, str]:
    drug = drugs[0] if drugs else "Unknown"
    symptom = symptoms[0] if symptoms else "Unknown"
    report = generate_drug_signal_report(drug, symptom, similar_cases=[{"title": t} for t in evidence_titles])
    
    # Split into sections if possible or just return as narration
    return "See Signal Report", "Adjudicate Signal", report
