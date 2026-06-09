from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "student"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class StudentBase(BaseModel):
    student_id: str
    name: str
    email: str
    department: str
    year: int

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    cgpa: float
    attendance_rate: float
    
    class Config:
        from_attributes = True
