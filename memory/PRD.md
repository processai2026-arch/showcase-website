# Process AI - Product Requirements Document

## Project Overview
**Name:** Process AI  
**Type:** Full-stack AI Agency Website  
**Date Started:** January 28, 2026  

## Original Problem Statement
Build a full-stack AI agency website called "Process AI" with:
- Frontend: Next.js (React used for compatibility)
- Backend: Node.js (FastAPI/Python used for environment)
- Database: MongoDB
- Premium dark theme with smooth animations
- Fully responsive design

## User Personas
1. **Potential Clients** - Visitors looking for AI services
2. **Admin Users** - Agency staff managing content and bookings

## Core Requirements (Static)
1. ✅ Intro landing page with animated logo
2. ✅ Homepage with services + projects sections
3. ✅ Horizontal scrolling projects section
4. ✅ Detailed booking system with custom UI
5. ✅ Hidden admin panel at /process-admin-secure
6. ✅ CMS-style editing for services and projects
7. ✅ JWT-based authentication for admin

## Tech Stack
- **Frontend:** React 18, React Router, Framer Motion, Tailwind CSS, Lucide React
- **Backend:** FastAPI (Python), Motor (MongoDB async driver)
- **Database:** MongoDB
- **Authentication:** JWT with httpOnly cookies

## Architecture
```
/app
├── backend/
│   ├── server.py          # FastAPI application with all endpoints
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main router configuration
│   │   ├── context/       # Auth context provider
│   │   ├── components/    # Reusable components
│   │   └── pages/         # Page components
│   │       ├── IntroPage.js
│   │       ├── Home.js
│   │       ├── Booking.js
│   │       └── admin/
│   │           ├── AdminLogin.js
│   │           └── AdminDashboard.js
│   └── package.json
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

## What's Been Implemented (January 28, 2026)

### Phase 1: Project Structure ✅
- Complete project scaffolding
- Backend API with all CRUD endpoints
- Frontend with all pages and routing
- Authentication system with JWT
- Admin panel with full CMS capabilities

### Features Completed
1. **Intro Page** - Animated logo with "Process AI" text and dropping dot
2. **Homepage** - Hero section, Services grid, Horizontal projects scroll, CTA
3. **Booking System** - Detailed form with all requested fields
4. **Admin Panel** - Dashboard, Services/Projects CRUD, Bookings management
5. **Authentication** - JWT with brute force protection

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `GET /api/services` - List services
- `POST/PUT/DELETE /api/services` - Manage services (admin)
- `GET /api/projects` - List projects
- `POST/PUT/DELETE /api/projects` - Manage projects (admin)
- `POST /api/bookings` - Submit booking
- `GET /api/bookings` - List bookings (admin)

## Prioritized Backlog

### P0 - Completed ✅
- [x] Project structure
- [x] Core pages and navigation
- [x] Booking system
- [x] Admin panel with auth
- [x] CMS functionality

### P1 - Next Phase
- [ ] Enhanced animations (parallax effects)
- [ ] 3D hover effects on cards
- [ ] Page transitions
- [ ] About section
- [ ] Contact information

### P2 - Future
- [ ] Email notifications for bookings
- [ ] Image upload for projects
- [ ] Blog/content section
- [ ] Analytics dashboard
- [ ] SEO optimization

## Design Specifications
- **Theme:** Premium dark (deep black/blue backgrounds)
- **Accents:** Neon blue (#00d4ff), Purple (#a855f7)
- **Effects:** Glassmorphism, gradient glows
- **Fonts:** Space Grotesk (display), Inter (body)
- **Animations:** Framer Motion for smooth transitions
