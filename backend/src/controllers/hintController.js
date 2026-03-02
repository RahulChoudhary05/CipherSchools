const LLMService = require('../services/llmService');
const Assignment = require('../models/Assignment');

class HintController {
  static async generateHint(req, res) {
    try {
      const { assignmentId, userQuery } = req.body;

      if (!assignmentId) {
        return res.status(400).json({ success: false, error: 'assignmentId is required.' });
      }

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ success: false, error: 'Assignment not found.' });
      }

      const hint = await LLMService.generateHint(
        assignment.question,
        userQuery || '',
        {
          title: assignment.title,
          difficulty: assignment.difficulty,
          topic: assignment.topic || 'SQL',
          tables: assignment.sampleTables.map(t => ({
            name: t.tableName,
            columns: t.columns
          }))
        }
      );

      return res.json({ success: true, data: { hint } });
    } catch (err) {
      console.error('Hint generation error:', err.message);
      const statusCode = err.message?.toLowerCase().includes('gemini') ? 503 : 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to generate hint. Please try again.'
      });
    }
  }
}

module.exports = HintController;
