const express = require('express');
const router = express.Router();
const QueryController = require('../controllers/queryController');

// Execute SQL query
router.post('/execute', QueryController.executeQuery);

// Run query and validate against expected output (test cases)
router.post('/validate', QueryController.validateQuery);

module.exports = router;
