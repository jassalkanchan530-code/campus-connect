# CampusConnect — Architecture & Implementation Plan

## 1. Folder Structure

### Backend (`/backend`)

```
backend/
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   ├── notificationController.js
│   ├── registrationController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js       # Verify JWT token
│   └── roleMiddleware.js      # Check admin / student role
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── notificationRoutes.js
│   ├── registrationRoutes.js
│   └── userRoutes.js
├── .env
├── package.json
└── server.js                  # Entry point
```

### Frontend (`/frontend`)

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js           # Axios instance with base URL + auth header
│   ├── assets/                # Images, logos
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── events/
│   │   │   ├── EventCard.jsx
│   │   │   └── EventForm.jsx
│   │   ├── notifications/
│   │   │   └── NotificationCard.jsx
│   │   └── admin/
│   │       ├── Sidebar.jsx
│   │       └── StatCard.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state (token, user, role)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── student/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── MyRegistrations.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Profile.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── ManageEvents.jsx
│   │       ├── CreateEvent.jsx
│   │       ├── EditEvent.jsx
│   │       ├── ManageNotifications.jsx
│   │       ├── EventRegistrations.jsx
│   │       └── FormResponses.jsx
│   ├── App.jsx                # Route definitions
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 2. MySQL Database Tables

### `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (bcrypt hashed) |
| `role` | ENUM('student','admin') | DEFAULT 'student' |
| `department` | VARCHAR(100) | NULL |
| `roll_number` | VARCHAR(50) | NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

### `events`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `title` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `venue` | VARCHAR(200) | NOT NULL |
| `event_date` | DATETIME | NOT NULL |
| `last_registration_date` | DATETIME | NULL |
| `max_participants` | INT | NULL |
| `category` | VARCHAR(100) | NULL |
| `image_url` | VARCHAR(500) | NULL |
| `created_by` | INT | FK → users(id) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

### `event_form_fields`
Stores custom registration form fields defined per event.

| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `event_id` | INT | FK → events(id), ON DELETE CASCADE |
| `field_label` | VARCHAR(200) | NOT NULL |
| `field_type` | ENUM('text','number','email','select','textarea') | NOT NULL |
| `field_options` | TEXT | NULL (comma-separated for select) |
| `is_required` | TINYINT(1) | DEFAULT 1 |
| `field_order` | INT | DEFAULT 0 |

---

### `registrations`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `event_id` | INT | FK → events(id), ON DELETE CASCADE |
| `user_id` | INT | FK → users(id), ON DELETE CASCADE |
| `registered_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `status` | ENUM('registered','cancelled') | DEFAULT 'registered' |

> **Unique constraint:** `(event_id, user_id)` — prevents duplicate registrations

---

### `form_responses`
Stores submitted answers for event-specific form fields.

| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `registration_id` | INT | FK → registrations(id), ON DELETE CASCADE |
| `field_id` | INT | FK → event_form_fields(id), ON DELETE CASCADE |
| `answer` | TEXT | NOT NULL |

---

### `notifications`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `title` | VARCHAR(200) | NOT NULL |
| `message` | TEXT | NOT NULL |
| `created_by` | INT | FK → users(id) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 3. Table Relationships

```
users ─────────────────────┐
  │ (created_by)           │ (created_by)
  ↓                        ↓
events                notifications
  │
  ├──→ event_form_fields (1:many — one event has many form fields)
  │
  └──→ registrations (1:many — one event has many registrations)
           │ (user_id FK)
           ↑
         users (1:many — one user has many registrations)
           │
           └──→ form_responses (1:many — one registration has many answers)
                    │ (field_id FK)
                    ↑
              event_form_fields
