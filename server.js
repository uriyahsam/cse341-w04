const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('./config/passport');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Session (must come before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/', require('./routes'));

// Start server after DB connects
mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`Connected to MongoDB. Server running on port ${port}`);
      console.log(`API Docs: http://localhost:${port}/api-docs`);
      console.log(`Login:    http://localhost:${port}/auth/github`);
    });
  }
});
