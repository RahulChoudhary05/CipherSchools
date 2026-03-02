const UserProgress = require('../models/UserProgress');
const Assignment = require('../models/Assignment');

// Save user attempt
const saveAttempt = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { assignmentId, workspaceId, sqlQuery, isCompleted } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ success: false, error: 'assignmentId is required.' });
    }

    // Find or create progress record
    let progress = await UserProgress.findOne({ userId, assignmentId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        assignmentId,
      });
    }

    progress.sqlQuery = sqlQuery || progress.sqlQuery;
    progress.lastAttempt = new Date();
    progress.attemptCount += 1;

    if (isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Attempt saved successfully.',
      progress,
    });
  } catch (error) {
    console.error('Save attempt error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// Get user progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const progress = await UserProgress.find({ userId })
      .populate('assignmentId', 'title difficulty topic')
      .sort({ lastAttempt: -1 });

    const completedCount = progress.filter(p => p.isCompleted).length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.attemptCount, 0);

    res.status(200).json({
      success: true,
      progress,
      stats: {
        completedCount,
        totalAttempts,
        totalAssignmentsAttempted: progress.length,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// Get progress for specific assignment
const getAssignmentProgress = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { assignmentId } = req.params;

    const progress = await UserProgress.findOne({ userId, assignmentId });

    if (!progress) {
      return res.status(200).json({
        success: true,
        progress: null,
        message: 'No previous attempt found for this assignment.'
      });
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Get assignment progress error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

module.exports = {
  saveAttempt,
  getUserProgress,
  getAssignmentProgress,
};
