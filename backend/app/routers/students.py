from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from .. import models
from ..auth import get_current_faculty
from ..database import get_db
from ..predict import prediction_service

router = APIRouter(prefix="/api/students", tags=["students"])

VALID_SCHOOLS = ['GP', 'MS']
def normalize_school(school: str) -> str:
    val = school.strip().upper()
    if val == 'GP' or 'GABRIEL' in val or 'PEREIRA' in val:
        return 'GP'
    if val == 'MS' or 'MOUSINHO' in val or 'SILVEIRA' in val:
        return 'MS'
    # Consistent hash-based fallback
    total = sum(ord(c) for c in school)
    return 'GP' if total % 2 == 0 else 'MS'

class StudentCreate(BaseModel):
    name: str
    student_id: str
    subject: str = "math"
    school: str = "GP"
    sex: str = "M"
    age: int = 17
    address: str = "U"
    famsize: str = "GT3"
    Pstatus: str = "T"
    Medu: int = 2; Fedu: int = 2
    Mjob: str = "other"; Fjob: str = "other"
    reason: str = "course"; guardian: str = "mother"
    traveltime: int = 1; studytime: int = 2; failures: int = 0
    schoolsup: str = "no"; famsup: str = "yes"; paid: str = "no"
    activities: str = "no"; nursery: str = "yes"; higher: str = "yes"
    internet: str = "yes"; romantic: str = "no"
    famrel: int = 4; freetime: int = 3; goout: int = 3
    Dalc: int = 1; Walc: int = 1; health: int = 3
    absences: int = 0; G1: float = 10.0; G2: float = 10.0

    @validator('school')
    def normalize_school_field(cls, v):
        return normalize_school(v)

    @validator('G1', 'G2')
    def validate_grades(cls, v):
        if not 0 <= v <= 20:
            raise ValueError('Grade must be between 0 and 20')
        return v

    @validator('age')
    def validate_age(cls, v):
        if not 10 <= v <= 25:
            raise ValueError('Age must be between 10 and 25')
        return v

@router.post("/")
def create_student(data: StudentCreate, db: Session = Depends(get_db),
                   current=Depends(get_current_faculty)):
    if db.query(models.Student).filter(models.Student.student_id == data.student_id).first():
        raise HTTPException(400, "Student ID already exists")
    student = models.Student(**data.dict(), faculty_id=current.id)
    db.add(student); db.commit(); db.refresh(student)
    return student

@router.get("/")
def list_students(db: Session = Depends(get_db), current=Depends(get_current_faculty)):
    if current.role in ("hod", "admin"):
        return db.query(models.Student).all()
    return db.query(models.Student).filter(models.Student.faculty_id == current.id).all()

@router.get("/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db),
                current=Depends(get_current_faculty)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    return student

@router.post("/{student_id}/predict")
def predict_student(student_id: int, db: Session = Depends(get_db),
                    current=Depends(get_current_faculty)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    student_dict = {c.name: getattr(student, c.name)
                    for c in models.Student.__table__.columns
                    if c.name not in ('id', 'name', 'student_id', 'faculty_id', 'created_at')}
    result = prediction_service.predict(student_dict, student.name)
    pred = models.Prediction(
        student_id=student.id,
        risk_probability=result['risk_probability'],
        risk_level=result['risk_level'],
        is_at_risk=result['is_at_risk'],
        shap_explanation=result['shap_explanation'],
        intervention_plan=result['intervention_plan']
    )
    db.add(pred); db.commit(); db.refresh(pred)
    return {"prediction_id": pred.id, **result}

@router.get("/{student_id}/history")
def prediction_history(student_id: int, db: Session = Depends(get_db),
                       current=Depends(get_current_faculty)):
    return db.query(models.Prediction).filter(
        models.Prediction.student_id == student_id
    ).order_by(models.Prediction.created_at.desc()).all()

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db),
                   current=Depends(get_current_faculty)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    db.query(models.Prediction).filter(models.Prediction.student_id == student_id).delete()
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
