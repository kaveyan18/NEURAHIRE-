const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const analyseRoutes = require('./routes/analyse.routes');
const authRouter = require('./routes/auth');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// 1. Security Headers (hides express, prevents XSS, etc.)
app.use(helmet());

// 2. Strict CORS
// Only allow requests from your frontend domain in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://neurahire-seven.vercel.app'] 
  : ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3. API Rate Limiting
// Limits each IP to 100 requests per 15 minutes to prevent DDoS/Spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// Built-in middleware for json
app.use(express.json());

// Main sub-router
app.use('/api/auth', authRouter);
app.use('/api/analyse', analyseRoutes);
app.use('/api/payments', paymentRoutes);

module.exports = app;

// force restart
