import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout       from '../layouts/MainLayout';
import AdminLayout      from '../layouts/AdminLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import ProtectedRoute   from '../components/common/ProtectedRoute';

// ── Auth ──────────────────────────────────────────────────────────────────────
import Login    from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// ── Student ───────────────────────────────────────────────────────────────────
import Home               from '../pages/Home';
import StudentDashboard   from '../pages/student/StudentDashboard';
import Events             from '../pages/student/Events';
import EventDetail        from '../pages/student/EventDetail';
import RegisterEvent      from '../pages/student/RegisterEvent';
import MyRegistrations    from '../pages/student/MyRegistrations';
import RegistrationDetail from '../pages/student/RegistrationDetail';
import Notifications      from '../pages/student/Notifications';
import Profile            from '../pages/student/Profile';

// ── Admin ─────────────────────────────────────────────────────────────────────
import Dashboard           from '../pages/admin/Dashboard';
import ManageEvents        from '../pages/admin/ManageEvents';
import CreateEvent         from '../pages/admin/CreateEvent';
import EditEvent           from '../pages/admin/EditEvent';
import ManageFormFields    from '../pages/admin/ManageFormFields';
import EventRegistrations  from '../pages/admin/EventRegistrations';
import ManageNotifications from '../pages/admin/ManageNotifications';

// ── Super Admin ───────────────────────────────────────────────────────────────
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import AdminManagement     from '../pages/superadmin/AdminManagement';
import AuditLogs           from '../pages/superadmin/AuditLogs';

// ── Shared ────────────────────────────────────────────────────────────────────
import Unauthorized from '../pages/Unauthorized';

const AppRoutes = () => (
  <Routes>
    {/* ── Public + Student routes (MainLayout) ─────────────────────────────── */}
    <Route element={<MainLayout />}>
      {/* Fully public */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public event browsing — no login required */}
      <Route path="/events"     element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />

      {/* Student-only pages */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>}
      />
      <Route
        path="/events/:id/register"
        element={<ProtectedRoute role="student"><RegisterEvent /></ProtectedRoute>}
      />
      <Route
        path="/my-registrations"
        element={<ProtectedRoute role="student"><MyRegistrations /></ProtectedRoute>}
      />
      <Route
        path="/registrations/:id"
        element={<ProtectedRoute role="student"><RegistrationDetail /></ProtectedRoute>}
      />
      <Route
        path="/notifications"
        element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>}
      />

      {/* Shared utility pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Route>

    {/* ── Admin routes (AdminLayout handles auth guard) ───────────────────── */}
    <Route element={<AdminLayout />}>
      <Route path="/admin"                                element={<Dashboard />} />
      <Route path="/admin/dashboard"                      element={<Dashboard />} />
      <Route path="/admin/events"                         element={<ManageEvents />} />
      <Route path="/admin/events/create"                  element={<CreateEvent />} />
      <Route path="/admin/events/:id/edit"                element={<EditEvent />} />
      <Route path="/admin/events/:id/form-fields"         element={<ManageFormFields />} />
      <Route path="/admin/events/:id/registrations"       element={<EventRegistrations />} />
      <Route path="/admin/notifications"                  element={<ManageNotifications />} />
    </Route>

    {/* ── Super Admin routes (SuperAdminLayout handles auth guard) ────────── */}
    <Route element={<SuperAdminLayout />}>
      <Route path="/super-admin/dashboard"     element={<SuperAdminDashboard />} />
      <Route path="/super-admin/admins"        element={<AdminManagement />} />
      <Route path="/super-admin/events"        element={<ManageEvents />} />
      <Route path="/super-admin/audit-logs"    element={<AuditLogs />} />
      <Route path="/super-admin/notifications" element={<ManageNotifications />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
