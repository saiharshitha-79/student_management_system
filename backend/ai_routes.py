from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import database
import models
import auth
import random

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class ChatRequest(BaseModel):
    message: str

class PredictionResponse(BaseModel):
    student_id: str
    predicted_cgpa: float
    risk_level: str
    readiness_score: int
    recommendation: str

@router.get("/predict-performance/{student_id}", response_model=PredictionResponse)
def predict_performance(student_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Simulated ML endpoint. In production, this would load a Scikit-Learn or TensorFlow model
    and pass the student's historical data (attendance, previous grades) through the pipeline.
    """
    student = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Heuristic simulation logic
    base_cgpa = float(student.cgpa) if student.cgpa else 5.0
    attendance = float(student.attendance_rate) if student.attendance_rate else 50.0
    
    # Simulate ML prediction
    predicted_cgpa = base_cgpa + ((attendance - 75) / 100) * 1.5
    predicted_cgpa = max(0.0, min(10.0, predicted_cgpa))
    
    if predicted_cgpa < 5.0:
        risk = "High Risk"
        rec = "Mandatory academic counseling and tutoring required."
        readiness = random.randint(20, 40)
    elif predicted_cgpa < 7.5:
        risk = "Moderate Risk"
        rec = "Suggest enrolling in skill gap workshops."
        readiness = random.randint(45, 70)
    else:
        risk = "Low Risk"
        rec = "Eligible for advanced placement and top-tier internships."
        readiness = random.randint(75, 99)
        
    return {
        "student_id": student.student_id,
        "predicted_cgpa": round(predicted_cgpa, 2),
        "risk_level": risk,
        "readiness_score": readiness,
        "recommendation": rec
    }

@router.post("/advisor-chat")
def advisor_chat(chat: ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    """
    Simulated NLP Academic Advisor Chatbot.
    """
    msg = chat.message.lower()
    
    if "internship" in msg or "placement" in msg:
        reply = "Based on our AI models, top tech companies look for a CGPA > 8.0 and strong projects. I recommend taking 'Advanced Algorithms' next semester to boost your placement readiness score."
    elif "failing" in msg or "struggling" in msg or "help" in msg:
        reply = "I notice you're asking for help. Our system shows you might benefit from the Peer Tutoring program. Would you like me to schedule a session?"
    elif "course" in msg or "recommend" in msg:
        reply = "Our Recommendation Engine suggests 'Cloud Computing with AWS' and 'Intro to TensorFlow' to close your current skill gaps."
    else:
        reply = "I am your AI Academic Advisor. I can help predict your performance, analyze skill gaps, or recommend internships. How can I assist you today?"
        
    return {"reply": reply}
