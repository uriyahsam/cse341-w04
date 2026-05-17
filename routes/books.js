// routes/books.js
const router = require('express').Router();
const booksController = require('../controllers/books');
const { isAuthenticated } = require('../middleware/auth');

// Public
router.get('/',    booksController.getAll);
router.get('/:id', booksController.getSingle);

// Protected — requires GitHub OAuth login
router.post('/',    isAuthenticated, booksController.createBook);
router.put('/:id',  isAuthenticated, booksController.updateBook);
router.delete('/:id', isAuthenticated, booksController.deleteBook);

module.exports = router;
