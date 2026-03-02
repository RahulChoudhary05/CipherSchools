const { pgPool } = require('../config/database');

// In-memory workspace registry (for dev; production: use Redis or DB)
const workspaceRegistry = new Map();

class QueryController {
  // Helper: Remove SQL comments (-- and /* */)
  static stripComments(sql) {
    // Remove line comments (-- ...)
    let cleaned = sql.replace(/--[^\n]*/g, '');
    // Remove block comments (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return cleaned.trim();
  }

  static async executeQuery(req, res) {
    const { query, workspaceId } = req.body;

    // Validate inputs
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'A SQL query is required.' });
    }
    if (!workspaceId || typeof workspaceId !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid workspaceId is required.' });
    }

    // Validate workspaceId format (must start with workspace_)
    if (!/^workspace_[a-z0-9_]+$/i.test(workspaceId)) {
      return res.status(400).json({ success: false, error: `Invalid workspaceId format. Expected: workspace_* Got: ${workspaceId.substring(0, 20)}...` });
    }

    const cleanQuery = query.trim();
    
    // Remove SQL comments for validation
    const queryNoComments = QueryController.stripComments(cleanQuery);

    // Security: Only allow SELECT queries
    const upper = queryNoComments.toUpperCase().replace(/\s+/g, ' ').trim();
    const forbidden = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'COPY', 'VACUUM', 'REINDEX'];
    for (const kw of forbidden) {
      // Match keyword as a whole word - safer approach
      if (upper.match(new RegExp(`\\b${kw}\\b`, 'i'))) {
        return res.status(403).json({
          success: false,
          error: `Forbidden SQL keyword detected: ${kw}. Only SELECT queries allowed.`
        });
      }
    }

    // Check if starts with SELECT or WITH (CTE)
    const startsValid = upper.startsWith('SELECT') || (upper.startsWith('WITH ') && upper.includes('SELECT'));
    if (!startsValid) {
      return res.status(403).json({ success: false, error: 'Only SELECT queries (and CTEs starting with WITH...SELECT) are allowed.' });
    }

    // Limit query execution time
    const client = await pgPool.connect();
    try {
      // Set search path to isolated workspace schema
      await client.query(`SET search_path TO "${workspaceId}", public`);
      await client.query(`SET statement_timeout TO 10000`); // 10 second timeout

      const startTime = Date.now();
      const result = await client.query({ text: cleanQuery });
      const executionTime = Date.now() - startTime;

      const columns = result.fields ? result.fields.map(f => f.name) : [];

      return res.json({
        success: true,
        data: {
          columns,
          rows: result.rows || [],
          rowCount: result.rowCount,
          executionTime
        }
      });
    } catch (err) {
      let userFriendlyError = err.message;
      switch (err.code) {
        case '42P01': userFriendlyError = `Table not found. Available tables are in your schema. Check your table name.`; break;
        case '42703': userFriendlyError = `Column "${err.column || ''}" does not exist. Check your column names.`; break;
        case '42601': userFriendlyError = `SQL syntax error near: ${err.position ? `position ${err.position}` : 'unknown'}. Check your SQL syntax.`; break;
        case '42804': userFriendlyError = `Data type mismatch: ${err.message}`; break;
        case '57014': userFriendlyError = `Query timed out after 10 seconds. Simplify your query.`; break;
        case '42883': userFriendlyError = `Function or operator not found: ${err.message}`; break;
        default: userFriendlyError = err.message;
      }
      return res.status(400).json({ success: false, error: userFriendlyError });
    } finally {
      client.release();
    }
  }

  // Validate query result against expected output
  static async validateQuery(req, res) {
    const { query, workspaceId, assignmentId } = req.body;

    if (!query || !workspaceId || !assignmentId) {
      return res.status(400).json({ success: false, error: 'query, workspaceId, and assignmentId are required.' });
    }

    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    const cleanQuery = query.trim();
    
    // Remove SQL comments for validation
    const queryNoComments = QueryController.stripComments(cleanQuery);
    const upper = queryNoComments.toUpperCase().replace(/\s+/g, ' ').trim();

    // Security: reject forbidden keywords
    const forbidden = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'COPY', 'VACUUM', 'REINDEX'];
    for (const kw of forbidden) {
      if (upper.match(new RegExp(`\\b${kw}\\b`, 'i'))) {
        return res.status(403).json({ success: false, error: `Forbidden SQL keyword: ${kw}. Only SELECT queries allowed.` });
      }
    }
    
    if (!upper.startsWith('SELECT') && !(upper.startsWith('WITH ') && upper.includes('SELECT'))) {
      return res.status(403).json({ success: false, error: 'Only SELECT queries (and CTEs with WITH...SELECT) are allowed.' });
    }

    const client = await pgPool.connect();
    try {
      await client.query(`SET search_path TO "${workspaceId}", public`);
      await client.query(`SET statement_timeout TO 10000`);

      const result = await client.query({ text: cleanQuery });
      const columns = result.fields ? result.fields.map(f => f.name) : [];
      const rows = result.rows || [];

      // Compare with expected output
      const expected = assignment.expectedOutput;
      let passed = false;
      let feedback = '';

      if (!expected || !expected.value) {
        passed = true;
        feedback = 'No expected output defined - query executed successfully!';
      } else {
        const expectedValue = expected.value;
        const expectedType = expected.type || 'table';

        // Normalize a value for comparison: handles Date objects, numbers, strings
        const normalizeVal = (val) => {
          if (val === null || val === undefined) return null;
          // Handle JavaScript Date objects returned from PostgreSQL DATE columns
          if (val instanceof Date) {
            return val.toISOString().split('T')[0]; // "2021-03-20"
          }
          // Normalize numbers: compare as floats to avoid "1299.99" vs "1299.9900000" issues
          const num = Number(val);
          if (!isNaN(num) && String(val).trim() !== '') {
            return String(parseFloat(num.toFixed(4)));
          }
          return String(val).trim();
        };

        if (expectedType === 'count' || expectedType === 'single_value') {
          // Check single row / value
          if (rows.length === 1) {
            const actualVal = Object.values(rows[0])[0];
            const expVal = Array.isArray(expectedValue) ? Object.values(expectedValue[0])[0] : expectedValue;
            passed = normalizeVal(actualVal) === normalizeVal(expVal);
            if (!passed) feedback = `Expected value: ${expVal}, got: ${actualVal}`;
          } else {
            feedback = `Expected 1 row, got ${rows.length} rows.`;
          }
        } else if (expectedType === 'table' || expectedType === 'column' || expectedType === 'row') {
          let expRows = Array.isArray(expectedValue) ? [...expectedValue] : [expectedValue];
          let actualRows = [...rows];
          
          if (actualRows.length !== expRows.length) {
            feedback = `Expected ${expRows.length} row(s), got ${actualRows.length} row(s).`;
          } else {
            // Sort rows if order is not strict to prevent hash join non-deterministic ordering false-failures.
            const strictOrderTopics = ['ORDER BY', 'Window Functions'];
            if (!strictOrderTopics.includes(assignment.topic)) {
              const rowSorter = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
              expRows.sort(rowSorter);
              actualRows.sort(rowSorter);
            }

            // Compare row by row using normalized values
            let mismatch = false;
            for (let i = 0; i < expRows.length; i++) {
              const actualRow = actualRows[i];
              const expRow = expRows[i];
              for (const key of Object.keys(expRow)) {
                const aVal = actualRow[key] === null || actualRow[key] === undefined ? null : normalizeVal(actualRow[key]);
                const eVal = expRow[key] === null || expRow[key] === undefined ? null : normalizeVal(expRow[key]);
                if (aVal !== eVal) {
                  mismatch = true;
                  feedback = `Missing or mismatched row data. Expected a row containing column "${key}" with value "${eVal}".`;
                  break;
                }
              }
              if (mismatch) break;
            }
            passed = !mismatch;
          }
        }
        if (passed) feedback = '✅ All test cases passed! Great work!';
      }

      return res.json({
        success: true,
        data: {
          columns,
          rows,
          rowCount: result.rowCount,
          passed,
          feedback
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  }
}

module.exports = QueryController;
