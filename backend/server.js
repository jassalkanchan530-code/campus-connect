require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes        = require('./routes/healthRoutes');
const authRoutes          = require('./routes/authRoutes');
const eventRoutes         = require('./routes/eventRoutes');
const registrationRoutes  = require('./routes/registrationRoutes');
const superAdminRoutes    = require('./routes/superAdminRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');
const userRoutes          = require('./routes/userRoutes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api',                    healthRoutes);
app.use('/api/auth',               authRoutes);
app.use('/api/events',             eventRoutes);
app.use('/api/registrations',      registrationRoutes);
app.use('/api/super-admin/admins', superAdminRoutes);
app.use('/api/notifications',      notificationRoutes);
app.use('/api/users',              userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CampusConnect backend running on http://localhost:${PORT}`);
});
