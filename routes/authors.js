const router = require('express').Router();
const authorsController = require('../controllers/authors');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', authorsController.getAll);
router.get('/:id', authorsController.getSingle);
router.post('/', isAuthenticated, authorsController.createAuthor);
router.put('/:id', isAuthenticated, authorsController.updateAuthor);
router.delete('/:id', isAuthenticated, authorsController.deleteAuthor);

module.exports = router;
