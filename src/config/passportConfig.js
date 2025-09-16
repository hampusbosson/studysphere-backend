const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const dotenv = require("dotenv");
dotenv.config();

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const prisma = new PrismaClient();

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email
        },
      });

      if (!user) return done(null, false, { message: 'Incorrect email.' });

      if (!user.isVerified) return done(null, false, { message: 'Email not verified.' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (err) {
      console.error('Error during authentication:', err);
      return done(err);
    }
  }
));

// JWT Strategy
passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: jwtPayload.id } });

      if (!user) return done(null, false);

      return done(null, user);
    } catch (err) {
      console.error('Error during JWT validation:', err);
      return done(err);
    }
  }
));

module.exports = passport;