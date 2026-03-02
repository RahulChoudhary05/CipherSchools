const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

// All progress routes are protected
router.use(authMiddleware);

router.post('/attempt', progressController.saveAttempt);
router.get('/', progressController.getUserProgress);
router.get('/assignment/:assignmentId', progressController.getAssignmentProgress);

module.exports = router;
