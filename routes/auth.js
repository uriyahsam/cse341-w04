const router = require('express').Router();
const passport = require('passport');

// Initiate GitHub OAuth login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    res.redirect('/auth/status');
  }
);

// Check login status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      loggedIn: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl
      }
    });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully.' });
    });
  });
});

// OAuth failure fallback
router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'GitHub OAuth authentication failed.' });
});

module.exports = router;
