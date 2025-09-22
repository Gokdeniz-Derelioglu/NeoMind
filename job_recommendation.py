from __future__ import annotations

import random, uuid, os
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Iterable, List, Set, Tuple

import joblib
import numpy as np
import pandas as pd
from pandas import Timestamp
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

firebase_admin = None  # will import later only if function is used

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
TRAIN_XLSX  = "training.xlsx"
PREDICT_XLSX = "prediction.xlsx"
TARGET_COL  = "label_recommendable"
ID_COL      = "firm_name"
MODEL_PATH  = "model.joblib"

# ---------------------------------------------------------------------------
# TRAIN & CACHE
# ---------------------------------------------------------------------------

def _train_and_save_model() -> None:
    if Path(MODEL_PATH).exists():
        return
    df = pd.read_excel(TRAIN_XLSX)
    if TARGET_COL not in df.columns:
        raise ValueError(f"Missing {TARGET_COL} in {TRAIN_XLSX}")

    y = df[TARGET_COL].astype(int)
    X = df.drop(columns=[TARGET_COL])
    cat_cols = [c for c in X.columns if X[c].dtype == "object" and c != ID_COL]
    num_cols = [c for c in X.columns if np.issubdtype(X[c].dtype, np.number)]
    X = X[[c for c in X.columns if c != ID_COL]]

    pipe = Pipeline([
        ("prep", ColumnTransformer([
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", StandardScaler(), num_cols),
        ])),
        ("model", LogisticRegression(max_iter=2000, class_weight="balanced", n_jobs=-1)),
    ])

    X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    pipe.fit(X_tr, y_tr)
    joblib.dump(pipe, MODEL_PATH)
    print("[job_rec] validation\n", classification_report(y_val, pipe.predict(X_val)))

@lru_cache(maxsize=1)
def _load_model():
    if not Path(MODEL_PATH).exists():
        _train_and_save_model()
    return joblib.load(MODEL_PATH)

@lru_cache(maxsize=1)
def _pred_df() -> pd.DataFrame:
    return pd.read_excel(PREDICT_XLSX)

@lru_cache(maxsize=1)
def _ranked_scores() -> List[Tuple[str, float]]:
    pipe = _load_model()
    df  = _pred_df()
    names = df[ID_COL] if ID_COL in df.columns else pd.Series(range(len(df)))
    Xp = df.drop(columns=[ID_COL]) if ID_COL in df.columns else df
    scores = pipe.predict_proba(Xp)[:, 1]
    return sorted(zip(names, scores), key=lambda x: x[1], reverse=True)

# ---------------------------------------------------------------------------
# JS/TS‑friendly job‑object builder
# ---------------------------------------------------------------------------

def _to_list(value: Any) -> List[str]:
    if isinstance(value, str):
        try:
            parsed = eval(value)
            return list(parsed) if isinstance(parsed, (list, tuple)) else [value]
        except Exception:
            return [value]
    if isinstance(value, (list, tuple, set)):
        return list(value)
    return [] if pd.isna(value) else [str(value)]

# pools for random fallback values
_benefits_pool   = [["Health insurance", "Remote work"], ["Stock options", "Flexible hours"], ["Gym membership", "Learning budget"]]
_description_pool = [
    "Build amazing web interfaces", "Design intuitive mobile experiences",
    "Scale distributed backend systems", "Craft delightful user journeys",
]
_logo_pool   = ["💻", "🚀", "📱", "🛠", "🌐"]
_salary_pool = ["$60k-$80k", "$70k-$90k", "$80k-$100k"]
_size_pool   = ["10-50", "50-100", "100-200", "200-500"]
_type_pool   = ["full-time", "part-time", "contract"]
_posted_pool = ["today", "1 day ago", "2 days ago", "last week"]


def _fill_missing(job: Dict[str, Any]) -> Dict[str, Any]:
    """Mutate *job* in‑place, filling any missing/empty fields with randoms."""
    if not job.get("benefits"):
        job["benefits"] = random.choice(_benefits_pool)
    if not job.get("description"):
        job["description"] = random.choice(_description_pool)
    if not job.get("logo"):
        job["logo"] = random.choice(_logo_pool)
    if not job.get("salary"):
        job["salary"] = random.choice(_salary_pool)
    if not job.get("size") or job["size"] == "-":
        job["size"] = random.choice(_size_pool)
    if not job.get("type"):
        job["type"] = random.choice(_type_pool)
    if not job.get("posted"):
        job["posted"] = random.choice(_posted_pool)
    if not job.get("createdAt"):
        job["createdAt"] = datetime.utcnow() - timedelta(days=random.randint(0, 30))
    if not job.get("experience"):
        job["experience"] = [2, 5]
    if not job.get("skills"):
        job["skills"] = ["React", "TypeScript", "CSS"]
    if not job.get("rating"):
        job["rating"] = random.randint(3, 5)
    return job


