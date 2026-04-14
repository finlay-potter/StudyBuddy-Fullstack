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

# 2. This is what the backend will SEND BACK to the frontend
# (Notice we DO NOT include the password here! Security first.)
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