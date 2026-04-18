from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List

import pandas as pd
try:
    import chromadb
    from sentence_transformers import SentenceTransformer
except ImportError:
    chromadb = None
    SentenceTransformer = None

from ..config import DATA_DIR

# Global state for vector DB and model
_CLIENT = None
_COLLECTION = None
_MODEL = None

def _get_model():
    global _MODEL
    if _MODEL is None and SentenceTransformer is not None:
        _MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    return _MODEL

def _get_collection():
    global _CLIENT, _COLLECTION
    if _CLIENT is None and chromadb is not None:
        _CLIENT = chromadb.PersistentClient(path=str(DATA_DIR / "chroma_db"))
        try:
            _COLLECTION = _CLIENT.get_collection("medsense")
        except Exception:
            _COLLECTION = _CLIENT.create_collection("medsense")
            _populate_collection()
    return _COLLECTION

def _populate_collection():
    global _COLLECTION
    path = DATA_DIR / 'drug_signal_knowledge.csv'
    if not path.exists():
        return
    
    df = pd.read_csv(path)
    model = _get_model()
    if model is None:
        return
        
    texts = (df['title'].fillna('') + " " + df['snippet'].fillna('')).tolist()
    embeddings = model.encode(texts).tolist()
    ids = [str(i) for i in range(len(texts))]
    metadatas = df.to_dict(orient='records')
    
    _COLLECTION.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )
    print(f"Populated ChromaDB with {len(texts)} documents.")

def retrieve_similar_cases(query: str, top_k: int = 3) -> List[Dict[str, str | float]]:
    """
    Retrieves similar cases using semantic search via ChromaDB.
    """
    collection = _get_collection()
    model = _get_model()
    
    if collection is None or model is None:
        # Fallback to empty if libs not installed or error
        return []

    query_embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )

    out = []
    if results['documents']:
        for i in range(len(results['documents'][0])):
            meta = results['metadatas'][0][i]
            out.append({
                'source_id': str(meta.get('source_id', 'N/A')),
                'title': str(meta.get('title', 'N/A')),
                'similarity_score': 1.0 - float(results['distances'][0][i]), # Chroma usually returns distances
                'snippet': str(results['documents'][0][i]),
            })
    return out
