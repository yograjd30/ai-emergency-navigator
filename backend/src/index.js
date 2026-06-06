import 'dotenv/config';
import mongoose from 'mongoose';
import { setupMockMongoose } from './lib/mockMongoose.js';

const isMockDB = process.env.MOCK_DB !== 'false';
if (isMockDB) {
  setupMockMongoose(mongoose);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { connectDB } from './lib/db.js';
import { configurePassport } from './controllers/auth.controller.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import triageRoutes from './routes/triage.routes.js';
import helplineRoutes from './routes/helpline.routes.js';
import procedureRoutes from './routes/procedure.routes.js';
import sessionRoutes from './routes/session.routes.js';
import nearbyRoutes from './routes/nearby.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security & Parsing ---
app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://ai-emergency-navigator.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked for origin: ${origin}. Allowed:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// --- Sessions ---
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
};

if (isMockDB) {
  console.log('ℹ️ Using MemoryStore for express-session (Mock Mode)');
} else {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 7 * 24 * 60 * 60, // 7 days
  });
}

app.use(session(sessionConfig));

// --- Passport ---
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/helplines', helplineRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/feedback', feedbackRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 404 });
});

// --- Global Error Handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: err.status || 500,
  });
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const start = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚨 SOS Nav API running on port ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  };
  start();
} else {
  // In Vercel serverless environment, connect on first load
  connectDB().catch(err => console.error('Database connection failed:', err));
}

export default app;
