# 📚 StudyBuddy - Full-Stack Matching App

StudyBuddy is a modern, Tinder-style web application designed to connect university students based on their major, study style, and compatibility score. 

This project demonstrates a complete full-stack architecture, featuring a custom recommendation algorithm, secure stateless authentication, and a responsive physics-based UI.

## 🚀 Features
* **Intelligent Matching Algorithm:** Calculates compatibility scores between users based on profile attributes.
* **Tinder-Style Swiping:** Physics-based card UI for requesting or skipping potential study partners.
* **Mutual Matching:** Relational database logic that detects mutual right-swipes and generates a "Match".
* **Secure Authentication:** Complete registration and login flow using hashed passwords and JSON Web Tokens (JWT).
* **RESTful API:** Robust backend handling data validation, dependency injection, and complex relational queries.

## 💻 Tech Stack
**Frontend:**
* React (Vite)
* Tailwind CSS (via Lucide React)
* React Router DOM
* React Tinder Card (Physics/Animation Engine)

**Backend:**
* Python
* FastAPI
* PostgreSQL
* SQLAlchemy (ORM)
* PyJWT & PassLib (Authentication & Hashing)

## 🛠️ Local Setup Instructions

To run this project locally, you will need Node.js, Python, and PostgreSQL installed.

### 1. Database Setup
Create a local PostgreSQL database named `studybuddy`.

### 2. Backend Setup
Navigate to the backend directory, set up your virtual environment, and run the FastAPI server:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # (Or venv/bin/activate on Mac/Linux)
pip install -r requirements.txt