# 🚀 Process AI — AI Agency Website

A full-stack AI agency website with:

* 🎬 Animated landing page
* 🎨 Premium homepage UI
* 📊 Dynamic projects showcase
* 📅 Booking system (MongoDB)
* 🔐 Hidden admin panel (CRUD)

---

## 🛠️ Tech Stack

**Frontend**

* React / Next.js
* Tailwind CSS

**Backend**

* FastAPI (Python)
* MongoDB

**Other**

* JWT Authentication
* REST APIs

---

## 📁 Project Structure

```
process-ai/
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## ⚙️ Run Locally

### 1️⃣ Clone Repo

```
git clone <your-repo-url>
cd <project-folder>
```

---

### 2️⃣ Setup Backend

```
cd backend
pip install -r requirements.txt
```

Create `.env` file inside `backend/`

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=process_ai
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@processai.com
ADMIN_PASSWORD=ProcessAI@Admin2024
```

Start backend:

```
uvicorn server:app --reload --port 8001
```

---

### 3️⃣ Setup Frontend

Open new terminal:

```
cd frontend
yarn install
```

Create `.env` inside `frontend/`

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start frontend:

```
yarn start
```

---

## 🌐 Access URLs

* Frontend → http://localhost:3000
* Backend API → http://localhost:8001
* Admin Login → http://localhost:3000/admin-login

---

## 🔐 Admin Credentials

```
Email: admin@processai.com
Password: ProcessAI@Admin2024
```

---

## 📅 Features

### User Side

* View services & projects
* Book a call
* Responsive UI

### Admin Panel

* Add / Edit / Delete projects
* View bookings
* Secure login

---

## 📡 API Endpoints

### Projects

* GET `/api/projects`
* POST `/api/projects`
* PUT `/api/projects/:id`
* DELETE `/api/projects/:id`

### Bookings

* POST `/api/bookings`
* GET `/api/bookings` (admin)

---

## 🚀 Deployment

### Frontend (Vercel)

1. Push repo to GitHub
2. Import project in Vercel
3. Add env variable:

```
REACT_APP_BACKEND_URL=<your-backend-url>
```

---

### Backend (Railway / Render)

* Deploy `backend/` folder
* Add environment variables
* Use start command:

```
uvicorn server:app --host 0.0.0.0 --port 8001
```

---

## ⚠️ Requirements

* Python 3.11+
* Node.js 18+
* MongoDB (local or cloud)
* Yarn

---

## 🧪 Testing

* Submit booking → check MongoDB
* Login as admin → manage projects
* Add project → appears on homepage

---

## 🛠️ Troubleshooting

**Backend not running**

* Check MongoDB is running
* Verify `.env` file

**Frontend not connecting**

* Check `REACT_APP_BACKEND_URL`

---

## 📌 Notes

* Admin panel is hidden (not visible to users)
* Designed for scalability
* Can extend with AI chatbot / automation

---

## 💡 Future Improvements

* Email notifications
* AI chatbot booking
* Advanced animations
* Payment integration

---

## 📄 License

MIT License
