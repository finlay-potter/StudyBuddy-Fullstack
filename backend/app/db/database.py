from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base  # Fixed the broken import path!

# UPDATE THIS LINE: Replace YOUR_REAL_PASSWORD with your actual PostgreSQL password
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:tavjiN-8panjy-huwhon@localhost/studybuddy"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()