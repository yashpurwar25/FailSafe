import joblib
import pandas as pd
import numpy as np
import os
import sys
from .database import settings


class PredictionService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
            cls._instance.model = None
            cls._instance.explainer = None
            cls._instance.encoders = None
            cls._instance.feature_cols = None
        return cls._instance

    def load(self):
        if self._loaded:
            return
        try:
            print("Loading ML artifacts...")
            self.model = joblib.load(settings.ML_MODEL_PATH)
            self.explainer = joblib.load(settings.ML_EXPLAINER_PATH)
            self.encoders = joblib.load(settings.ML_ENCODERS_PATH)
            self.feature_cols = joblib.load(settings.ML_FEATURE_COLS_PATH)
            self._loaded = True
            print("ML artifacts loaded successfully.")
        except Exception as e:
            print(f"WARNING: ML models not found - {e}")
            print("Backend running without ML. Train models first.")
            self._loaded = False

    def predict(self, student_data: dict, student_name: str = "Student") -> dict:
        if not self._loaded:
            return {
                'risk_probability': 0.0,
                'is_at_risk': False,
                'risk_level': 'UNKNOWN',
                'shap_explanation': {},
                'intervention_plan': {
                    'summary': 'ML model not loaded. Please train the model first.',
                    'interventions': [],
                    'risk_level': 'UNKNOWN',
                    'risk_probability': 0.0
                }
            }

        try:
            df = pd.DataFrame([student_data])

            # Feature engineering
            df['grade_momentum'] = df['G2'] - df['G1']
            df['avg_grade'] = (df['G1'] + df['G2']) / 2
            df['grade_risk'] = 1 - (df['avg_grade'] / 20)
            df['parent_edu_avg'] = (df['Medu'] + df['Fedu']) / 2
            df['romantic_bin'] = (df['romantic'] == 'yes').astype(int)
            df['social_risk'] = df['Dalc'] + df['Walc'] + df['goout'] + df['romantic_bin']
            df['absence_risk'] = pd.cut(
                df['absences'], bins=[-1, 0, 5, 15, 999],
                labels=[0, 1, 2, 3]
            ).astype(int)
            df['study_efficiency'] = df['avg_grade'] / (df['studytime'] + 1)
            df['famsup_bin'] = (df['famsup'] == 'yes').astype(int)
            df['schoolsup_bin'] = (df['schoolsup'] == 'yes').astype(int)
            df['support_score'] = (
                df['famsup_bin'] + df['schoolsup_bin'] +
                df['paid'].apply(lambda x: 1 if x == 'yes' else 0)
            )
            df['has_failures'] = (df['failures'] > 0).astype(int)
            df['wants_higher'] = (df['higher'] == 'yes').astype(int)

            # Encode binary cols
            binary_cols = ['schoolsup', 'famsup', 'paid', 'activities',
                           'nursery', 'higher', 'internet', 'romantic']
            for col in binary_cols:
                if col in df.columns:
                    df[col] = (df[col] == 'yes').astype(int)

            # Encode nominal cols
            nominal_cols = ['school', 'sex', 'address', 'famsize', 'Pstatus',
                            'Mjob', 'Fjob', 'reason', 'guardian', 'subject']
            for col in nominal_cols:
                if col in df.columns and col in self.encoders:
                    le = self.encoders[col]
                    try:
                        df[col] = le.transform(df[col].astype(str))
                    except ValueError:
                        df[col] = 0

            # Drop unused cols
            drop_cols = ['G3', 'at_risk', 'romantic_bin', 'famsup_bin', 'schoolsup_bin']
            df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True)

            # Ensure all feature cols present
            for col in self.feature_cols:
                if col not in df.columns:
                    df[col] = 0

            X = df[self.feature_cols]

            risk_prob = float(self.model.predict_proba(X)[0][1])
            is_at_risk = risk_prob >= 0.5

            # SHAP explanation
            shap_values = self.explainer.shap_values(X)
            sv = shap_values[0] if len(shap_values.shape) == 2 else shap_values[0]

            contributions = []
            for feat, val in zip(self.feature_cols, sv):
                contributions.append({
                    'feature': feat,
                    'shap_value': round(float(val), 4),
                    'feature_value': float(X.iloc[0][feat]),
                    'direction': 'increases_risk' if val > 0 else 'decreases_risk'
                })
            contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)

            shap_exp = {
                'top_factors': contributions[:10],
                'base_value': round(float(self.explainer.expected_value), 4),
                'all_contributions': contributions
            }

            # Risk level
            if risk_prob >= 0.75:
                risk_level = 'CRITICAL'
                summary = f"{student_name} is in critical risk. Immediate intervention required."
            elif risk_prob >= 0.50:
                risk_level = 'HIGH'
                summary = f"{student_name} is at high risk. Targeted support recommended."
            elif risk_prob >= 0.30:
                risk_level = 'MODERATE'
                summary = f"{student_name} shows moderate risk. Preventive monitoring advised."
            else:
                risk_level = 'LOW'
                summary = f"{student_name} shows low risk. Regular check-ins sufficient."

            # Interventions
            intervention_map = {
                'absences': {'action': 'Attendance Alert', 'detail': 'High absenteeism detected. Weekly check-ins recommended.', 'priority': 'HIGH'},
                'G1': {'action': 'Early Grade Intervention', 'detail': 'Poor Period 1 grades. Academic counselling recommended.', 'priority': 'HIGH'},
                'G2': {'action': 'Mid-term Support', 'detail': 'Declining mid-term performance. Tutoring recommended.', 'priority': 'HIGH'},
                'grade_momentum': {'action': 'Grade Trend Alert', 'detail': 'Downward grade trajectory. Immediate review needed.', 'priority': 'HIGH'},
                'failures': {'action': 'Prior Failure Review', 'detail': 'History of failures. Personalised study plan needed.', 'priority': 'HIGH'},
                'social_risk': {'action': 'Behavioural Counselling', 'detail': 'High social risk indicators. Counselling referral advised.', 'priority': 'MEDIUM'},
                'studytime': {'action': 'Study Skills Workshop', 'detail': 'Low study time. Time management workshop recommended.', 'priority': 'MEDIUM'},
                'support_score': {'action': 'Support Resource Connection', 'detail': 'Lacks academic support. Connect with tutoring programs.', 'priority': 'MEDIUM'},
            }

            interventions = []
            seen = set()
            for factor in contributions[:10]:
                feat = factor['feature']
                if factor['shap_value'] > 0 and feat in intervention_map and feat not in seen:
                    interventions.append(intervention_map[feat])
                    seen.add(feat)

            return {
                'risk_probability': round(risk_prob, 4),
                'is_at_risk': is_at_risk,
                'risk_level': risk_level,
                'shap_explanation': shap_exp,
                'intervention_plan': {
                    'risk_level': risk_level,
                    'risk_probability': round(risk_prob, 4),
                    'summary': summary,
                    'interventions': interventions,
                    'student_name': student_name
                }
            }

        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                'risk_probability': 0.0,
                'is_at_risk': False,
                'risk_level': 'ERROR',
                'shap_explanation': {},
                'intervention_plan': {
                    'summary': f'Prediction failed: {str(e)}',
                    'interventions': [],
                    'risk_level': 'ERROR',
                    'risk_probability': 0.0
                }
            }


prediction_service = PredictionService()