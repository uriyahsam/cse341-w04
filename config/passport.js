const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongodb = require('../db/connect');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = mongodb.getDb().db();
        const users = db.collection('users');

        let user = await users.findOne({ githubId: profile.id });

        if (!user) {
          const result = await users.insertOne({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            email: (profile.emails && profile.emails[0]) ? profile.emails[0].value : null,
            avatarUrl: (profile.photos && profile.photos[0]) ? profile.photos[0].value : null,
            createdAt: new Date().toISOString()
          });
          user = await users.findOne({ _id: result.insertedId });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = mongodb.getDb().db();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
