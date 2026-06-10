# 🛡️ FAILSAFE — At-Risk Student Early Warning System

[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2F%20Render-blue)](https://fail-safe-gray.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)

**FAILSAFE** is an industry-grade predictive analytics platform that enables educators to identify students at risk of academic failure early in the term. Unlike traditional "black-box" ML models, FAILSAFE leverages **Explainable AI (XAI)** to provide precise reasons for every risk prediction, allowing for targeted, personalized interventions.

🚀 **Live Demo:** [https://fail-safe-gray.vercel.app/](https://fail-safe-gray.vercel.app/)

---

## 🌟 Key Features

### 🧠 Predictive Intelligence
- **High-Accuracy Classification:** Powered by an XGBoost model optimized via Optuna Bayesian search.
- **Early Detection:** Analyzes early grades (G1, G2), absenteeism, and socio-economic factors to predict final outcomes.
- **Imbalance Handling:** Utilizes SMOTE to ensure the model is highly sensitive to "at-risk" students (high recall).

### 🔍 Explainable AI (XAI)
- **SHAP Integration:** Every prediction is decomposed using SHAP values, showing exactly which features (e.g., alcohol consumption, study time) increased or decreased the risk.
- **Automated Intervention Plans:** Generates a customized academic and behavioral support plan based on the top risk drivers for each student.

### 📊 Faculty Management Dashboard
- **Risk Analytics:** Visualizes overall class risk distribution and trend analysis using interactive charts.
- **Student Lifecycle Management:** Full CRUD capabilities to add, track, and delete student records.
- **Secure Access:** JWT-based authentication system with a dedicated registration and login workflow.

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind CSS, Recharts | Interactive UI & Data Visualization |
| **Backend** | FastAPI, Pydantic | High-performance Asynchronous API |
| **Database** | PostgreSQL, SQLAlchemy | Relational Data Storage & Management |
| **Machine Learning**| XGBoost, Scikit-Learn, Optuna | Predictive Modeling & HPO |
| **Explainability** | SHAP | Model Interpretability (XAI) |
| **DevOps** | Docker, Vercel, Render | Containerization & Cloud Deployment |

---

## ⚙️ System Architecture

### ML Pipeline
`Data Cleaning` $\rightarrow$ `Feature Engineering` $\rightarrow$ `SMOTE Resampling` $\rightarrow$ `Optuna Tuning` $\rightarrow$ `XGBoost Training` $\rightarrow$ `SHAP Explainer`

### Backend Flow
`Client Request` $\rightarrow$ `JWT Middleware` $\rightarrow$ `FastAPI Router` $\rightarrow$ `PredictionService (Singleton)` $\rightarrow$ `PostgreSQL` $\rightarrow$ `JSON Response`

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/failsafe.git
   cd failsafe
