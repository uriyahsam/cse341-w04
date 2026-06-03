const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Library API — Week 04',
    docs: '/api-docs',
    login: '/auth/github',
    authStatus: '/auth/status',
    collections: ['/books', '/authors']
  });
});

router.use('/auth', require('./auth'));
router.use('/books', require('./books'));
router.use('/authors', require('./authors'));

module.exports = router;
