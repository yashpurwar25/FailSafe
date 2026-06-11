import os
import numpy as np
import joblib
import optuna
import xgboost as xgb
import pandas as pd
from pathlib import Path
from sklearn.metrics import (
    f1_score, roc_auc_score, classification_report,
    precision_recall_curve, average_precision_score
)
from sklearn.utils.class_weight import compute_sample_weight
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split

from preprocess import get_processed_data

import warnings
warnings.filterwarnings('ignore')

optuna.logging.set_verbosity(optuna.logging.WARNING)

SCRIPT_DIR = Path(__file__).resolve().parent 
BASE_DIR = SCRIPT_DIR.parent 

DATA_MAT_PATH = BASE_DIR / "data" / "raw" / "student-mat.csv"
DATA_POR_PATH = BASE_DIR / "data" / "raw" / "student-por.csv"
MODEL_SAVE_DIR = BASE_DIR / "models"

MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)

def objective(trial, X_train, y_train, X_val, y_val):
    params = {
        'n_estimators':       trial.suggest_int('n_estimators', 200, 1000),
        'max_depth':          trial.suggest_int('max_depth', 3, 9),
        'learning_rate':      trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'subsample':          trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree':   trial.suggest_float('colsample_bytree', 0.5, 1.0),
        'min_child_weight':   trial.suggest_int('min_child_weight', 1, 10),
        'reg_alpha':          trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda':         trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
        'gamma':              trial.suggest_float('gamma', 0, 5),
        'scale_pos_weight':   trial.suggest_float('scale_pos_weight', 1.0, 5.0),
        'use_label_encoder':  False,
        'eval_metric':        'logloss',
        'random_state':       42,
        'tree_method':        'hist',
        'early_stopping_rounds': 50 
    }
    
    model = xgb.XGBClassifier(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    
    preds = model.predict(X_val)
    return f1_score(y_val, preds)


def train_with_smote(X_train, y_train):
    smote = SMOTE(random_state=42, k_neighbors=5)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    print(f"After SMOTE — Total samples: {X_res.shape[0]}, "
          f"At-risk: {y_res.sum()} ({y_res.mean():.1%})")
    return X_res, y_res


def run_hpo(X_train, y_train, n_trials: int = 100):
    X_tr, X_val, y_tr, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
    )

    study = optuna.create_study(direction='maximize')
    study.optimize(
        lambda trial: objective(trial, X_tr, y_tr, X_val, y_val),
        n_trials=n_trials,
        show_progress_bar=True
    )

    print(f"\nBest F1: {study.best_value:.4f}")
    print(f"Best params: {study.best_params}")
    return study.best_params


def train_final_model(X_train, y_train, best_params):
    X_res, y_res = train_with_smote(X_train, y_train)

    final_params = best_params.copy()
    if 'early_stopping_rounds' in final_params:
        del final_params['early_stopping_rounds']

    model = xgb.XGBClassifier(
        **final_params,
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42,
        tree_method='hist'
    )
    model.fit(X_res, y_res, verbose=False)
    return model


def evaluate_model(model, X_test, y_test, feature_cols):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\n" + "="*60)
    print("MODEL EVALUATION REPORT")
    print("="*60)
    print(classification_report(y_test, y_pred, target_names=['Passing', 'At-Risk']))
    print(f"ROC-AUC:          {roc_auc_score(y_test, y_prob):.4f}")
    print(f"Avg Precision:    {average_precision_score(y_test, y_prob):.4f}")
    print(f"F1 (macro):       {f1_score(y_test, y_pred, average='macro'):.4f}")
    print("="*60)

    fi = pd.Series(model.feature_importances_, index=feature_cols)
    print("\nTop 15 Feature Importances:")
    print(fi.nlargest(15).to_string())

    return y_pred, y_prob


def main():
    print("\n[0/3] Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, encoders, feature_cols = get_processed_data(
        str(DATA_MAT_PATH),
        str(DATA_POR_PATH),
        save_dir=str(MODEL_SAVE_DIR)
    )
    X_test = X_test.astype(float)
    print("\n[1/3] Running Optuna hyperparameter optimisation (100 trials)...")
    best_params = run_hpo(X_train, y_train, n_trials=100)

    print("\n[2/3] Training final model on full training set...")
    model = train_final_model(X_train, y_train, best_params)

    print("\n[3/3] Evaluating on test set...")
    evaluate_model(model, X_test, y_test, feature_cols)

    model_path = MODEL_SAVE_DIR / "xgboost_model.pkl"
    params_path = MODEL_SAVE_DIR / "best_params.pkl"
    
    joblib.dump(model, model_path)
    joblib.dump(best_params, params_path)
    
    print(f"\n Success! Model saved to: {model_path}")
    print(f" Params saved to: {params_path}")


if __name__ == '__main__':
    main()
