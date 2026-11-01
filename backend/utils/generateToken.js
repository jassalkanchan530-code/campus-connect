const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for the given user object.
 * Payload includes only what the frontend needs: id, name, email, role.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
