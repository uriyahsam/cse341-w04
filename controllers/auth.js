// controllers/auth.js

// Called after GitHub OAuth succeeds
const loginSuccess = (req, res) => {
  res.status(200).json({
    message: 'Login successful.',
    user: {
      id:          req.user._id,
      displayName: req.user.displayName,
      username:    req.user.username,
      profileUrl:  req.user.profileUrl
    }
  });
};

// GET /auth/logout — destroy session
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully.' });
    });
  });
};

// GET /auth/status — check login state
const status = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      loggedIn: true,
      user: {
        id:          req.user._id,
        displayName: req.user.displayName,
        username:    req.user.username
      }
    });
  }
  res.status(200).json({ loggedIn: false });
};

module.exports = { loginSuccess, logout, status };
