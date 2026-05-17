const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

// ── Validation helper ──────────────────────────────────────────────────────────
const REQUIRED_FIELDS = ['firstName', 'lastName', 'nationality', 'birthYear', 'genre', 'email', 'booksPublished'];

const validateAuthor = (body) => {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`"${field}" is required.`);
    }
  }

  if (body.birthYear !== undefined) {
    const year = Number(body.birthYear);
    if (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear()) {
      errors.push(`"birthYear" must be a valid year.`);
    }
  }

  if (body.booksPublished !== undefined && (!Number.isInteger(Number(body.booksPublished)) || Number(body.booksPublished) < 0)) {
    errors.push('"booksPublished" must be a non-negative integer.');
  }

  if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('"email" must be a valid email address.');
  }

  return errors;
};

// ── GET ALL ────────────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const db = mongodb.getDb().db();
    const authors = await db.collection('authors').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve authors.', details: err.message });
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
    const author = await db.collection('authors').findOne({ _id: new ObjectId(id) });

    if (!author) {
      return res.status(404).json({ error: `No author found with id: ${id}` });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(author);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve author.', details: err.message });
  }
};

// ── CREATE ─────────────────────────────────────────────────────────────────────
const createAuthor = async (req, res) => {
  try {
    const validationErrors = validateAuthor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: validationErrors });
    }

    const { firstName, lastName, nationality, birthYear, genre, email, booksPublished, biography } = req.body;

    const newAuthor = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationality: nationality.trim(),
      birthYear: Number(birthYear),
      genre: genre.trim(),
      email: email.trim().toLowerCase(),
      booksPublished: Number(booksPublished),
      biography: biography ? biography.trim() : '',
      createdAt: new Date().toISOString()
    };

    const db = mongodb.getDb().db();
    const result = await db.collection('authors').insertOne(newAuthor);

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create author.', details: err.message });
  }
};

// ── UPDATE ─────────────────────────────────────────────────────────────────────
const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format. Must be a 24-character hex string.' });
    }

    const validationErrors = validateAuthor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: validationErrors });
    }

    const { firstName, lastName, nationality, birthYear, genre, email, booksPublished, biography } = req.body;

    const updatedAuthor = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationality: nationality.trim(),
      birthYear: Number(birthYear),
      genre: genre.trim(),
      email: email.trim().toLowerCase(),
      booksPublished: Number(booksPublished),
      biography: biography ? biography.trim() : '',
      updatedAt: new Date().toISOString()
    };

    const db = mongodb.getDb().db();
    const result = await db.collection('authors').replaceOne({ _id: new ObjectId(id) }, updatedAuthor);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `No author found with id: ${id}` });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update author.', details: err.message });
  }
};

// ── DELETE ─────────────────────────────────────────────────────────────────────
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format. Must be a 24-character hex string.' });
    }

    const db = mongodb.getDb().db();
    const result = await db.collection('authors').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No author found with id: ${id}` });
    }

    res.status(200).json({ message: 'Author deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete author.', details: err.message });
  }
};

module.exports = { getAll, getSingle, createAuthor, updateAuthor, deleteAuthor };