def _build_job_object(row: pd.Series | pd.DataFrame, score: float) -> Dict[str, Any]:
    # duplicates → first row
    if isinstance(row, pd.DataFrame):
        row = row.iloc[0]

    def _get(k: str, default: Any = None):
        return row[k] if k in row and pd.notna(row[k]) else default

    job: Dict[str, Any] = {
        "id"        : str(uuid.uuid4()),
        "company"   : _get("firm_name", "Unknown Co"),
        "name"      : _get("primary_position", "Engineer"),
        "logo"      : _get("logo"),
        "industry"  : _get("industry", "Software"),
        "size"      : str(_get("size", _get("size_employees", "-"))),
        "location"  : _get("location", "Remote"),
        "rating"    : _get("rating"),
        "founded"   : int(_get("founded", _get("founded_year", 2000))),
        "position"  : _get("primary_position", "Engineer"),
        "salary"    : _get("salary"),
        "type"      : _get("type"),
        "experience": [int(x) for x in _to_list(_get("experience"))[:2]],
        "skills"    : _to_list(_get("skills")),
        "description": _get("description"),
        "benefits"  : _to_list(_get("benefits")),
        "posted"    : _get("posted"),
        "createdAt" : _get("createdAt"),
        "aiScore"   : round(score, 3),
    }

    return _fill_missing(job)

# ---------------------------------------------------------------------------
# PUBLIC PICKERS
# ---------------------------------------------------------------------------

def recommend_job_objects(n: int = 3, *, shown: Iterable[str] | None = None, randomize: bool = False) -> List[Dict[str, Any]]:
    shown_set: Set[str] = set(shown or [])
    remaining = [(fid, sc) for fid, sc in _ranked_scores() if fid not in shown_set]
    if randomize:
        random.shuffle(remaining)
    df = _pred_df().set_index(ID_COL)
    return [_build_job_object(df.loc[fid], sc) for fid, sc in remaining[:n]]


def random_block_job_objects(n: int = 3) -> List[Dict[str, Any]]:
    ranked = _ranked_scores()
    if len(ranked) <= n:
        picks = ranked
    else:
        picks = random.choice([ranked[i:i+n] for i in range(len(ranked)-n)])
    df = _pred_df().set_index(ID_COL)
    return [_build_job_object(df.loc[fid], sc) for fid, sc in picks]

# ---------------------------------------------------------------------------
# FIRESTORE PUSH
# ---------------------------------------------------------------------------

def _init_firestore():
    global firebase_admin
    if firebase_admin is not None:
        return firebase_admin.firestore.client()
    try:
        import firebase_admin as fb
        from firebase_admin import credentials, firestore
    except ImportError as e:
        raise RuntimeError("firebase_admin not installed. pip install firebase-admin") from e

    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccount.json")
    if not Path(cred_path).exists():
        raise FileNotFoundError(f"Service account key not found at {cred_path}")

    fb.initialize_app(credentials.Certificate(cred_path))
    firebase_admin = fb
    return firestore.client()


def push_job_recommendations(uid: str, n: int = 3, *, use_block: bool = False) -> List[Dict[str, Any]]:

    jobs = random_block_job_objects(n) if use_block else recommend_job_objects(n, randomize=True)

    db = _init_firestore()
    batch = db.batch()
    coll_ref = db.collection("users").document(uid).collection("recommendation")

    for job in jobs:
        batch.set(coll_ref.document(job["id"]), job)
    batch.commit()
    print(f"[job_rec] pushed {len(jobs)} jobs to users/{uid}/recommendation")
    return jobs

# ---------------------------------------------------------------------------
# DEMO (push skipped unless FIRESTORE env is set)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    sample_uid = "demoUser123"
    recs = recommend_job_objects()
    print("Sample recommendations\n", recs)

    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        push_job_recommendations(sample_uid, n=3)
