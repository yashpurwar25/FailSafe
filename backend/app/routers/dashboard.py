from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..auth import get_current_faculty
from ..database import get_db
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current=Depends(get_current_faculty)):
    base_q = db.query(models.Student)
    if current.role not in ("hod", "admin"):
        base_q = base_q.filter(models.Student.faculty_id == current.id)

    total = base_q.count()
    student_ids = [s.id for s in base_q.all()]

    latest_preds = (
        db.query(models.Prediction)
        .filter(models.Prediction.student_id.in_(student_ids))
        .order_by(models.Prediction.created_at.desc())
        .all()
    )

    seen = set()
    unique_preds = []
    for p in latest_preds:
        if p.student_id not in seen:
            unique_preds.append(p); seen.add(p.student_id)

    at_risk = sum(1 for p in unique_preds if p.is_at_risk)
    critical = sum(1 for p in unique_preds if p.risk_level == 'CRITICAL')
    risk_levels = {}
    for p in unique_preds:
        risk_levels[p.risk_level] = risk_levels.get(p.risk_level, 0) + 1

    return {
        "total_students": total,
        "students_assessed": len(unique_preds),
        "at_risk_count": at_risk,
        "critical_count": critical,
        "passing_count": len(unique_preds) - at_risk,
        "risk_level_distribution": risk_levels,
        "at_risk_percentage": round(at_risk / max(len(unique_preds), 1) * 100, 1)
    }

@router.get("/risk-trend")
def risk_trend(db: Session = Depends(get_db), current=Depends(get_current_faculty)):
    """Weekly risk trend for chart."""
    from datetime import datetime, timedelta
    results = []
    for i in range(8):
        week_start = datetime.utcnow() - timedelta(weeks=i+1)
        week_end = datetime.utcnow() - timedelta(weeks=i)
        count = db.query(models.Prediction).filter(
            models.Prediction.created_at >= week_start,
            models.Prediction.created_at < week_end,
            models.Prediction.is_at_risk == True
        ).count()
        results.append({"week": f"W-{i+1}", "at_risk": count})
    return list(reversed(results))
