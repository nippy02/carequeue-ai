# CareQueue AI - Setup Instructions

Complete step-by-step guide to set up and run CareQueue AI locally.

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or newer)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **Code Editor** (optional but recommended)
   - VS Code, Cursor, or any editor of your choice

---

## Step-by-Step Setup

### Step 1: Navigate to Project Directory

```bash
cd carequeue-ai
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `sqlite3` - Database
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Step 3: Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

This will install:
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `vite` - Build tool
- `tailwindcss` - CSS framework

### Step 4: Start Backend Server

In the backend terminal:

```bash
npm start
```

You should see:
```
Connected to SQLite database
Database initialized successfully
╔══════════════════════════════════════════╗
║     CareQueue AI - Backend Server        ║
║     Running on http://localhost:5000     ║
╚══════════════════════════════════════════╝
```

**Keep this terminal open!**

### Step 5: Start Frontend Development Server

In the frontend terminal:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

The browser should automatically open to `http://localhost:3000`

**Keep this terminal open too!**

---

## Verify Installation

### Test Backend

Open browser or use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CareQueue AI API is running"
}
```

### Test Frontend

1. Open `http://localhost:3000`
2. You should see the CareQueue AI homepage
3. Try registering a test patient

---

## First-Time Database Setup

The SQLite database is automatically created on first run in:
```
backend/data/carequeue.db
```

The database schema is automatically initialized with:
- `patients` table
- `staff` table (with default admin user)
- `daily_visits` table

**Default Admin Credentials:**
- Username: `admin`
- Password: `carequeue123`

---

## Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

**Frontend (Port 3000):**
Change port in `frontend/vite.config.js`:
```js
server: {
  port: 3001, // Change to different port
}
```

### Database Errors

If you encounter database errors:

1. Delete the database file:
   ```bash
   rm backend/data/carequeue.db
   ```

2. Restart the backend server (it will recreate the database)

### Module Not Found Errors

Ensure you've installed dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### CORS Errors

The backend already has CORS enabled. If you still see CORS errors:

1. Check that backend is running on port 5000
2. Check that frontend proxy is configured correctly in `vite.config.js`

---

## Development Workflow

### Making Changes

1. **Backend changes:** Edit files in `backend/` - server auto-restarts
2. **Frontend changes:** Edit files in `frontend/src/` - Vite hot-reloads automatically

### Database Access

To view/edit the database directly:

1. Install SQLite browser: https://sqlitebrowser.org/
2. Open `backend/data/carequeue.db`

Or use command line:
```bash
sqlite3 backend/data/carequeue.db
.tables
SELECT * FROM patients;
```

---

## Running Tests

### Test Patient Registration

Use the frontend form or curl:

```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "age": 25,
    "symptoms": "fever and headache",
    "temperature": 38.5
  }'
```

### Test Queue

```bash
curl http://localhost:5000/api/queue
```

### Test Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "carequeue123"
  }'
```

---

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Preview Production Build

```bash
npm run preview
```

---

## Environment Variables

Create `backend/.env` (optional):

```env
PORT=5000
NODE_ENV=development
```

Create `frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Verify both servers are running
2. ✅ Test patient registration
3. ✅ View queue dashboard
4. ✅ Login as admin
5. ✅ Test status updates
6. ✅ View analytics dashboard

---

## Need Help?

- Check the main README.md for API documentation
- Review the code comments in each file
- Check browser console for frontend errors
- Check backend terminal for server errors

---

**Happy coding! 🚀**
