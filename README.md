# AI-Powered Resume Generator 🚀

> **FYP Project by Chirag Lama (Student ID: 2434743)**  
> A full-stack web application that uses AI and NLP to help job seekers create ATS-compliant resumes.

---

## 🗂️ Project Structure

```
Chirag lama fyp/
├── backend/                    ← Flask REST API
│   ├── app/
│   │   ├── __init__.py         ← App factory (Flask, CORS, JWT, MongoDB)
│   │   ├── config.py           ← Settings from environment variables
│   │   ├── models/
│   │   │   ├── user.py         ← User document schema + CRUD
│   │   │   └── resume.py       ← Resume document schema + CRUD
│   │   ├── routes/
│   │   │   ├── auth.py         ← /api/auth  (register, login, profile)
│   │   │   ├── resume.py       ← /api/resume (CRUD)
│   │   │   └── ai.py           ← /api/ai (generate, analyze, cover letter)
│   │   ├── services/
│   │   │   ├── ai_service.py   ← OpenAI GPT calls
│   │   │   └── nlp_service.py  ← spaCy keyword extraction & ATS scoring
│   │   └── utils/
│   │       ├── jwt_helper.py   ← JWT decorator + identity helper
│   │       └── validators.py   ← Email, password, field validators
│   ├── run.py                  ← Entry point: python run.py
│   ├── requirements.txt        ← Python dependencies
│   └── .env.example            ← Copy to .env and fill secrets
│
├── frontend/                   ← React + Vite Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state (JWT + user)
│   │   ├── services/
│   │   │   └── api.js          ← Axios client with JWT + all endpoint helpers
│   │   ├── components/
│   │   │   ├── Navbar.jsx      ← Top navigation bar
│   │   │   └── ProtectedRoute.jsx ← Redirect to /login if not authed
│   │   ├── pages/
│   │   │   ├── Login.jsx       ← /login
│   │   │   ├── Register.jsx    ← /register
│   │   │   ├── Dashboard.jsx   ← /dashboard (resume list + stats)
│   │   │   └── ResumeBuilder.jsx ← /resume/new and /resume/:id (6-step form)
│   │   ├── App.jsx             ← Router + route definitions
│   │   ├── main.jsx            ← React entry point
│   │   └── index.css           ← Global dark-mode design system
│   ├── vite.config.js          ← Dev server + proxy to Flask
│   └── .env                    ← VITE_API_URL setting
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and npm
- **MongoDB** (local: `mongodb://localhost:27017/` or MongoDB Atlas)
- **OpenAI API Key** (from https://platform.openai.com/api-keys)

---

### 1. Backend Setup

```powershell
# Navigate to backend
cd "Chirag lama fyp\backend"

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Create your .env file from template
copy .env.example .env
# Then edit .env and add your real values (especially OPENAI_API_KEY)

# Run the Flask server
python run.py
```
✅ Backend runs at: **http://localhost:5000**  
✅ Health check: **http://localhost:5000/api/health**

---

### 2. Frontend Setup

```powershell
# Open a new terminal, navigate to frontend
cd "Chirag lama fyp\frontend"

# Install dependencies (already done if you ran the setup)
npm install

# Start the dev server
npm run dev
```
✅ Frontend runs at: **http://localhost:3000**

---

## 🔌 API Endpoints

### Auth  `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Login, receive JWT |
| GET | `/me` | Get current user (🔒) |
| PUT | `/me` | Update profile (🔒) |

### Resume  `/api/resume`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all user resumes (🔒) |
| POST | `/` | Create new resume (🔒) |
| GET | `/<id>` | Get single resume (🔒) |
| PUT | `/<id>` | Update resume (🔒) |
| DELETE | `/<id>` | Delete resume (🔒) |

### AI  `/api/ai`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate resume content with GPT (🔒) |
| POST | `/analyze` | ATS analysis vs job description (🔒) |
| POST | `/cover-letter` | Generate cover letter (🔒) |
| POST | `/improve-summary` | Rewrite professional summary (🔒) |

*🔒 = Requires `Authorization: Bearer <token>` header*

---

## 🗄️ MongoDB Schema

### `users` collection
```json
{
  "_id": "ObjectId",
  "full_name": "string",
  "email": "string (unique)",
  "password_hash": "string (bcrypt)",
  "created_at": "datetime",
  "profile": {
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string"
  }
}
```

### `resumes` collection
```json
{
  "_id": "ObjectId",
  "user_id": "string (ref: users._id)",
  "title": "string",
  "personal_info": { "full_name": "", "email": "", "summary": "..." },
  "experience": [{ "company": "", "position": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "field_of_study": "" }],
  "skills": { "technical": ["Python"], "soft": ["Leadership"] },
  "projects": [],
  "ats_score": 78,
  "is_ai_generated": true,
  "created_at": "datetime"
}
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Python Flask 3 |
| Database | MongoDB (PyMongo) |
| Auth | JWT (flask-jwt-extended) |
| AI | OpenAI GPT-3.5-turbo |
| NLP | spaCy (en_core_web_sm) |
| Security | bcrypt password hashing |

---

## 🔮 Future Extensions (Phase 2)
- [ ] PDF export using `pdfkit` or `reportlab`
- [ ] Mock interview question generator
- [ ] Portfolio builder page
- [ ] Skill gap visualization charts
- [ ] Multiple resume templates
- [ ] Email notifications
- [ ] Deployment: AWS / Render / Heroku
