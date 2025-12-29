const User = require('../models/User');
const DailyNutrition = require('../models/DailyNutrition');

// GET /me - Get current user profile
module.exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /me - Update user profile (name)
module.exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name !== undefined) {
      user.name = name;
    }
    
    await user.save();
    
    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name || '',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /me/nutrition - Get daily nutrition data
module.exports.getNutrition = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const userId = req.user._id;
    
    if (date) {
      // Get specific date
      const nutrition = await DailyNutrition.findOne({ user: userId, date: date });
      if (nutrition) {
        res.status(200).json(nutrition);
      } else {
        res.status(200).json({
          date: date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });
      }
    } else if (startDate && endDate) {
      // Get date range
      const nutrition = await DailyNutrition.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
      res.status(200).json(nutrition);
    } else {
      // Get all nutrition data (sorted by date descending - newest first)
      const nutrition = await DailyNutrition.find({ user: userId })
        .sort({ date: -1 });
      res.status(200).json(nutrition);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /me/nutrition - Add or update daily nutrition
module.exports.addNutrition = async (req, res) => {
  try {
    const { date, calories, protein, carbs, fat } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const userId = req.user._id;
    
    // Check if entry exists for this date
    let nutrition = await DailyNutrition.findOne({ user: userId, date: date });
    
    if (nutrition) {
      // Update existing entry
      if (calories !== undefined) nutrition.calories = calories;
      if (protein !== undefined) nutrition.protein = protein;
      if (carbs !== undefined) nutrition.carbs = carbs;
      if (fat !== undefined) nutrition.fat = fat;
      await nutrition.save();
      
      res.status(200).json({
        message: 'Nutrition updated successfully',
        nutrition: nutrition
      });
    } else {
      // Create new entry
      nutrition = await DailyNutrition.create({
        user: userId,
        date: date,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0
      });
      
      res.status(201).json({
        message: 'Nutrition added successfully',
        nutrition: nutrition
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Nutrition entry already exists for this date' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /me/nutrition/:date - Update specific date nutrition
module.exports.updateNutrition = async (req, res) => {
  try {
    const { date } = req.params;
    const { calories, protein, carbs, fat } = req.body;
    const userId = req.user._id;
    
    const nutrition = await DailyNutrition.findOne({ user: userId, date: date });
    
    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition data not found for this date' });
    }
    
    if (calories !== undefined) nutrition.calories = calories;
    if (protein !== undefined) nutrition.protein = protein;
    if (carbs !== undefined) nutrition.carbs = carbs;
    if (fat !== undefined) nutrition.fat = fat;
    
    await nutrition.save();
    
    res.status(200).json({
      message: 'Nutrition updated successfully',
      nutrition: nutrition
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

