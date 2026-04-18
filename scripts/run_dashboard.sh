#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
streamlit run dashboard/app.py --server.port 8501
