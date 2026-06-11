import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from pathlib import Path
SCRIPT_DIR = Path(__file__).resolve().parent 
BASE_DIR = SCRIPT_DIR.parent 

DATA_MAT_PATH = BASE_DIR / "data" / "raw" / "student-mat.csv"
DATA_POR_PATH = BASE_DIR / "data" / "raw" / "student-por.csv"
MODEL_SAVE_DIR = BASE_DIR / "models"

BINARY_COLS = ['schoolsup', 'famsup', 'paid', 'activities', 'nursery', 'higher', 'internet', 'romantic']
ORDINAL_COLS = ['Medu', 'Fedu', 'traveltime', 'studytime', 'famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health']
NOMINAL_COLS = ['school', 'sex', 'address', 'famsize', 'Pstatus', 'Mjob', 'Fjob', 'reason', 'guardian']
NUMERIC_COLS = ['age', 'absences', 'G1', 'G2']
TARGET = 'at_risk'

def load_and_merge(mat_path: str, por_path: str) -> pd.DataFrame:
    mat = pd.read_csv(mat_path, sep=None, engine='python')
    mat['subject'] = 'math'
    
    por = pd.read_csv(por_path, sep=None, engine='python')
    por['subject'] = 'portuguese'
    df = pd.concat([mat, por], ignore_index=True)
    if df.shape[1] < 10:
        raise ValueError(f"Data loading failed! The file at {mat_path} "
                         f"was not parsed correctly. It has only {df.shape[1]} columns. "
                         "Check if the file is a valid CSV.")
                         
    print(f"Dataset: {df.shape[0]} students, {df.shape[1]} features")
    return df

def create_target(df: pd.DataFrame, threshold: int = 10) -> pd.DataFrame:
    df = df.copy()
    df[TARGET] = (df['G3'] < threshold).astype(int)
    at_risk_pct = df[TARGET].mean() * 100
    print(f"At-risk students: {at_risk_pct:.1f}% of dataset")
    return df

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df[NUMERIC_COLS] = df[NUMERIC_COLS].fillna(0)
    df['grade_momentum'] = df['G2'] - df['G1']
    df['avg_grade'] = (df['G1'] + df['G2']) / 2
    df['grade_risk'] = 1 - (df['avg_grade'] / 20)
    df['parent_edu_avg'] = (df['Medu'] + df['Fedu']) / 2
    df['romantic_bin'] = (df['romantic'] == 'yes').astype(int)
    df['social_risk'] = df['Dalc'] + df['Walc'] + df['goout'] + df['romantic_bin']
    df['absence_risk'] = pd.cut(
        df['absences'].fillna(0), 
        bins=[-1, 0, 5, 15, 999],
        labels=[0, 1, 2, 3]
    ).astype(int)
    df['study_efficiency'] = df['avg_grade'] / (df['studytime'] + 1)
    df['famsup_bin'] = (df['famsup'] == 'yes').astype(int)
    df['schoolsup_bin'] = (df['schoolsup'] == 'yes').astype(int)
    df['support_score'] = df['famsup_bin'] + df['schoolsup_bin'] + df['paid'].apply(lambda x: 1 if x == 'yes' else 0)

    df['has_failures'] = (df['failures'] > 0).astype(int)
    df['wants_higher'] = (df['higher'] == 'yes').astype(int)

    return df

def encode_features(df: pd.DataFrame):
    df = df.copy()

    for col in BINARY_COLS + ['romantic']:
        if col in df.columns:
            df[col] = (df[col] == 'yes').astype(int)

    encoders = {}
    for col in NOMINAL_COLS + ['subject']:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le

    drop_cols = ['G3', 'romantic_bin', 'famsup_bin', 'schoolsup_bin']
    df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True)

    feature_cols = [c for c in df.columns if c != TARGET]
    X = df[feature_cols]
    y = df[TARGET]

    return X, y, encoders, feature_cols

def get_processed_data(mat_path: str, por_path: str, save_dir: str = None):
    df = load_and_merge(mat_path, por_path)
    df = create_target(df)
    df = feature_engineering(df)
    X, y, encoders, feature_cols = encode_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTrain: {X_train.shape}, Test: {X_test.shape}")
    print(f"Class balance — Train at-risk: {y_train.mean():.2%}")

    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump(encoders, os.path.join(save_dir, "encoders.pkl"))
        joblib.dump(feature_cols, os.path.join(save_dir, "feature_cols.pkl"))
        print(f"Saved encoders to {save_dir}/")

    return X_train, X_test, y_train, y_test, encoders, feature_cols

if __name__ == '__main__':
    X_train, X_test, y_train, y_test, encoders, feature_cols = get_processed_data(
        str(DATA_MAT_PATH),
        str(DATA_POR_PATH),
        save_dir=str(MODEL_SAVE_DIR)
    )
    print("\nTop features:", list(X_train.columns[:10]))
