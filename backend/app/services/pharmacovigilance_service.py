from __future__ import annotations

import re
from typing import Dict, List, Tuple

try:
    import spacy
    _NLP = spacy.load("en_core_web_sm")
except Exception:
    _NLP = None

from .llm_service import generate_signal_narrative
from .retrieval_service import retrieve_similar_cases

DRUG_LEXICON = {
    'metformin', 'insulin', 'atorvastatin', 'amoxicillin', 'warfarin', 'ibuprofen',
    'paracetamol', 'acetaminophen', 'aspirin', 'omeprazole', 'lisinopril', 'clopidogrel'
}

SYMPTOM_LEXICON = {
    'rash', 'nausea', 'vomiting', 'fatigue', 'headache', 'dizziness', 'tachycardia',
    'bradycardia', 'hypoglycemia', 'hyperglycemia', 'bleeding', 'swelling', 'fever',
    'pain', 'cough', 'arrhythmia', 'syncope'
}

def extract_entities(report_text: str) -> Tuple[List[str], List[str]]:
    """
    Extracts drug and symptom entities using SpaCy with a lexicon fallback.
    """
    if _NLP:
        doc = _NLP(report_text)
        # Using ORG and PRODUCT as proxies for drugs in the base model
        # Using custom logic for symptoms as base model doesn't have DISEASE
        spacy_drugs = {ent.text.lower() for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT"]}
        
        # Combine Spacy with Lexicon for robustness
        tokens = re.findall(r"[A-Za-z\-]+", report_text.lower())
        lex_drugs = {t for t in tokens if t in DRUG_LEXICON}
        lex_symptoms = {t for t in tokens if t in SYMPTOM_LEXICON}
        
        # Merge
        drugs = sorted(spacy_drugs.union(lex_drugs))
        symptoms = sorted(lex_symptoms) # Base spacy lacks DISEASE, stick to lexicon for symptoms
        return drugs, symptoms
    else:
        # Full fallback to lexicon
        tokens = re.findall(r"[A-Za-z\-]+", report_text.lower())
        drugs = sorted({t for t in tokens if t in DRUG_LEXICON})
        symptoms = sorted({t for t in tokens if t in SYMPTOM_LEXICON})
        return drugs, symptoms

def _signal_strength(drugs: List[str], symptoms: List[str], evidence_count: int) -> str:
    score = len(drugs) + len(symptoms) + evidence_count
    if score >= 6:
        return 'Strong'
    if score >= 4:
        return 'Moderate'
    return 'Weak'

def _triage_priority(signal_strength: str, symptoms: List[str]) -> str:
    severe_flags = {'bleeding', 'arrhythmia', 'syncope', 'tachycardia', 'bradycardia'}
    if signal_strength == 'Strong' or severe_flags.intersection(symptoms):
        return 'High'
    if signal_strength == 'Moderate':
        return 'Medium'
    return 'Low'

def analyze_report(report_text: str, top_k: int = 3, user_question: str | None = None) -> Dict[str, object]:
    if not report_text.strip():
        raise ValueError('No report text provided.')

    drugs, symptoms = extract_entities(report_text)
    query = report_text
    if drugs or symptoms:
        query = ' '.join(drugs + symptoms + [report_text])

    evidence = retrieve_similar_cases(query, top_k=top_k)
    signal_strength = _signal_strength(drugs, symptoms, len(evidence))
    triage_priority = _triage_priority(signal_strength, symptoms)
    titles = [e['title'] for e in evidence]
    
    # generate_signal_narrative returns (mechanism, action, narrative)
    mechanism, action, narrative = generate_signal_narrative(
        drugs=drugs,
        symptoms=symptoms,
        evidence_titles=titles,
        signal_strength=signal_strength,
        triage_priority=triage_priority,
        user_question=user_question,
    )

    return {
        'extracted_drugs': drugs,
        'extracted_symptoms': symptoms,
        'signal_strength': signal_strength,
        'triage_priority': triage_priority,
        'mechanism_hypothesis': mechanism,
        'recommended_action': action,
        'narrative': narrative,
        'evidence': evidence,
    }
