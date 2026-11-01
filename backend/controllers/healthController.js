/**
 * GET /api/health
 * Returns a simple JSON confirming the backend is running.
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusConnect API is up and running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = { getHealth };
