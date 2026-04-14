# backend/app/db/models.py
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

# Association Tables for Many-to-Many Relationships
# Because a user can have many strengths, and a subject can be a strength for many users
user_strengths = Table(
    'user_strengths', Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('subject_id', Integer, ForeignKey('subjects.id', ondelete="CASCADE"), primary_key=True)
)

user_weaknesses = Table(
    'user_weaknesses', Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('subject_id', Integer, ForeignKey('subjects.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    major = Column(String(100))
    study_style = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships to access a user's subjects easily in Python
    strengths = relationship("Subject", secondary=user_strengths, backref="strong_students")
    weaknesses = relationship("Subject", secondary=user_weaknesses, backref="weak_students")

class Subject(Base):
    __tablename__ = 'subjects'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

class SwipeAction(Base):
    __tablename__ = 'swipe_actions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    swiper_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    action = Column(String(20), nullable=False) # Expected: 'REQUEST' or 'SKIP'
    status = Column(String(20), default='PENDING') # Expected: 'PENDING', 'MATCHED', 'REJECTED'
    created_at = Column(DateTime, default=datetime.utcnow)