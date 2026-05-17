// routes/auth.js
const router      = require('express').Router();
const passport    = require('passport');
const authCtrl    = require('../controllers/auth');

// Step 1 — redirect user to GitHub to authorize
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Step 2 — GitHub redirects here with a code; Passport exchanges it for a token
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/api-docs' }),
  authCtrl.loginSuccess
);

// Check current session state
router.get('/status', authCtrl.status);

// Destroy session
router.get('/logout', authCtrl.logout);

module.exports = router;
