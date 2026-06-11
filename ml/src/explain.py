import shap
import numpy as np
import pandas as pd
import joblib
import json
import matplotlib.pyplot as plt
import matplotlib
from pathlib import Path
import os

matplotlib.use('Agg')
SCRIPT_DIR = Path(__file__).resolve().parent 
BASE_DIR = SCRIPT_DIR.parent 

MODEL_DIR = BASE_DIR / "models"
DATA_MAT_PATH = BASE_DIR / "data" / "raw" / "student-mat.csv"
DATA_POR_PATH = BASE_DIR / "data" / "raw" / "student-por.csv"

def load_artifacts(model_dir: Path):
    model = joblib.load(model_dir / 'xgboost_model.pkl')
    encoders = joblib.load(model_dir / 'encoders.pkl')
    feature_cols = joblib.load(model_dir / 'feature_cols.pkl')
    return model, encoders, feature_cols


def build_explainer(model, X_background):
    X_background = X_background.astype(float)
    explainer = shap.TreeExplainer(model, X_background)
    return explainer


def explain_single_student(explainer, student_row: pd.DataFrame, feature_cols: list) -> dict:
    student_row = student_row.astype(float)
    shap_values = explainer.shap_values(student_row)

    sv = shap_values[0] if len(shap_values.shape) == 2 else shap_values

    contributions = []
    for i, feat in enumerate(feature_cols):
        val = sv[i]
        contributions.append({
            'feature': feat,
            'shap_value': round(float(val), 4),
            'feature_value': float(student_row.iloc[0][feat]),
            'direction': 'increases_risk' if val > 0 else 'decreases_risk'
        })

    contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)

    return {
        'top_factors': contributions[:10],
        'base_value': round(float(explainer.expected_value), 4),
        'all_contributions': contributions
    }


def generate_intervention(shap_explanation: dict, risk_prob: float, student_name: str = "Student") -> dict:
    interventions = []
    top = shap_explanation['top_factors']

    intervention_map = {
        'absences': {'action': 'Attendance Alert', 'detail': 'High absenteeism. Recommend weekly check-ins.', 'priority': 'HIGH'},
        'G1': {'action': 'Early Grade Intervention', 'detail': 'Poor P1 grades. Recommend remedial sessions.', 'priority': 'HIGH'},
        'G2': {'action': 'Mid-term Academic Support', 'detail': 'Declining mid-term performance. Recommend tutoring.', 'priority': 'HIGH'},
        'grade_momentum': {'action': 'Grade Trend Alert', 'detail': 'Downward trajectory. Immediate review recommended.', 'priority': 'HIGH'},
        'failures': {'action': 'Prior Failure Review', 'detail': 'History of failures. Recommend personalised study plan.', 'priority': 'HIGH'},
        'social_risk': {'action': 'Social-Behavioural Counselling', 'detail': 'High social risk (alcohol/outings). Recommend counselling.', 'priority': 'MEDIUM'},
        'studytime': {'action': 'Study Habit Workshop', 'detail': 'Low study time. Enroll in time-management workshop.', 'priority': 'MEDIUM'},
        'support_score': {'action': 'Support Resource Connection', 'detail': 'Lacks academic support. Connect with tutoring.', 'priority': 'MEDIUM'},
        'higher': {'action': 'Motivation & Career Counselling', 'detail': 'No higher edu aspiration. Motivational counselling recommended.', 'priority': 'LOW'},
        'parent_edu_avg': {'action': 'Family Engagement Program', 'detail': 'Low parental edu background. Enroll family in workshops.', 'priority': 'LOW'}
    }

    triggered = set()
    for factor in top:
        feat = factor['feature']
        if factor['shap_value'] > 0 and feat in intervention_map and feat not in triggered:
            interventions.append(intervention_map[feat])
            triggered.add(feat)

    if risk_prob >= 0.75:
        risk_level, summary = 'CRITICAL', f"{student_name} is in critical risk. Immediate intervention required."
    elif risk_prob >= 0.50:
        risk_level, summary = 'HIGH', f"{student_name} is at high risk. Targeted support recommended."
    elif risk_prob >= 0.30:
        risk_level, summary = 'MODERATE', f"{student_name} shows moderate risk. Preventive monitoring advised."
    else:
        risk_level, summary = 'LOW', f"{student_name} shows low risk. Regular check-ins sufficient."

    return {
        'risk_level': risk_level,
        'risk_probability': round(float(risk_prob), 4),
        'summary': summary,
        'interventions': interventions,
        'student_name': student_name
    }


def save_global_shap_plot(explainer, X_test, feature_cols, out_path: Path):
    X_test_numeric = X_test.astype(float)
    shap_values = explainer.shap_values(X_test_numeric)
    
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test_numeric, feature_names=feature_cols,
                      show=False, max_display=20)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"SHAP summary plot saved to {out_path}")


if __name__ == '__main__':
    from preprocess import get_processed_data
    print("[1/4] Loading model and artifacts...")
    model, encoders, feature_cols = load_artifacts(MODEL_DIR)

    print("[2/4] Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, _, _ = get_processed_data(
        str(DATA_MAT_PATH), str(DATA_POR_PATH)
    )
    X_train = X_train.astype(float)
    X_test = X_test.astype(float)

    print("[3/4] Building SHAP explainer...")
    explainer = build_explainer(model, X_train.sample(100, random_state=42))
    joblib.dump(explainer, MODEL_DIR / 'shap_explainer.pkl')
   
    print("[4/4] Generating global SHAP plot...")
    save_global_shap_plot(explainer, X_test, feature_cols, MODEL_DIR / 'shap_summary.png')

    row = X_test.iloc[[0]]
    risk_prob = model.predict_proba(row)[0][1]
    explanation = explain_single_student(explainer, row, feature_cols)
    plan = generate_intervention(explanation, risk_prob, "Demo Student")
    
    print("\n" + "="*30)
    print("DEMO STUDENT ANALYSIS")
    print("="*30)
    print(json.dumps(plan, indent=2))
