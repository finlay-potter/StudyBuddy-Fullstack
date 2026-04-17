from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm 
from sqlalchemy.orm import Session
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import List

from app.db.database import engine, get_db
from app.db import models
from app.schemas import user as user_schema

import os
from dotenv import load_dotenv

# Load the hidden variables from .env
load_dotenv()

#  Security Settings 
SECRET_KEY = os.getenv("JWT_SECRET_KEY") # Never share this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyBuddy API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the StudyBuddy API! 🚀"}

#  (NEW ROUTE) : Create a User
@app.post("/users/", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    
    #  Check if email already exists in the database
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    #  Hash the password securely
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()

    #  Create Database Object (Translating Pydantic -> SQLAlchemy)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw,
        major=user.major,
        study_style=user.study_style
    )

    # Save to Database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

#  (NEW ROUTE) : Get all users for the Discovery Feed
@app.get("/users/", response_model=List[user_schema.UserResponse])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # This queries the database for all users, but limits it to 100 at a time
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

#  (NEW ROUTE) : User Login (Generates JWT Token)
@app.post("/token", response_model=user_schema.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find the user by username
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Hash the entered password and compare it to the database
    hashed_pw = hashlib.sha256(form_data.password.encode()).hexdigest()
    if hashed_pw != user.password_hash:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Create the JWT Token
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user.username, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": encoded_jwt, "token_type": "bearer"}

#  SECURITY BOUNCER : function will be used to protect routes that require authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode token to see who it belongs to
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError: # Catch fake or expired tokens
        raise credentials_exception
        
    # Look up the user in the database
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

#  THE MATCHING ALGORITHM 
def calculate_match_score(current_user: models.User, candidate: models.User) -> int:
    """
    Calculates a compatibility score between two users.
    Higher score = better study buddy match.
    """
    score = 0
    
    # Exact Major Match (+10 points)
    # Students in the same major likely take the same classes
    if current_user.major.lower() == candidate.major.lower():
        score += 10
        
    # Study Style Compatibility (+5 points)
    # Quiet studiers pair well with quiet studiers, collaborative with collaborative
    if current_user.study_style.lower() == candidate.study_style.lower():
        score += 5
        
    # (add the Complementary Subjects logic here)
    
    return score

#  (NEW ROUTE) : Get Current Logged-in User (PROTECTED) 
@app.get("/users/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

#  (NEW ROUTE) : Personalized Discovery Feed (PROTECTED) 
@app.get("/discovery/", response_model=List[dict])
def get_discovery_feed(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # Get all users from the database except the current user
    other_users = db.query(models.User).filter(models.User.id != current_user.id).all()
    
    scored_users = []
    
    # Loop through every other user and calculate their Match Score
    for candidate in other_users:
        score = calculate_match_score(current_user, candidate)
        
        # Package the data up for the frontend
        scored_users.append({
            "user_id": candidate.id,
            "username": candidate.username,
            "major": candidate.major,
            "study_style": candidate.study_style,
            "match_score": score
        })
        
    # Sort the list so the highest score is at the top
    # (Python lambda function to sort by the 'match_score' dictionary key)
    scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    
    return scored_users


#  (NEW ROUTE) : Record Swipe & Check for Match (PROTECTED) ---
@app.post("/swipe/")
def swipe_user(swipe: user_schema.SwipeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # Prevent swiping on yourself
    if swipe.target_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot swipe on yourself.")

    # Check if you already swiped on this person
    existing_swipe = db.query(models.SwipeAction).filter(
        models.SwipeAction.swiper_id == current_user.id,
        models.SwipeAction.target_id == swipe.target_id
    ).first()
    
    if existing_swipe:
        raise HTTPException(status_code=400, detail="You already swiped on this profile.")

    # Save the new swipe to the database
    new_swipe = models.SwipeAction(
        swiper_id=current_user.id,
        target_id=swipe.target_id,
        action=swipe.action.upper(),
        status="PENDING"
    )
    db.add(new_swipe)
    db.commit()

    # The Match Logic: If you liked them, did they like you back
    if new_swipe.action == "REQUEST":
        mutual_swipe = db.query(models.SwipeAction).filter(
            models.SwipeAction.swiper_id == swipe.target_id,
            models.SwipeAction.target_id == current_user.id,
            models.SwipeAction.action == "REQUEST"
        ).first()

        if mutual_swipe:
            # Update both records.
            new_swipe.status = "MATCHED"
            mutual_swipe.status = "MATCHED"
            db.commit()
            return {"message": "It's a MATCH! 🎉", "match_status": "MATCHED"}

    return {"message": f"Successfully recorded {swipe.action}", "match_status": "PENDING"}

#  (NEW ROUTE) : Get Mutual Matches (PROTECTED) 
@app.get("/matches/", response_model=List[dict])
def get_matches(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Find all swipes where the current user requested someone AND it resulted in a MATCH
    matches = db.query(models.SwipeAction).filter(
        models.SwipeAction.swiper_id == current_user.id,
        models.SwipeAction.status == "MATCHED"
    ).all()

    matched_users = []
    for match in matches:
        # Look up the profile details of the person they matched with
        matched_user = db.query(models.User).filter(models.User.id == match.target_id).first()
        if matched_user:
            matched_users.append({
                "user_id": matched_user.id,
                "username": matched_user.username,
                "major": matched_user.major,
                "study_style": matched_user.study_style
            })

    return matched_users