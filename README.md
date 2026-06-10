🛡️ FAILSAFE — At-Risk Student Early Warning System
![alt text](https://img.shields.io/badge/Deployment-Vercel%20%2F%20Render-blue)

![alt text](https://img.shields.io/badge/License-MIT-yellow.svg)

![alt text](https://img.shields.io/badge/Python-3.11+-blue)

![alt text](https://img.shields.io/badge/React-18+-61DAFB)
FAILSAFE is an industry-grade predictive analytics platform that enables educators to identify students at risk of academic failure early in the term. Unlike traditional "black-box" ML models, FAILSAFE leverages Explainable AI (XAI) to provide precise reasons for every risk prediction, allowing for targeted, personalized interventions.
🚀 Live Demo: https://fail-safe-gray.vercel.app/
🌟 Key Features
🧠 Predictive Intelligence
High-Accuracy Classification: Powered by an XGBoost model optimized via Optuna Bayesian search.
Early Detection: Analyzes early grades (G1, G2), absenteeism, and socio-economic factors to predict final outcomes.
Imbalance Handling: Utilizes SMOTE to ensure the model is highly sensitive to "at-risk" students (high recall).
🔍 Explainable AI (XAI)
SHAP Integration: Every prediction is decomposed using SHAP values, showing exactly which features (e.g., alcohol consumption, study time) increased or decreased the risk.
Automated Intervention Plans: Generates a customized academic and behavioral support plan based on the top risk drivers for each student.
📊 Faculty Management Dashboard
Risk Analytics: Visualizes overall class risk distribution and trend analysis using interactive charts.
Student Lifecycle Management: Full CRUD capabilities to add, track, and delete student records.
Secure Access: JWT-based authentication system with a dedicated registration and login workflow.
🛠️ Technical Stack
Layer	Technology	Purpose
Frontend	React, Tailwind CSS, Recharts	Interactive UI & Data Visualization
Backend	FastAPI, Pydantic	High-performance Asynchronous API
Database	PostgreSQL, SQLAlchemy	Relational Data Storage & Management
Machine Learning	XGBoost, Scikit-Learn, Optuna	Predictive Modeling & HPO
Explainability	SHAP	Model Interpretability (XAI)
DevOps	Docker, Vercel, Render	Containerization & Cloud Deployment
⚙️ System Architecture
ML Pipeline
Data Cleaning 
→
→
 Feature Engineering 
→
→
 SMOTE Resampling 
→
→
 Optuna Tuning 
→
→
 XGBoost Training 
→
→
 SHAP Explainer
Backend Flow
Client Request 
→
→
 JWT Middleware 
→
→
 FastAPI Router 
→
→
 PredictionService (Singleton) 
→
→
 PostgreSQL 
→
→
 JSON Response
🚀 Getting Started
Prerequisites
Python 3.11+
Node.js 18+
PostgreSQL 15+
Installation
1. Setup Machine Learning Model
code
Bash
cd ml
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/train.py
python src/explain.py
2. Setup Backend
code
Bash
cd ../backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create .env file with DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload
3. Setup Frontend
code
Bash
cd ../frontend
npm install
npm run dev
📈 Project Performance
The system was evaluated on a combined dataset of 1,044 students with the following results:
ROC-AUC: 0.93
F1-Score (At-Risk): 0.85
Inference Latency: < 200ms
📄 License
Distributed under the MIT License. See LICENSE for more information.
✉️ Contact
[Your Name]
📧 [Your Email]
🔗 [Your LinkedIn Profile Link]
