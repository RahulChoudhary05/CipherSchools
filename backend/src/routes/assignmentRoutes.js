const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignmentController');

// Get all assignments (list view)
router.get('/', AssignmentController.getAllAssignments);

// Get single assignment with full details
router.get('/:id', AssignmentController.getAssignmentById);

// Create new assignment (for admin/seeding)
router.post('/', AssignmentController.createAssignment);

// Cleanup workspace after user is done
router.delete('/workspace/:workspaceId', AssignmentController.cleanupWorkspace);

module.exports = router;
