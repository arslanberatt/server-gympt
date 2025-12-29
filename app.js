require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// CORS configuration for Mobile App & API
const getCorsOrigin = () => {
  const origin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
  if (!origin || origin === 'true' || origin === '*') return true; // Tüm origin'lere izin (mobil uygulamalar için)
  if (origin.includes(',')) return origin.split(',').map(o => o.trim()); // Birden fazla origin
  return origin; // Tek origin
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: process.env.CORS_CREDENTIALS !== 'false', // Varsayılan true
  methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',').map(m => m.trim()) : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS ? process.env.CORS_ALLOWED_HEADERS.split(',').map(h => h.trim()) : ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'], // Mobil uygulamalar için token'ı görebilmek için
  optionsSuccessStatus: 200 // Bazı eski browser'lar için
};

app.use(cors(corsOptions));

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// Health check endpoint (Railway için)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use(authRoutes);
app.use(userRoutes);

// 404 handler for API
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// database connection
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error('⚠️  MONGODB_URI environment variable is not set!');
  console.log('Server will start but database operations will fail.');
}

if (!process.env.JWT_SECRET) {
  console.error('⚠️  JWT_SECRET environment variable is not set!');
  console.log('Authentication will not work properly.');
}

// Start server first, then connect to MongoDB
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Connect to MongoDB after server starts
  if (dbURI) {
    mongoose.connect(dbURI)
      .then(() => {
        console.log('✅ Connected to MongoDB');
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️  Server running without MongoDB connection');
      });
  } else {
    console.log('⚠️  MongoDB URI not provided, skipping connection');
  }
});