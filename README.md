# CareQueue AI

**Smart Clinic Triage & Queue Management System**

A complete MVP web application designed for small healthcare clinics and Barangay Health Centers to efficiently manage patient walk-ins, AI-based triage prioritization, live queue management, and clinic analytics.

---

## 🎯 Features

### Patient Registration
- **Simple registration form** with required fields validation
- **AI-based triage** automatically classifies patients into Emergency, Urgent, or Normal priority
- **Automatic queue number assignment**
- **Smart visit duration estimation** based on symptoms and age
- **Consultation type suggestion** (General, Emergency, Specialist)

### Live Queue Dashboard
- **Real-time queue display** (updates every 5 seconds)
- **Priority-based sorting** (Emergency → Urgent → Normal)
- **Estimated wait times** per patient
- **Visual priority indicators** with color-coded badges
- **Mobile-responsive design**

### Analytics Dashboard
- **Total patients today**
- **Priority breakdown** (Emergency, Urgent, Normal)
- **Active queue count**
- **Completed visits**
- **Average waiting time**
- **Real-time statistics**

### Staff/Admin Panel
- **Simple staff login** (no complex authentication for MVP)
- **Queue management** - Update patient status (Waiting → In Consultation → Done)
- **Daily patient log** - View all patients seen today
- **Clear completed visits** - End-of-day cleanup
- **Daily report summary**

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS
- **Backend:** Node.js + Express
- **Database:** SQLite
- **API:** REST API

---

## 📂 Project Structure

```
carequeue-ai/
├── backend/
│   ├── data/
│   │   └── carequeue.db          # SQLite database (auto-generated)
│   ├── models/
│   │   ├── Patient.js            # Patient database operations
│   │   └── Staff.js              # Staff authentication
│   ├── routes/
│   │   ├── patients.js           # Patient registration endpoints
│   │   ├── queue.js               # Queue management endpoints
│   │   ├── auth.js                # Staff login endpoints
│   │   └── reports.js            # Analytics and reports endpoints
│   ├── utils/
│   │   └── triageLogic.js        # AI triage classification logic
│   ├── database.js                # Database initialization
│   ├── server.js                  # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientForm.jsx      # Patient registration form
│   │   │   ├── QueueDashboard.jsx   # Live queue display
│   │   │   ├── AnalyticsDashboard.jsx # Analytics dashboard
│   │   │   ├── AdminPanel.jsx        # Staff management panel
│   │   │   └── AdminLogin.jsx        # Staff login
│   │   ├── api.js                   # API client
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # TailwindCSS styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md
└── SETUP.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or newer) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation & Setup

#### 1. Clone or navigate to the project directory

```bash
cd carequeue-ai
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Start the Backend Server

From the `backend` directory:

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════╗
║     CareQueue AI - Backend Server        ║
║     Running on http://localhost:5000     ║
╚══════════════════════════════════════════╝
```

The SQLite database will be automatically created in `backend/data/carequeue.db` on first run.

#### 5. Start the Frontend (New Terminal)

From the `frontend` directory:

```bash
npm run dev
```

The app will open at **http://localhost:3000**

---

## 📊 Database Schema

### Patients Table

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  queue_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  contact_number TEXT,
  symptoms TEXT NOT NULL,
  temperature REAL,
  is_emergency INTEGER DEFAULT 0,
  priority TEXT NOT NULL,              -- 'emergency', 'urgent', 'normal'
  priority_reason TEXT,
  status TEXT DEFAULT 'waiting',        -- 'waiting', 'in_consultation', 'done'
  estimated_duration INTEGER,          -- minutes
  consultation_type TEXT,               -- 'General', 'Emergency', 'Cardiology', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

### Staff Table

```sql
CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `carequeue123`

---

## 🔌 API Endpoints

### Patient Registration

**POST** `/api/patients`
- Register a new patient
- Request body: `{ name, age, contactNumber?, symptoms, temperature?, isEmergency? }`
- Returns: Patient object with queue number and priority

