import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Configure Passport.js with Google OAuth 2.0 strategy.
 */
export function configurePassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          displayName: profile.displayName || 'User',
          avatar: profile.photos?.[0]?.value || '',
          lastLogin: new Date(),
        });
      }

      // Never store Google tokens
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

/**
 * Helper to bypass Google OAuth in development / mock mode.
 */
async function mockAuthBypass(req, res, next) {
  try {
    let user = await User.findOne({ googleId: 'mock-google-id' });
    if (!user) {
      user = await User.create({
        googleId: 'mock-google-id',
        email: 'demo.user@example.com',
        displayName: 'Demo User (Mock)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mockuser',
        lastLogin: new Date(),
        preferredLang: 'en',
        location: {
          lat: 28.6139,
          lng: 77.2090,
          city: 'New Delhi',
          state: 'Delhi',
        },
        emergencyContacts: [
          { name: 'Ravi Kumar', relationship: 'Brother', phone: '9876543210' },
        ],
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/'));
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Initiate Google OAuth login.
 */
export const googleLogin = (req, res, next) => {
  if (process.env.MOCK_DB === 'true') {
    return mockAuthBypass(req, res, next);
  }
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
};

/**
 * Google OAuth callback handler.
 */
export const googleCallback = (req, res, next) => {
  if (process.env.MOCK_DB === 'true') {
    return res.redirect(process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/'));
  }
  return passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/'),
  })(req, res, next);
};

/**
 * After successful OAuth callback, redirect to frontend.
 */
export const googleCallbackRedirect = (req, res) => {
  res.redirect(process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/'));
};

/**
 * Get current authenticated user.
 */
export const getMe = (req, res) => {
  if (req.isAuthenticated() && req.user) {
    return res.json({
      success: true,
      data: {
        _id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        avatar: req.user.avatar,
        preferredLang: req.user.preferredLang,
        location: req.user.location,
        emergencyContacts: req.user.emergencyContacts,
        createdAt: req.user.createdAt,
      },
    });
  }
  return res.json({ success: true, data: null });
};

/**
 * Logout — destroy session.
 */
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed', code: 500 });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Session destroy failed', code: 500 });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, data: { message: 'Logged out successfully' } });
    });
  });
};