```

**Summary:**
- `users` → `events`: one admin creates many events
- `events` → `event_form_fields`: one event has many custom form fields
- `users` + `events` → `registrations`: many-to-many through `registrations`
- `registrations` + `event_form_fields` → `form_responses`: stores answers

---

## 4. REST API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Student registration |
| POST | `/api/auth/login` | Public | Login (student + admin) |

### Events (`/api/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/events` | Student + Admin | Get all events |
| GET | `/api/events/:id` | Student + Admin | Get single event with form fields |
| POST | `/api/events` | Admin only | Create event |
| PUT | `/api/events/:id` | Admin only | Update event |
| DELETE | `/api/events/:id` | Admin only | Delete event |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Student + Admin | Get all notifications |
| POST | `/api/notifications` | Admin only | Create notification |
| DELETE | `/api/notifications/:id` | Admin only | Delete notification |

### Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/registrations` | Student | Register for event + submit form |
| GET | `/api/registrations/my` | Student | Get own registrations |
| GET | `/api/registrations/event/:eventId` | Admin | Get all registrations for event |
| GET | `/api/registrations/:id/responses` | Admin | Get form responses for a registration |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Student | View own profile |
| PUT | `/api/users/profile` | Student | Update profile info |

### Admin Dashboard (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Total events, registrations, students, notifications |

---

## 5. Authentication & Role-Based Authorization

### Strategy
- **JWT (JSON Web Tokens)** — stateless, stored in `localStorage` on the frontend.
- On login, the backend issues a JWT containing `{ id, name, role }` with an expiry (e.g. 7 days).

### Backend Middleware

```
authMiddleware.js
  → Reads Authorization: Bearer <token> header
  → Verifies token using JWT_SECRET
  → Attaches decoded user to req.user
  → Rejects with 401 if missing/invalid

roleMiddleware.js
  → Reads req.user.role
  → Allows only if role matches required role (e.g., 'admin')
  → Rejects with 403 Forbidden otherwise
```

### Route Protection Pattern
```
router.get('/stats', authMiddleware, roleMiddleware('admin'), ...)
router.post('/events', authMiddleware, roleMiddleware('admin'), ...)
router.get('/registrations/my', authMiddleware, roleMiddleware('student'), ...)
```

### Frontend Protection
- `AuthContext` stores user info + token in state (loaded from `localStorage`).
- `ProtectedRoute` component wraps routes — redirects to `/login` if not authenticated, or to home if wrong role tries to access admin pages.

---

## 6. Frontend Pages & Components

### Pages

| Page | Path | Role | Description |
|---|---|---|---|
| Login | `/login` | Public | Login form |
| Register | `/register` | Public | Student sign-up |
| Home | `/` | Student | Welcome + upcoming events preview |
| Events | `/events` | Student | All events list |
| Event Detail | `/events/:id` | Student | Full event info + registration form |
| My Registrations | `/my-registrations` | Student | Student's registered events |
| Notifications | `/notifications` | Student | Campus notifications |
| Profile | `/profile` | Student | View/edit profile |
| Admin Dashboard | `/admin` | Admin | Stats overview |
| Manage Events | `/admin/events` | Admin | Events table with edit/delete |
| Create Event | `/admin/events/create` | Admin | Create event + define form fields |
| Edit Event | `/admin/events/:id/edit` | Admin | Edit event details |
| Notifications (Admin) | `/admin/notifications` | Admin | Create / delete notifications |
| Event Registrations | `/admin/events/:id/registrations` | Admin | See who registered |
| Form Responses | `/admin/registrations/:id/responses` | Admin | Individual form submission |

### Key Reusable Components

| Component | Purpose |
|---|---|
| `Navbar` | Top navigation with role-aware links + logout |
| `ProtectedRoute` | Wraps pages — guards by auth + role |
| `EventCard` | Event summary card (image, title, date, venue) |
| `EventForm` | Dynamic form rendered from event form fields |
| `NotificationCard` | Notification display card |
| `Loader` | Spinner for loading states |
| `Sidebar` | Admin panel left navigation |
| `StatCard` | Admin dashboard metric card |

---

