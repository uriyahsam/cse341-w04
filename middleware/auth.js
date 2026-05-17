// middleware/auth.js
// Protects routes that require a GitHub OAuth session.
// Returns 401 if the user is not logged in.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({
    error: 'Unauthorized. Please log in first: visit GET /auth/github in your browser.'
  });
};

module.exports = { isAuthenticated };
