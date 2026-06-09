from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models
from ..auth import verify_password, get_password_hash, create_access_token, get_current_faculty
from ..database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    department: str = ""
    role: str = "faculty"

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.Faculty).filter(models.Faculty.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    faculty = models.Faculty(
        email=req.email,
        name=req.name,
        hashed_password=get_password_hash(req.password),
        department=req.department,
        role=req.role
    )
    db.add(faculty); db.commit(); db.refresh(faculty)
    return {"message": "Registered successfully", "id": faculty.id}

@router.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    faculty = db.query(models.Faculty).filter(models.Faculty.email == form.username).first()
    if not faculty or not verify_password(form.password, faculty.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": faculty.email, "role": faculty.role})
    return {"access_token": token, "token_type": "bearer", "role": faculty.role, "name": faculty.name}

@router.get("/me")
def me(current=Depends(get_current_faculty)):
    return {"id": current.id, "name": current.name, "email": current.email, "role": current.role}