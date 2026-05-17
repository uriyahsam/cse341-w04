const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

// ── Validation helper ──────────────────────────────────────────────────────────
const REQUIRED_FIELDS = ['title', 'author', 'genre', 'publishedYear', 'isbn', 'language', 'pageCount', 'availableCopies'];

const validateBook = (body) => {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`"${field}" is required.`);
    }
  }

  if (body.publishedYear !== undefined) {
    const year = Number(body.publishedYear);
    if (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear()) {
      errors.push(`"publishedYear" must be a valid year between 1000 and ${new Date().getFullYear()}.`);
    }
  }

  if (body.pageCount !== undefined && (!Number.isInteger(Number(body.pageCount)) || Number(body.pageCount) < 1)) {
    errors.push('"pageCount" must be a positive integer.');
  }

  if (body.availableCopies !== undefined && (!Number.isInteger(Number(body.availableCopies)) || Number(body.availableCopies) < 0)) {
    errors.push('"availableCopies" must be a non-negative integer.');
  }

  if (body.isbn !== undefined && typeof body.isbn === 'string') {
    const clean = body.isbn.replace(/-/g, '');
    if (!/^\d{10}$|^\d{13}$/.test(clean)) {
      errors.push('"isbn" must be a valid 10 or 13 digit ISBN.');
    }
  }

  return errors;
};

// ── GET ALL ────────────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const db = mongodb.getDb().db();
    const books = await db.collection('books').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve books.', details: err.message });
  }
};

// ── GET SINGLE ─────────────────────────────────────────────────────────────────
const getSingle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format. Must be a 24-character hex string.' });
    }

    const db = mongodb.getDb().db();
    const book = await db.collection('books').findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ error: `No book found with id: ${id}` });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve book.', details: err.message });
  }
};

// ── CREATE ─────────────────────────────────────────────────────────────────────
const createBook = async (req, res) => {
  try {
    const validationErrors = validateBook(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: validationErrors });
    }

    const { title, author, genre, publishedYear, isbn, language, pageCount, availableCopies, synopsis } = req.body;

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      publishedYear: Number(publishedYear),
      isbn: isbn.replace(/-/g, ''),
      language: language.trim(),
      pageCount: Number(pageCount),
      availableCopies: Number(availableCopies),
      synopsis: synopsis ? synopsis.trim() : '',
      createdAt: new Date().toISOString()
    };

    const db = mongodb.getDb().db();
    const result = await db.collection('books').insertOne(newBook);

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create book.', details: err.message });
  }
};

// ── UPDATE ─────────────────────────────────────────────────────────────────────
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format. Must be a 24-character hex string.' });
    }

    const validationErrors = validateBook(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: validationErrors });
    }

    const { title, author, genre, publishedYear, isbn, language, pageCount, availableCopies, synopsis } = req.body;

    const updatedBook = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      publishedYear: Number(publishedYear),
      isbn: isbn.replace(/-/g, ''),
      language: language.trim(),
      pageCount: Number(pageCount),
      availableCopies: Number(availableCopies),
      synopsis: synopsis ? synopsis.trim() : '',
      updatedAt: new Date().toISOString()
    };

    const db = mongodb.getDb().db();
    const result = await db.collection('books').replaceOne({ _id: new ObjectId(id) }, updatedBook);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `No book found with id: ${id}` });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book.', details: err.message });
  }
};

// ── DELETE ─────────────────────────────────────────────────────────────────────
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format. Must be a 24-character hex string.' });
    }

    const db = mongodb.getDb().db();
    const result = await db.collection('books').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No book found with id: ${id}` });
    }

    res.status(200).json({ message: 'Book deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book.', details: err.message });
  }
};

module.exports = { getAll, getSingle, createBook, updateBook, deleteBook };
