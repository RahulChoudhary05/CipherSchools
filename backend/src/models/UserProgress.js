const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  sqlQuery: {
    type: String
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  attemptCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
userProgressSchema.index({ userId: 1, assignmentId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
