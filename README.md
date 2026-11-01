# CampusConnect

A campus event management portal built with **React + Node.js + MySQL**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+

### Backend Setup

```bash
cd backend
npm install
# Copy .env.example to .env and set your DB credentials
cp .env.example .env
# Run the database schema
mysql -u root -p campusconnect < config/schema.sql
# Seed test data (idempotent — safe to run multiple times)
npm run seed
# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Development / Test Credentials

> **⚠️ IMPORTANT: These credentials are for DEVELOPMENT and TESTING only.**
> **Never use in production.**

### Admin Account

| Field    | Value             |
|----------|-------------------|
| Email    | admin@test.com    |
| Password | Admin@123         |
| Role     | admin             |

### Student Account

| Field    | Value              |
|----------|--------------------|
| Email    | student@test.com   |
| Password | Student@123        |
| Role     | student            |

### Student 2 Account

| Field    | Value               |
|----------|---------------------|
| Email    | student2@test.com   |
| Password | Student@1234        |
| Role     | student             |

---

## 📅 Test Events

The seed script creates 3 test events:

| Title             | Category  | Notes                           |
|-------------------|-----------|---------------------------------|
| Hackathon 2026    | Technical | Has 4 dynamic form fields       |
| Cultural Fest 2026 | Cultural | No custom form (simple confirm) |
| Sports Meet 2026  | Sports    | No custom form (simple confirm) |

**Hackathon 2026 form fields:**
- Full Name (text, required)
- Email (email, required)
- Department (select: CSE, MCA, BCA, MBA, Other — required)
- Why do you want to participate? (textarea, optional)

---

## 🛠️ Backend Scripts

```bash
npm run dev        # Start with nodemon (auto-restart)
npm run start      # Start production server
npm run seed       # Seed all test data (idempotent)
npm run seed:admin # Seed only admin account (original script)
```

---

## 🏗️ Architecture

```
campusconnect/
├── backend/
│   ├── config/
│   │   ├── db.js           # MySQL connection pool
│   │   └── schema.sql      # Database schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── registrationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── roleMiddleware.js   # Role-based access control
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   ├── scripts/
│   │   ├── seedAdmin.js    # Admin-only seed
│   │   └── seedAll.js      # Full development seed
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── components/
        │   ├── admin/Sidebar.jsx
        │   ├── common/{Navbar, ProtectedRoute, Loader}.jsx
        │   ├── events/EventCard.jsx
        │   └── registration/RegistrationForm.jsx
        ├── context/AuthContext.jsx
        ├── layouts/{MainLayout, AdminLayout}.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Unauthorized.jsx
        │   ├── admin/{Dashboard, ManageEvents, CreateEvent, EditEvent, ManageFormFields, EventRegistrations}.jsx
        │   ├── auth/{Login, Register}.jsx
        │   └── student/{Events, EventDetail, RegisterEvent, MyRegistrations, RegistrationDetail}.jsx
        ├── routes/AppRoutes.jsx
        └── services/{authService, eventService, registrationService}.js
```

---

## 🔒 Role-Based Access Control

### Public Routes
- `/` — Home page
- `/login` — Login
- `/register` — Student registration
- `/events` — Browse events (no login required)
- `/events/:id` — Event detail (no login required)

### Student-Only Routes (requires `role=student`)
- `/events/:id/register` — Register for event
- `/my-registrations` — View own registrations
- `/registrations/:id` — Registration detail
- `/profile` — Profile (Phase 5+)
- `/notifications` — Notifications (Phase 5+)

### Admin-Only Routes (requires `role=admin`)
- `/admin` — Dashboard
- `/admin/events` — Manage events
- `/admin/events/create` — Create event
- `/admin/events/:id/edit` — Edit event
- `/admin/events/:id/form-fields` — Manage form fields
- `/admin/events/:id/registrations` — View registrations
- `/admin/notifications` — Notifications (Phase 5+)

---

## 🔑 JWT Token

JWT payload: `{ id, name, email, role }`

Expiry: 7 days (configurable via `JWT_EXPIRES_IN`)

---

## 🌱 Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=campusconnect
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
