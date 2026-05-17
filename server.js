// server.js
const express          = require('express');
const session          = require('express-session');
const passport         = require('passport');
const GitHubStrategy   = require('passport-github2').Strategy;
const MongoStore       = require('connect-mongo').MongoStore;
const mongodb          = require('./db/connect');
const swaggerUi        = require('swagger-ui-express');
const swaggerDocument  = require('./swagger.json');
require('dotenv').config();

const app  = express();
const port = process.env.PORT || 3000;

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Session (persisted to MongoDB so Render restarts don't log everyone out) ──
app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl:      24 * 60 * 60   // 1 day
  }),
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   24 * 60 * 60 * 1000
  }
}));

// ── Passport: GitHub OAuth strategy ───────────────────────────────────────────
passport.use(new GitHubStrategy(
  {
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db   = mongodb.getDb().db();
      const user = {
        githubId:    profile.id,
        username:    profile.username,
        displayName: profile.displayName || profile.username,
        profileUrl:  profile.profileUrl,
        lastLogin:   new Date().toISOString()
      };
      // Create or update user record
      await db.collection('users').updateOne(
        { githubId: profile.id },
        { $set: user },
        { upsert: true }
      );
      const savedUser = await db.collection('users').findOne({ githubId: profile.id });
      return done(null, savedUser);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const { ObjectId } = require('mongodb');
    const db   = mongodb.getDb().db();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Swagger ────────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/', require('./routes'));

// ── Connect DB then start server ───────────────────────────────────────────────
mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`Connected to MongoDB. Server running on port ${port}`);
      console.log(`API Docs:  http://localhost:${port}/api-docs`);
      console.log(`OAuth:     http://localhost:${port}/auth/github`);
    });
  }
});
