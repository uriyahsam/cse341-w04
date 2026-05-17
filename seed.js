// seed.js — Inserts sample data into both collections
// Usage: node seed.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const books = [
  {
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    genre: 'Literary Fiction',
    publishedYear: 1958,
    isbn: '9780385474542',
    language: 'English',
    pageCount: 209,
    availableCopies: 5,
    synopsis: 'A story about pre-colonial life in southeast Nigeria and the arrival of Europeans.',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    genre: 'Historical Fiction',
    publishedYear: 2006,
    isbn: '9781400044160',
    language: 'English',
    pageCount: 433,
    availableCopies: 3,
    synopsis: 'Set in Nigeria during the Biafran War, this novel follows three characters.',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Purple Hibiscus',
    author: 'Chimamanda Ngozi Adichie',
    genre: 'Coming-of-Age',
    publishedYear: 2003,
    isbn: '9781616953638',
    language: 'English',
    pageCount: 307,
    availableCopies: 4,
    synopsis: 'A story of a Nigerian family torn apart by religious fanaticism.',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Homegoing',
    author: 'Yaa Gyasi',
    genre: 'Historical Fiction',
    publishedYear: 2016,
    isbn: '9781101971062',
    language: 'English',
    pageCount: 320,
    availableCopies: 6,
    synopsis: 'A multigenerational saga following descendants of two half-sisters from Ghana.',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Season of Migration to the North',
    author: 'Tayeb Salih',
    genre: 'Literary Fiction',
    publishedYear: 1966,
    isbn: '9780894771668',
    language: 'English',
    pageCount: 139,
    availableCopies: 2,
    synopsis: 'A Sudanese novel exploring colonialism and identity.',
    createdAt: new Date().toISOString()
  }
];

const authors = [
  {
    firstName: 'Chinua',
    lastName: 'Achebe',
    nationality: 'Nigerian',
    birthYear: 1930,
    genre: 'Literary Fiction',
    email: 'chinua.achebe@example.com',
    booksPublished: 21,
    biography: 'Chinua Achebe was a Nigerian novelist, poet, and critic widely regarded as a dominant figure in modern African literature.',
    createdAt: new Date().toISOString()
  },
  {
    firstName: 'Chimamanda',
    lastName: 'Ngozi Adichie',
    nationality: 'Nigerian',
    birthYear: 1977,
    genre: 'Literary Fiction',
    email: 'chimamanda.adichie@example.com',
    booksPublished: 8,
    biography: 'Chimamanda Ngozi Adichie is a Nigerian author and feminist whose works have been translated into 30 languages.',
    createdAt: new Date().toISOString()
  },
  {
    firstName: 'Yaa',
    lastName: 'Gyasi',
    nationality: 'Ghanaian-American',
    birthYear: 1989,
    genre: 'Historical Fiction',
    email: 'yaa.gyasi@example.com',
    booksPublished: 3,
    biography: 'Yaa Gyasi is a Ghanaian-American author known for her debut novel Homegoing.',
    createdAt: new Date().toISOString()
  },
  {
    firstName: 'Tayeb',
    lastName: 'Salih',
    nationality: 'Sudanese',
    birthYear: 1929,
    genre: 'Literary Fiction',
    email: 'tayeb.salih@example.com',
    booksPublished: 5,
    biography: 'Tayeb Salih was a Sudanese novelist regarded as one of the most important Arab writers of the 20th century.',
    createdAt: new Date().toISOString()
  },
  {
    firstName: 'Ama Ata',
    lastName: 'Aidoo',
    nationality: 'Ghanaian',
    birthYear: 1942,
    genre: 'Drama & Fiction',
    email: 'amaata.aidoo@example.com',
    booksPublished: 12,
    biography: 'Ama Ata Aidoo was a Ghanaian author, poet, playwright, and academic known for her feminist works.',
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Clear existing data
    await db.collection('books').deleteMany({});
    await db.collection('authors').deleteMany({});
    console.log('Cleared existing data.');

    const booksResult = await db.collection('books').insertMany(books);
    console.log(`Inserted ${booksResult.insertedCount} books.`);

    const authorsResult = await db.collection('authors').insertMany(authors);
    console.log(`Inserted ${authorsResult.insertedCount} authors.`);

    console.log('\nSeed complete! Sample IDs:');
    console.log('Book ID:', Object.values(booksResult.insertedIds)[0].toString());
    console.log('Author ID:', Object.values(authorsResult.insertedIds)[0].toString());
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();
