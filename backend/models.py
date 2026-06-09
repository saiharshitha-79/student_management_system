from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="student") # admin, faculty, student, parent

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
    
    academic_records = relationship("AcademicRecord", back_populates="student")

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_name = Column(String(100))
    grade = Column(Float)
    term = Column(String(50))
    
    student = relationship("Student", back_populates="academic_records")
