const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Library API — Week 03',
    docs: '/api-docs',
    collections: ['/books', '/authors']
  });
});

router.use('/books', require('./books'));
router.use('/authors', require('./authors'));

module.exports = router;
