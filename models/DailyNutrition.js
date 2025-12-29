const mongoose = require('mongoose');

const dailyNutritionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
dailyNutritionSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyNutrition = mongoose.model('DailyNutrition', dailyNutritionSchema);

module.exports = DailyNutrition;

