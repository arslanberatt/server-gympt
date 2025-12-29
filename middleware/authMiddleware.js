const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        // API request ise JSON döndür
        if (req.path.startsWith('/api') || req.headers['content-type']?.includes('application/json')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        res.redirect('/login');
      } else {
        try {
          const user = await User.findById(decodedToken.id);
          req.user = user;
          next();
        } catch (error) {
          if (req.path.startsWith('/api') || req.headers['content-type']?.includes('application/json')) {
            return res.status(401).json({ error: 'User not found' });
          }
          res.redirect('/login');
        }
      }
    });
  } else {
    // API request ise JSON döndür
    if (req.path.startsWith('/api') || req.headers['content-type']?.includes('application/json')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };