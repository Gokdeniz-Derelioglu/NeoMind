# job_recommendation_updated.py
"""Reusable job‑recommendation module – **v2**
-------------------------------------------------
* Lazy model & score caching.
* Random contiguous slice (`random_block_jobs`).
* **NEW** helpers that return ready‑to‑render *job objects* with the display
  properties your UI expects (`random_block_job_objects`, `recommend_job_objects`).
"""
from __future__ import annotations

import random
from functools import lru_cache
from pathlib import Path
from typing import Iterable, List, Set, Tuple, Dict, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
TRAIN_XLSX = "training.xlsx"
PREDICT_XLSX = "prediction.xlsx"
TARGET_COL = "label_recommendable"
ID_COL = "firm_name"  # will not be used for training
MODEL_PATH = "model.joblib"

# ---------------------------------------------------------------------------
# MODEL TRAINING (only if needed)
# ---------------------------------------------------------------------------

def _train_and_save_model() -> None:
    if Path(MODEL_PATH).exists():
        return

    df = pd.read_excel(TRAIN_XLSX)
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in {TRAIN_XLSX}")

    y = df[TARGET_COL].astype(int)
    X = df.drop(columns=[TARGET_COL])

    cat_cols = [c for c in X.columns if X[c].dtype == "object" and c != ID_COL]
    num_cols = [c for c in X.columns if np.issubdtype(X[c].dtype, np.number)]
    feat_cols = [c for c in X.columns if c != ID_COL]
    X = X[feat_cols]

    preprocess = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", StandardScaler(), num_cols),
    ])

    pipe = Pipeline([
        ("prep", preprocess),
        ("model", LogisticRegression(max_iter=2000, class_weight="balanced", n_jobs=-1)),
    ])

    X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    pipe.fit(X_tr, y_tr)
    joblib.dump(pipe, MODEL_PATH)

    # quick one‑off report
    print("[job_rec] Validation\n", classification_report(y_val, pipe.predict(X_val)))

# ---------------------------------------------------------------------------
# CACHED ASSETS
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _load_model() -> Pipeline:
    if not Path(MODEL_PATH).exists():
        _train_and_save_model()
    return joblib.load(MODEL_PATH)

@lru_cache(maxsize=1)
def _pred_df() -> pd.DataFrame:
    return pd.read_excel(PREDICT_XLSX)

@lru_cache(maxsize=1)
def _ranked_scores() -> List[Tuple[str, float]]:
    pipe = _load_model()
    df = _pred_df()
    firm_names = df[ID_COL] if ID_COL in df.columns else pd.Series(range(len(df)), name="firm_id")
    X_pred = df.drop(columns=[ID_COL]) if ID_COL in df.columns else df
    scores = pipe.predict_proba(X_pred)[:, 1]
    return sorted(zip(firm_names, scores), key=lambda x: x[1], reverse=True)

# ---------------------------------------------------------------------------
# INTERNAL helpers
# ---------------------------------------------------------------------------

def _build_job_object(row: pd.Series | pd.DataFrame, score: float) -> Dict[str, Any]:
    """Map a dataframe *row* → UI job object.

    *If the index isn't unique (duplicate firm names) ``df.loc[fid]`` returns a
    DataFrame; we pick the **first** occurrence to avoid ambiguity.*
    """
    # Coerce DataFrame → first row
    if isinstance(row, pd.DataFrame):
        row = row.iloc[0]

    # fallback helpers
    def _get(key, default=None):
        return row[key] if key in row and pd.notna(row[key]) else default

    location = " , ".join([_get("city", ""), _get("country", "")]).strip(" ,")

    return {
        "name": _get("firm_name"),
        "position": _get("primary_position"),
        "industry": _get("industry"),
        "founded": _get("founded_year"),
        "size": str(_get("size_employees", "")),
        "rating": _get("rating_1to5"),
        "location": location or "Remote",
        "benefits": _get("benefits", []),
        "createdAt": _get("createdAt"),
        "description": _get("description", "No description provided."),
        "experience": _get("experience", []),
        "logo": _get("logo", "💼"),
        "posted": _get("posted", "recently"),
        "salary": _get("salary", "-"),
        "skills": _get("skills", []),
        "type": _get("type", "full-time"),
        "aiScore": round(score, 3),
    }

# ---------------------------------------------------------------------------
# PUBLIC API – basic ids
# ---------------------------------------------------------------------------

def recommend_jobs(n: int = 3, *, shown: Iterable[str] | None = None, randomize: bool = False) -> List[Tuple[str, float]]:
    shown_set: Set[str] = set(shown or [])
    remaining = [(fid, sc) for fid, sc in _ranked_scores() if fid not in shown_set]
    if randomize:
        random.shuffle(remaining)
    return remaining[:n]


def random_block_jobs(n: int = 3) -> List[Tuple[str, float]]:
    ranked = _ranked_scores()
    if len(ranked) <= n:
        return ranked
    start = random.randint(0, len(ranked) - n)
    return ranked[start:start + n]

# ---------------------------------------------------------------------------
# PUBLIC API – **job objects**
# ---------------------------------------------------------------------------

def recommend_job_objects(n: int = 3, *, shown: Iterable[str] | None = None, randomize: bool = False) -> List[Dict[str, Any]]:
    """Same as `recommend_jobs` but returns full job‑dicts ready for the UI."""
    picks = recommend_jobs(n=n, shown=shown, randomize=randomize)
    df = _pred_df().set_index(ID_COL)
    return [_build_job_object(df.loc[fid], score) for fid, score in picks]


def random_block_job_objects(n: int = 3) -> List[Dict[str, Any]]:
    picks = random_block_jobs(n)
    df = _pred_df().set_index(ID_COL)
    return [_build_job_object(df.loc[fid], score) for fid, score in picks]

# ---------------------------------------------------------------------------
# DEMO
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=== random_block_job_objects ===")
    for job in random_block_job_objects():
        print(job)

    print("\n=== recommend_job_objects (rand) ===")
    for job in recommend_job_objects(randomize=True):
        print(job)
