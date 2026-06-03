const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('./config/passport');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS — must come first, allow credentials so session cookie passes through
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());

// Session (must come before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'none',   // required for cross-origin requests from Swagger UI
      secure: true        // required when sameSite is 'none'
    }
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
