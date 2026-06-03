const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in at /auth/github to access this route.' });
};

module.exports = { isAuthenticated };
