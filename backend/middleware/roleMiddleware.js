/**
 * roleMiddleware.js — Role-based access control middleware.
 * Call AFTER authMiddleware so req.user is already populated.
 *
 * Usage:
 *   router.get('/admin-only',  authMiddleware, roleMiddleware('admin'),       handler)
 *   router.get('/super-admin', authMiddleware, roleMiddleware('super_admin'), handler)
 *
 * Multiple roles allowed:
 *   roleMiddleware('admin', 'super_admin')  — accepts either role
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
