from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .predict import prediction_service
from .routers import auth, students, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FAILSAFE API",
    description="At-Risk Student Early Warning System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This allows ALL domains to access your API. 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    prediction_service.load()

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(dashboard.router)

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": prediction_service._loaded}