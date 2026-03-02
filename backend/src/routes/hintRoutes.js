const express = require('express');
const router = express.Router();
const HintController = require('../controllers/hintController');

// Generate hint for assignment
router.post('/generate', HintController.generateHint);

module.exports = router;