**GET** `/api/patients`
- Get all patients (admin)

### Queue Management

**GET** `/api/queue`
- Get sorted live queue (by priority, then arrival time)
- Returns: Array of patients with estimated wait times

**PATCH** `/api/queue/:id/status`
- Update patient status
- Request body: `{ status: 'waiting' | 'in_consultation' | 'done' }`

**DELETE** `/api/queue/completed`
- Clear all completed patients

### Authentication

**POST** `/api/auth/login`
- Staff login
- Request body: `{ username, password }`
- Returns: User object

### Reports & Analytics

**GET** `/api/reports/daily`
- Get daily statistics
- Returns: Report object with counts and averages

**GET** `/api/reports/log`
- Get daily patient log
- Returns: Array of all patients seen today

---

## 🤖 AI Triage Logic

The system uses **rule-based classification** to automatically prioritize patients:

### Emergency Priority (🔴)
Triggered by:
- Symptoms containing: `chest pain`, `difficulty breathing`, `unconscious`, `severe bleeding`, `stroke`, `seizure`, etc.
- Temperature ≥ 40°C
- Manual emergency checkbox checked

### Urgent Priority (🟠)
Triggered by:
- Symptoms containing: `high fever`, `infection`, `severe abdominal pain`, `wound`, `dehydration`, etc.
- Temperature 38.5°C - 40°C

### Normal Priority (🟢)
- All other cases

### Visit Duration Estimation

The system estimates consultation duration based on:
- **Priority level** (Emergency: 45min, Urgent: 30min, Normal: 15min)
- **Age** (Pediatric +10min, Elderly +5min)
- **Symptom complexity** (Multiple symptoms +10min)
- **Consultation type** (Specialist consultations add time)

---

## ✅ Validation

The application includes client and server-side validation:

- **Patient Name:** Required, non-empty
- **Age:** Required, must be ≥ 0
- **Symptoms:** Required, non-empty
- **Contact Number:** Optional, validated format
- **Temperature:** Optional, numeric range 35-45°C

---

## 🎨 UI Features

- **Modern, clean design** with TailwindCSS
- **Responsive layout** - works on desktop, tablet, and mobile
- **Color-coded priority badges** for quick visual identification
- **Real-time updates** - Queue refreshes automatically
- **Intuitive navigation** - Easy to use for clinic staff

---

## 📝 Example Test Data

### Register a Patient

```json
POST /api/patients
{
  "name": "Juan Dela Cruz",
  "age": 35,
  "contactNumber": "09123456789",
  "symptoms": "chest pain and difficulty breathing",
  "temperature": 37.5,
  "isEmergency": false
}
```

Expected Response:
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "patient": {
    "id": "P1234567890-abc123",
    "queueNumber": 1,
    "name": "Juan Dela Cruz",
    "priority": "emergency",
    "status": "waiting",
    "estimatedDuration": 45,
    "consultationType": "Cardiology",
    "estimatedWait": 5
  }
}
```

---

## 🚢 Deployment Guide

### Backend Deployment (Render/Railway)

1. Create a new Node.js service
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Set environment variable: `PORT=5000`
5. The SQLite database file will persist in the service

### Frontend Deployment (Vercel/Netlify)

1. Connect your repository
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

**Note:** For production, consider migrating to PostgreSQL or MongoDB instead of SQLite for better scalability.

---

## 🔒 Security Notes (MVP)

This is an MVP for internship presentation. For production use:

- ✅ Replace simple password auth with JWT tokens
- ✅ Use environment variables for secrets
- ✅ Add rate limiting
- ✅ Implement proper session management
- ✅ Add input sanitization
- ✅ Use HTTPS
- ✅ Add database backups

---

## 📄 License

MIT — Feel free to use and modify for your clinic.

---

## 👥 Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for small healthcare clinics**
