// routes/index.js
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Library API — Week 04 (OAuth)',
    docs:    '/api-docs',
    auth: {
      login:  'Open in browser → GET /auth/github',
      status: 'GET /auth/status',
      logout: 'GET /auth/logout'
    },
    collections: ['/books', '/authors']
  });
});

router.use('/auth',    require('./auth'));
router.use('/books',   require('./books'));
router.use('/authors', require('./authors'));

module.exports = router;
