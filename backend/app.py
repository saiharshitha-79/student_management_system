from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import random
import csv
import io
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import random

app = Flask(__name__)
CORS(app)

SECRET_KEY = "super-secret-ai-key-for-smart-university"
SQLALCHEMY_DATABASE_URL = "sqlite:///./sms_ai.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="student")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True)
    name = Column(String(150))
    email = Column(String(150), unique=True, index=True)
    department = Column(String(100))
    year = Column(Integer)
    cgpa = Column(Float, default=0.0)
    attendance_rate = Column(Float, default=100.0)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        return db
    except:
        db.close()

# Auth Decorator
def token_required(f):
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            db = get_db()
            current_user = db.query(User).filter(User.username == data['sub']).first()
            db.close()
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Next-Gen AI Student Management System API"})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    db = get_db()
    if db.query(User).filter(User.username == data['username']).first():
        db.close()
        return jsonify({'message': 'Username already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], hashed_password=hashed_password, role=data.get('role', 'student'))
    db.add(new_user)
    db.commit()
    db.close()
    return jsonify({'message': 'User created successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    db = get_db()
    user = db.query(User).filter(User.username == data.get('username')).first()
    db.close()
    
    if not user or not check_password_hash(user.hashed_password, data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.decode(
        jwt.encode({'sub': user.username, 'role': user.role, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)}, SECRET_KEY, algorithm="HS256"),
        options={"verify_signature": False}
    )
    
    encoded_token = jwt.encode({'sub': user.username, 'role': user.role, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)}, SECRET_KEY, algorithm="HS256")
    
    return jsonify({'access_token': encoded_token, 'token_type': 'bearer', 'role': user.role})

# --- Student CRUD Routes ---
@app.route('/students', methods=['GET'])
@token_required
def get_students(current_user):
    db = get_db()
    students = db.query(Student).all()
    db.close()
    
    result = []
    for s in students:
        result.append({
            'id': s.id,
            'student_id': s.student_id,
            'name': s.name,
            'email': s.email,
            'department': s.department,
            'year': s.year,
            'cgpa': s.cgpa,
            'attendance_rate': s.attendance_rate
        })
    return jsonify(result)

@app.route('/students', methods=['POST'])
@token_required
def create_student(current_user):
    data = request.get_json()
    db = get_db()
    
    if db.query(Student).filter(Student.student_id == data.get('student_id')).first():
        db.close()
        return jsonify({'message': 'Student ID already exists'}), 400
        
    new_student = Student(
        student_id=data.get('student_id'),
        name=data.get('name'),
        email=data.get('email'),
        department=data.get('department', ''),
        year=data.get('year', 1),
        cgpa=data.get('cgpa', 0.0),
        attendance_rate=data.get('attendance_rate', 100.0)
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    db.close()
    return jsonify({'message': 'Student created successfully'})

@app.route('/students/<int:id>', methods=['PUT', 'DELETE'])
@token_required
def modify_student(current_user, id):
    db = get_db()
    student = db.query(Student).filter(Student.id == id).first()
    
    if not student:
        db.close()
        return jsonify({'message': 'Student not found'}), 404
        
    if request.method == 'DELETE':
        db.delete(student)
        db.commit()
        db.close()
        return jsonify({'message': 'Student deleted successfully'})
        
    if request.method == 'PUT':
        data = request.get_json()
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.department = data.get('department', student.department)
        student.year = data.get('year', student.year)
        student.cgpa = data.get('cgpa', student.cgpa)
        student.attendance_rate = data.get('attendance_rate', student.attendance_rate)
        db.commit()
        db.close()
        return jsonify({'message': 'Student updated successfully'})

@app.route('/upload-csv', methods=['POST'])
@token_required
def upload_csv(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    if file and file.filename.endswith('.csv'):
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        db = get_db()
        count = 0
        for row in csv_input:
            # Check if student exists
            existing = db.query(Student).filter(Student.student_id == row.get('student_id')).first()
            if not existing and row.get('student_id'):
                new_student = Student(
                    student_id=row.get('student_id'),
                    name=row.get('name', 'Unknown'),
                    email=row.get('email', f"{row.get('student_id')}@university.edu"),
                    department=row.get('department', ''),
                    year=int(row.get('year', 1)) if row.get('year') else 1,
                    cgpa=float(row.get('cgpa', 0.0)) if row.get('cgpa') else 0.0,
                    attendance_rate=float(row.get('attendance_rate', 100.0)) if row.get('attendance_rate') else 100.0
                )
                db.add(new_student)
                count += 1
        db.commit()
        db.close()
        return jsonify({'message': f'Successfully imported {count} students.'})
    
    return jsonify({'message': 'Invalid file format. Please upload a CSV.'}), 400

# AI Routes
@app.route('/ai/predict-performance/<student_id>', methods=['GET'])
@token_required
def predict_performance(current_user, student_id):
    db = get_db()
    student = db.query(Student).filter(Student.student_id == student_id).first()
    db.close()
    
    if not student:
        # For demo purposes, generate a fake one if not found
        base_cgpa = 6.5
        attendance = 80.0
    else:
        base_cgpa = float(student.cgpa)
        attendance = float(student.attendance_rate)
        
    predicted_cgpa = base_cgpa + ((attendance - 75) / 100) * 1.5
    predicted_cgpa = max(0.0, min(10.0, predicted_cgpa))
    
    if predicted_cgpa < 5.0:
        risk, rec, readiness = "High Risk", "Mandatory academic counseling required.", random.randint(20, 40)
    elif predicted_cgpa < 7.5:
        risk, rec, readiness = "Moderate Risk", "Suggest skill gap workshops.", random.randint(45, 70)
    else:
        risk, rec, readiness = "Low Risk", "Eligible for advanced placement.", random.randint(75, 99)
        
    return jsonify({
        "student_id": student_id,
        "predicted_cgpa": round(predicted_cgpa, 2),
        "risk_level": risk,
        "readiness_score": readiness,
        "recommendation": rec
    })

@app.route('/ai/advisor-chat', methods=['POST'])
@token_required
def advisor_chat(current_user):
    data = request.get_json()
    msg = data.get('message', '').lower()
    
    if "internship" in msg or "placement" in msg:
        reply = "Our AI models show top tech companies look for CGPA > 8.0. Take 'Advanced Algorithms' to boost your readiness."
    elif "failing" in msg or "struggling" in msg:
        reply = "I notice you're asking for help. You might benefit from the Peer Tutoring program. Shall I schedule a session?"
    else:
        reply = "I am your AI Academic Advisor. I can predict performance, analyze skill gaps, or recommend internships. How can I help?"
        
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
