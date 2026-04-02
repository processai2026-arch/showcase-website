# 🚀 Process AI — Local Setup Guide

---

## Terminal 1 — Backend (FastAPI)

```powershell
cd d:\showcase-website
.\venv\Scripts\Activate.ps1
cd backend
uvicorn server:app --reload --port 8001
```

**You'll see this in terminal when backend starts successfully:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxx] using StatReload
Admin user created: admin@processai.com
Process AI Backend Started
```

---

## Terminal 2 — Frontend (React)

```powershell
cd d:\showcase-website\frontend
yarn start
```

**You'll see this in terminal when frontend starts successfully:**
```
Compiled successfully!

You can now view process-ai-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

> ⚠️ ESLint warnings may appear — these are just code quality suggestions, NOT errors. The app runs fine.

---

## 🌐 Access URLs

| Page               | URL                                    | Where it Shows       |
|--------------------|----------------------------------------|----------------------|
| **Client Website** | http://localhost:3000                   | Frontend terminal    |
| **Admin Login**    | http://localhost:3000/admin-login       | Not printed anywhere — type manually in browser |
| **Admin Dashboard**| http://localhost:3000/admin-dashboard   | Not printed anywhere — auto-redirects after login |
| **Backend API**    | http://localhost:8001                   | Backend terminal     |
| **Health Check**   | http://localhost:8001/api/health        | Not printed anywhere — type manually in browser |

### Where URLs appear:
- **Backend terminal** shows: `http://127.0.0.1:8001` (same as `localhost:8001`)
- **Frontend terminal** shows: `http://localhost:3000`
- **Admin & Health URLs** are NOT printed in any terminal — you just type them in the browser address bar

---

## 🔐 Admin Credentials

```
Email:    admin@processai.com
Password: ProcessAI@Admin2024
```

---

## 📋 Quick Checklist Before Running

1. ✅ MongoDB must be running (installed as Windows service = auto-running)
2. ✅ `.env` file exists in `backend/` folder
3. ✅ `.env` file exists in `frontend/` folder
4. ✅ `venv` activated before running backend
5. ✅ `yarn install` done at least once in `frontend/`

---

## 🛑 To Stop

- **Backend**: Press `Ctrl + C` in Terminal 1
- **Frontend**: Press `Ctrl + C` in Terminal 2