## 7. Dependencies

### Backend
```json
"dependencies": {
  "express": "^4.18.x",
  "mysql2": "^3.x.x",
  "jsonwebtoken": "^9.x.x",
  "bcryptjs": "^2.x.x",
  "dotenv": "^16.x.x",
  "cors": "^2.x.x"
}

"devDependencies": {
  "nodemon": "^3.x.x"
}
```

### Frontend
```json
"dependencies": {
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "react-router-dom": "^6.x.x",
  "axios": "^1.x.x",
  "react-icons": "^5.x.x"
}

"devDependencies": {
  "vite": "^5.x.x",
  "@vitejs/plugin-react": "^4.x.x",
  "tailwindcss": "^3.x.x",
  "postcss": "^8.x.x",
  "autoprefixer": "^10.x.x"
}
```

---

## 8. Step-by-Step Implementation Plan

### Phase 1 — Project Setup
1. Initialize Git repository
2. Create `backend/` folder → `npm init` → install backend dependencies
3. Create `frontend/` folder → `npm create vite@latest` → install frontend dependencies
4. Configure Tailwind CSS in Vite project
5. Set up `.env` for backend (DB credentials, JWT secret, port)

### Phase 2 — Database
6. Create MySQL database `campusconnect`
7. Write and run SQL to create all 6 tables with constraints

### Phase 3 — Backend Core
8. Set up `server.js` (Express app, CORS, JSON parsing, route mounting)
9. Set up `config/db.js` MySQL connection pool
10. Implement `authMiddleware.js` and `roleMiddleware.js`

### Phase 4 — Auth APIs
11. Build `authController.js` — register (hash password) + login (issue JWT)
12. Build `authRoutes.js` and test with Postman

### Phase 5 — Events APIs
13. Build `eventController.js` — CRUD + fetch with form fields
14. Build `eventRoutes.js` with auth + role guards

### Phase 6 — Notifications APIs
15. Build `notificationController.js` — create, list, delete
16. Build `notificationRoutes.js`

### Phase 7 — Registrations APIs
17. Build `registrationController.js` — register for event, save form answers, list
18. Build `registrationRoutes.js`

### Phase 8 — User & Admin APIs
19. Build `userController.js` — profile get/update
20. Build admin stats endpoint

### Phase 9 — Frontend Foundation
21. Set up `AuthContext` with login/logout + localStorage persistence
22. Set up `axios.js` instance (base URL, auth header interceptor)
23. Set up `App.jsx` with all routes and `ProtectedRoute`
24. Build `Navbar`, `Footer`, `Loader` components

### Phase 10 — Auth Pages
25. Build `Login.jsx` page
26. Build `Register.jsx` page

### Phase 11 — Student Pages
27. `Home.jsx` — hero section + upcoming events
28. `Events.jsx` — list all events using `EventCard`
29. `EventDetail.jsx` — event info + dynamic `EventForm` + register button
30. `Notifications.jsx` — list notifications
31. `MyRegistrations.jsx` — student's registered events
32. `Profile.jsx` — view and update profile

### Phase 12 — Admin Pages
33. `Sidebar.jsx` layout component for admin
34. `Dashboard.jsx` — stats using `StatCard`
35. `ManageEvents.jsx` — events table with edit/delete
36. `CreateEvent.jsx` — form to create event + add custom form fields
37. `EditEvent.jsx` — pre-fill and update event
38. `ManageNotifications.jsx` — create and delete notifications
39. `EventRegistrations.jsx` — view who registered for an event
40. `FormResponses.jsx` — view submitted form answers

### Phase 13 — Polish & Testing
41. Add loading states and error handling throughout
42. Test all flows end-to-end (register → login → register for event → admin views response)
43. Responsive design check with Tailwind

---

> **Total estimated files:** ~40 backend files + ~35 frontend files  
> **Suggested build order:** Always finish a backend API before building its corresponding frontend page.
