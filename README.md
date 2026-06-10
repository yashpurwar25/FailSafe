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
   Setup Machine Learning Model

   git clone https://github.com/your-username/failsafe.git
   cd failsafe
# 🎓 Student Risk Prediction & Explainability System

An AI-powered student risk prediction platform that identifies students who may be at academic risk and provides interpretable explanations for predictions using machine learning and explainable AI techniques.

---

## 🚀 Features

* 📊 Student risk prediction using Machine Learning
* 🔍 Explainable AI for transparent decision-making
* ⚡ FastAPI backend for scalable APIs
* 🎨 Modern frontend interface
* 🗄️ Database integration for student records
* 📈 Performance monitoring and evaluation metrics

---

## 🏗️ Project Structure

```text
project-root/
│
├── ml/                 # Machine Learning module
│   ├── src/
│   │   ├── train.py
│   │   └── explain.py
│   └── requirements.txt
│
├── backend/            # FastAPI backend
│   ├── app/
│   ├── .env
│   └── requirements.txt
│
├── frontend/           # Frontend application
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Setup Machine Learning Module

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate environment

# Linux / MacOS
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train model
python src/train.py

# Generate model explanations
python src/explain.py
```

---

## 2. Setup Backend

```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate environment

# Linux / MacOS
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

### Run Backend Server

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

---

## 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# 📊 Model Performance

The system was evaluated on a combined dataset of **1,044 students**.

| Metric                      | Score    |
| --------------------------- | -------- |
| ROC-AUC                     | 0.93     |
| F1-Score (At-Risk Students) | 0.85     |
| Inference Latency           | < 200 ms |

### Performance Highlights

* High discrimination capability with ROC-AUC of **0.93**
* Strong at-risk student detection performance
* Low-latency predictions suitable for real-time deployment

---

# 🧠 Machine Learning Pipeline

1. Data Collection & Preprocessing
2. Feature Engineering
3. Model Training
4. Risk Prediction
5. Explainability Analysis
6. API Deployment
7. Frontend Visualization

---

# 🔒 Security

* Environment-based configuration
* Secret key protection
* Secure database connection management
* API-ready authentication support

---

# 📄 License

Distributed under the **MIT License**.

See the `LICENSE` file for more information.

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# ✉️ Contact

**Your Name**

* Email: yashpurwar244@gmail.com
* LinkedIn: https://www.linkedin.com/in/yash-purwar-b65b93390/?skipRedirect=true

For questions, suggestions, or collaboration opportunities, feel free to reach out.
