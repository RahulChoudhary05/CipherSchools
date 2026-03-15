const Assignment = require('../models/Assignment');
const { pgPool } = require('../config/database');

class AssignmentController {
  // Get all assignments (listing page - no heavy data)
  static async getAllAssignments(req, res) {
    try {
      const { difficulty, topic, search } = req.query;
      const filter = {};
      if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) filter.difficulty = difficulty;
      if (topic) filter.topic = new RegExp(topic, 'i');
      if (search) filter.title = new RegExp(search, 'i');

      const assignments = await Assignment.find(filter)
        .select('title description difficulty topic sampleTables.tableName sampleTables.columns createdAt')
        .sort({ difficulty: 1, createdAt: 1 });

      return res.json({ success: true, count: assignments.length, data: assignments });
    } catch (err) {
      console.error('getAllAssignments error:', err);
      return res.status(500).json({ success: false, error: 'Failed to load assignments.' });
    }
  }

  // Get single assignment with full details + create isolated workspace
  static async getAssignmentById(req, res) {
    const { id } = req.params;
    const client = await pgPool.connect();

    try {
      const assignment = await Assignment.findById(id)
        .select('+starterSql');
      if (!assignment) {
        return res.status(404).json({ success: false, error: 'Assignment not found.' });
      }

      // Generate a safe, unique workspace schema name
      const workspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      try {
        // Create isolated schema for this session
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${workspaceId}"`);

        // Insert tables and data for this assignment
        for (const table of assignment.sampleTables) {
          const safeName = table.tableName.replace(/[^a-zA-Z0-9_]/g, '_');

          // Build CREATE TABLE SQL
          const colDefs = table.columns
            .map(c => `"${c.columnName.replace(/[^a-zA-Z0-9_]/g, '_')}" ${c.dataType}`)
            .join(', ');

          await client.query(`CREATE TABLE "${workspaceId}"."${safeName}" (${colDefs})`);

          // Batch insert all rows in a single query to avoid per-row network latency
          if (table.rows && Array.isArray(table.rows) && table.rows.length > 0) {
            const colNames = table.columns.map(c => `"${c.columnName.replace(/[^a-zA-Z0-9_]/g, '_')}"`);
            const numCols = table.columns.length;
            const CHUNK = Math.floor(65000 / Math.max(numCols, 1)); // stay under pg's 65535 param limit
            for (let offset = 0; offset < table.rows.length; offset += CHUNK) {
              const slice = table.rows.slice(offset, offset + CHUNK);
              const allValues = [];
              const valuePlaceholders = slice.map((row) => {
                const rowVals = table.columns.map(c => {
                  const val = row[c.columnName];
                  return val === undefined ? null : val;
                });
                allValues.push(...rowVals);
                const start = allValues.length - numCols;
                return `(${rowVals.map((_, i) => `$${start + i + 1}`).join(', ')})`;
              });
              await client.query(
                `INSERT INTO "${workspaceId}"."${safeName}" (${colNames.join(', ')}) VALUES ${valuePlaceholders.join(', ')}`,
                allValues
              );
            }
          }
        }

        return res.json({
          success: true,
          data: {
            ...assignment.toObject(),
            workspaceId
          }
        });
      } catch (pgErr) {
        console.error('Workspace creation error:', pgErr);
        // Cleanup on failure
        try { await client.query(`DROP SCHEMA IF EXISTS "${workspaceId}" CASCADE`); } catch (_) {}
        return res.status(500).json({ success: false, error: 'Failed to create assignment workspace. Please try again.' });
      }
    } catch (err) {
      console.error('getAssignmentById error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to load assignment.' });
    } finally {
      client.release();
    }
  }

  // Create new assignment (Admin/seeder use)
  static async createAssignment(req, res) {
    try {
      const assignment = await Assignment.create(req.body);
      return res.status(201).json({ success: true, data: assignment });
    } catch (err) {
      console.error('createAssignment error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Cleanup workspace schema after user is done
  static async cleanupWorkspace(req, res) {
    const { workspaceId } = req.params;

    // Validate workspace ID format for safety
    if (!/^workspace_[a-z0-9_]+$/i.test(workspaceId)) {
      return res.status(400).json({ success: false, error: 'Invalid workspaceId.' });
    }

    try {
      await pgPool.query(`DROP SCHEMA IF EXISTS "${workspaceId}" CASCADE`);
      return res.json({ success: true, message: 'Workspace cleaned up.' });
    } catch (err) {
      console.error('cleanupWorkspace error:', err);
      return res.status(500).json({ success: false, error: 'Failed to cleanup workspace.' });
    }
  }
}

module.exports = AssignmentController;
