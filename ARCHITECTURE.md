# CareQueue AI - Project Architecture

## Overview

CareQueue AI is a Smart Barangay Clinic Triage & Queue Management System built with React (frontend) and Node.js/Express (backend).

## Project Structure

```
carequeue-ai/
├── backend/                 # Node.js + Express API
│   ├── data/
│   │   └── store.js        # In-memory data storage
│   ├── routes/
│   │   ├── patients.js     # Patient registration
│   │   ├── queue.js        # Queue management
│   │   ├── auth.js         # Admin login
│   │   └── reports.js      # Daily reports & logs
│   ├── utils/
│   │   └── triageLogic.js  # Rule-based AI triage
│   ├── server.js           # Express app entry point
│   └── package.json
│
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/patients | Register new patient |
| GET | /api/patients | Get all patients (admin) |
| GET | /api/queue | Get sorted live queue |
| PATCH | /api/queue/:id/status | Update patient status |
| DELETE | /api/queue/completed | Clear completed patients |
| POST | /api/auth/login | Admin login |
| GET | /api/reports/daily | Daily report summary |
| GET | /api/reports/log | Daily patient log |

## Triage Logic (Rule-Based)

1. **Emergency**: Manual checkbox, temp ≥40°C, or emergency keywords (chest pain, difficulty breathing, etc.)
2. **Urgent**: Temp 38.5-40°C or urgent keywords (high fever, infection, wound, etc.)
3. **Normal**: All other cases

## Data Flow

1. Patient submits form → Backend receives → Triage classifies → Patient added to queue
2. Queue dashboard polls /api/queue → Displays sorted list
3. Admin updates status → PATCH /api/queue/:id/status
4. Report fetches /api/reports/daily → Shows summary
