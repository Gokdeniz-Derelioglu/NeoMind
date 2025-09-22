# job_recommendation_updated.py
from __future__ import annotations

import random
from pathlib import Path
from functools import lru_cache
from typing import Iterable, List, Set, Tuple

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
# MODEL TRAINING & SAVING (only invoked explicitly)
# ---------------------------------------------------------------------------

def _train_and_save_model(force: bool = False) -> None:
    """Train the logistic-regression pipeline and persist it to *MODEL_PATH*."""

    if Path(MODEL_PATH).exists() and not force:
        print("[job_rec] Existing model found – skipping training.")
        return

    print("[job_rec] Training new model …")
    df = pd.read_excel(TRAIN_XLSX)
    if TARGET_COL not in df.columns:
        raise ValueError(
            f"Target column '{TARGET_COL}' not found in {TRAIN_XLSX}")

    y = df[TARGET_COL].astype(int)
    X = df.drop(columns=[TARGET_COL])

    cat_cols = [c for c in X.columns if X[c].dtype == "object" and c != ID_COL]
    num_cols = [c for c in X.columns if np.issubdtype(X[c].dtype, np.number)]
    feat_cols = [c for c in X.columns if c != ID_COL]
    X = X[feat_cols]

    preprocess = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), [c for c in cat_cols if c in feat_cols]),
        ("num", StandardScaler(), [c for c in num_cols if c in feat_cols]),
    ])

    clf = LogisticRegression(max_iter=2000, class_weight="balanced", n_jobs=-1)
    pipe = Pipeline([("prep", preprocess), ("model", clf)])

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    pipe.fit(X_train, y_train)
    joblib.dump(pipe, MODEL_PATH)
    print(f"[job_rec] Model saved → {MODEL_PATH}")

    # quick validation (prints once)
    print("[job_rec] Validation\n", classification_report(y_val, pipe.predict(X_val)))

# ---------------------------------------------------------------------------
# CACHED HELPERS
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _load_model() -> Pipeline:
    if not Path(MODEL_PATH).exists():
        _train_and_save_model(force=True)
    return joblib.load(MODEL_PATH)

@lru_cache(maxsize=1)
def _score_jobs() -> List[Tuple[str, float]]:
    """Return ranked [(firm_name, score) …] highest-score-first."""
    pipe = _load_model()
    df_pred = pd.read_excel(PREDICT_XLSX)

    firm_names = (
        df_pred[ID_COL]
        if ID_COL in df_pred.columns else
        pd.Series(range(len(df_pred)), name="firm_id")
    )
    X_pred = df_pred.drop(columns=[ID_COL]) if ID_COL in df_pred.columns else df_pred
    scores = pipe.predict_proba(X_pred)[:, 1]

    return sorted(zip(firm_names, scores), key=lambda x: x[1], reverse=True)

# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def recommend_jobs(
    n: int = 3,
    shown: Iterable[str] | None = None,
    *,
    randomize: bool = False,
) -> List[Tuple[str, float]]:

    shown_set: Set[str] = set(shown or [])
    remaining = [(fid, sc) for fid, sc in _score_jobs() if fid not in shown_set]

    if randomize:
        random.shuffle(remaining)

    return remaining[:n]


def random_block_jobs(n: int = 3) -> List[Tuple[str, float]]:
    ranked = _score_jobs()
    if len(ranked) <= n:
        return ranked  # not enough jobs – just return all we have
    start = random.randint(0, len(ranked) - n)
    return ranked[start : start + n]

# ---------------------------------------------------------------------------
# CLI DEMO
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=== random_block_jobs (3) ===")
    for name, score in random_block_jobs():
        print(f"{name:<25} | {score:.3f}")

    print("\n=== recommend_jobs randomize=True (3) ===")
    for name, score in recommend_jobs(randomize=True):
        print(f"{name:<25} | {score:.3f}")
