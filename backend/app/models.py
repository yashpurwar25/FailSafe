from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Faculty(Base):
    __tablename__ = "faculty"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="faculty")
    department = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    students = relationship("Student", back_populates="faculty")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    student_id = Column(String, unique=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    subject = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    faculty = relationship("Faculty", back_populates="students")
    predictions = relationship("Prediction", back_populates="student")
    school = Column(String); sex = Column(String); age = Column(Integer)
    address = Column(String); famsize = Column(String); Pstatus = Column(String)
    Medu = Column(Integer); Fedu = Column(Integer); Mjob = Column(String)
    Fjob = Column(String); reason = Column(String); guardian = Column(String)
    traveltime = Column(Integer); studytime = Column(Integer); failures = Column(Integer)
    schoolsup = Column(String); famsup = Column(String); paid = Column(String)
    activities = Column(String); nursery = Column(String); higher = Column(String)
    internet = Column(String); romantic = Column(String)
    famrel = Column(Integer); freetime = Column(Integer); goout = Column(Integer)
    Dalc = Column(Integer); Walc = Column(Integer); health = Column(Integer)
    absences = Column(Integer); G1 = Column(Float); G2 = Column(Float)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    risk_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    is_at_risk = Column(Boolean, nullable=False)
    shap_explanation = Column(JSON)
    intervention_plan = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    faculty_notes = Column(Text)
    intervention_status = Column(String, default="pending")
    student = relationship("Student", back_populates="predictions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON)