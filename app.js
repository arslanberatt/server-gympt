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

// database connection
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/node-auth';

mongoose.connect(dbURI)
  .then((result) => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err.message);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  });

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);
app.use(userRoutes);