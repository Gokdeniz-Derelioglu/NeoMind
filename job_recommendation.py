import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score, average_precision_score, f1_score,
    precision_recall_fscore_support, classification_report
)
from sklearn.utils.class_weight import compute_class_weight
import joblib

TRAIN_XLSX = "training.xlsx"
PREDICT_XLSX = "prediction.xlsx"
TARGET_COL = "label_recommendable"
ID_COL = "firm_name" #Will not be used for training
MODEL_PATH = "model.joblib"


#Dataframe initialization
df = pd.read_excel(TRAIN_XLSX)

if TARGET_COL not in df.columns:
    raise ValueError(f"Target column '{TARGET_COL}' not found in {TRAIN_XLSX}")

# Seperate the target and training columns
y = df[TARGET_COL].astype(int)
X = df.drop(columns=[TARGET_COL]) 

# Seperate numerical and qualitative columns
cat_cols = [c for c in X.columns if X[c].dtype == "object" and c != ID_COL]
num_cols = [c for c in X.columns if np.issubdtype(X[c].dtype, np.number)]

# ID column removed 
feat_cols = [c for c in X.columns if c != ID_COL]
X = X[feat_cols]

preprocess = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), [c for c in cat_cols if c in feat_cols]),
         ("num", StandardScaler(), [c for c in num_cols if c in feat_cols]),
    ],
    remainder="drop",
)

clf = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    n_jobs=None if "n_jobs" not in LogisticRegression().get_params() else -1
)

pipe = Pipeline(steps=[
    ("prep", preprocess),
    ("model", clf),
])

# Training is done here
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipe.fit(X_train, y_train)

joblib.dump(pipe, MODEL_PATH)

# Evaluation
df_pred = pd.read_excel(PREDICT_XLSX)

firm_names = df_pred[ID_COL] if ID_COL in df_pred.columns else pd.Series(range(len(df_pred)), name="firm_id")

X_pred = df_pred.drop(columns=[ID_COL]) if ID_COL in df_pred.columns else df_pred

scores = pipe.predict_proba(X_pred)[:, 1]

labels = (scores >= 0.5).astype(int)

results = sorted(zip(firm_names, scores, labels), key=lambda x: x[1], reverse=True)

print("\n=== Recommendation Scores ===")
for name, score, label in results:
    decision = "Recommend" if label == 1 else "Do NOT Recommend"
    print(f"{name:<25} | Score: {score:.3f} | Decision: {decision}")






