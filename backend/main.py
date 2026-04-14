from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import List

from app.db.database import engine, get_db
from app.db import models
from app.schemas import user as user_schema

# --- Security Settings ---
SECRET_KEY = "my-super-secret-cv-project-key" # Never share this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyBuddy API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the StudyBuddy API! 🚀"}

# --- NEW ROUTE: Create a User ---
@app.post("/users/", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    
    # 1. Check if the email already exists in the database
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash the password securely
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()

    # 3. Create the Database Object (Translating Pydantic -> SQLAlchemy)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw,
        major=user.major,
        study_style=user.study_style
    )

    # 4. Save to Database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# --- NEW ROUTE: Get all users for the Discovery Feed ---
@app.get("/users/", response_model=List[user_schema.UserResponse])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # This queries the database for all users, but limits it to 100 at a time
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users