from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..config import DATA_DIR

# Global state for cached TF-IDF model and matrix
_VECTORIZER = None
_MATRIX = None
_DF = None

def _initialize_index():
    global _VECTORIZER, _MATRIX, _DF
    if _VECTORIZER is None:
        path = DATA_DIR / 'drug_signal_knowledge.csv'
        if not path.exists():
            return
        
        _DF = pd.read_csv(path)
        texts = (_DF['title'].fillna('') + " " + _DF['snippet'].fillna('')).tolist()
        
        _VECTORIZER = TfidfVectorizer(stop_words='english')
        _MATRIX = _VECTORIZER.fit_transform(texts)

def retrieve_similar_cases(query: str, top_k: int = 3) -> List[Dict[str, str | float]]:
    """
    Retrieves similar cases using TF-IDF cosine similarity.
    Lighter than sentence-transformers for serverless environments.
    """
    _initialize_index()
    
    if _VECTORIZER is None or _DF is None:
        return []

    query_vec = _VECTORIZER.transform([query])
    similarities = cosine_similarity(query_vec, _MATRIX).flatten()
    
    # Get top K indices
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    out = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score <= 0:
            continue
            
        row = _DF.iloc[idx].to_dict()
        out.append({
            'source_id': str(row.get('source_id', 'N/A')),
            'title': str(row.get('title', 'N/A')),
            'similarity_score': score,
            'snippet': str(row.get('snippet', 'N/A')),
        })
    return out
