// routes/authors.js
const router = require('express').Router();
const authorsController = require('../controllers/authors');
const { isAuthenticated } = require('../middleware/auth');

// Public
router.get('/',    authorsController.getAll);
router.get('/:id', authorsController.getSingle);

// Protected — requires GitHub OAuth login
router.post('/',    isAuthenticated, authorsController.createAuthor);
router.put('/:id',  isAuthenticated, authorsController.updateAuthor);
router.delete('/:id', isAuthenticated, authorsController.deleteAuthor);

module.exports = router;
