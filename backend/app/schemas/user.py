from pydantic import BaseModel, EmailStr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# 1. This is what the frontend MUST send to create a user
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    major: str
    study_style: str

# This is what the backend will send back the frontend
class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    major: str
    study_style: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SwipeCreate(BaseModel):
    target_id: UUID
    action: str  # Expected to be "REQUEST" or "SKIP"  