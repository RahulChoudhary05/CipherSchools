import { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './AttemptView.scss'
import SQLEditor from './SQLEditor'
import ResultsTable from './ResultsTable'
import SchemaViewer from './SchemaViewer'
import { queryAPI, hintAPI, progressAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import CipherLogo from './CipherLogo'

const TABS_LEFT = ['Description', 'Schema']
const TABS_RIGHT = ['Testcase', 'Test Result']

const SQL_KEYWORDS = [
  'select', 'from', 'where', 'group', 'by', 'order', 'having', 'limit', 'offset',
  'join', 'left', 'right', 'inner', 'outer', 'full', 'cross', 'on',
  'with', 'as', 'distinct', 'union', 'all', 'case', 'when', 'then', 'else', 'end',
  'and', 'or', 'not', 'in', 'is', 'null', 'between', 'like', 'exists',
  'count', 'sum', 'avg', 'min', 'max', 'asc', 'desc'
]

const SQL_KEYWORD_REGEX = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi')

function normalizeSqlForExecution(rawSql) {
  if (!rawSql || typeof rawSql !== 'string') return rawSql

  // Preserve string literals and quoted identifiers while uppercasing keywords elsewhere.
  return rawSql
    .split(/('(?:''|[^'])*'|"(?:""|[^"])*")/g)
    .map((part, idx) => {
      if (idx % 2 === 1) return part
      return part.replace(SQL_KEYWORD_REGEX, (kw) => kw.toUpperCase())
    })
    .join('')
}

function formatSqlError(err, fallbackMessage) {
  const apiError = err?.response?.data
  const sqlError = apiError?.sqlError
  const message = apiError?.error || err?.message || fallbackMessage
  if (!sqlError) return message

  const parts = [message]
  if (sqlError.code) parts.push(`Code: ${sqlError.code}`)
  if (sqlError.position) parts.push(`Position: ${sqlError.position}`)
  if (sqlError.detail) parts.push(`Detail: ${sqlError.detail}`)
  if (sqlError.hint) parts.push(`Hint: ${sqlError.hint}`)

  return parts.join('\n')
}

function AttemptView({ assignment, onBack, initialQuery = '', onRefreshWorkspace }) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [sqlQuery, setSqlQuery] = useState(initialQuery || '-- Write your SQL query here\nSELECT ')
  const [queryResults, setQueryResults] = useState(null)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [validateLoading, setValidateLoading] = useState(false)
  const [execTime, setExecTime] = useState(null)
  const [leftTab, setLeftTab] = useState('Description')
  const [rightTab, setRightTab] = useState('Testcase')
  const [testResult, setTestResult] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isQueryEmpty = (q) => {
    const stripped = q.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
    return !stripped || stripped.toUpperCase() === 'SELECT'
  }

  const shouldRefreshWorkspace = (err) => {
    const msg = String(err?.response?.data?.error || err?.message || '').toLowerCase()
    return msg.includes('schema') || msg.includes('workspace') || msg.includes('does not exist') || msg.includes('invalid workspaceid')
  }

  const handleExecute = useCallback(async () => {
    if (isQueryEmpty(sqlQuery)) {
      setError('Please write a SQL query first.')
      return
    }
    const executableQuery = normalizeSqlForExecution(sqlQuery)
    if (executableQuery !== sqlQuery) {
      setSqlQuery(executableQuery)
    }
    setError('')
    setHint('')
    setLoading(true)
    setTestResult(null)
    setRightTab('Test Result')
    try {
      let workspaceId = assignment.workspaceId
      let res
      try {
        res = await queryAPI.execute(executableQuery, workspaceId)
      } catch (err) {
        if (onRefreshWorkspace && shouldRefreshWorkspace(err)) {
          const freshAssignment = await onRefreshWorkspace()
          workspaceId = freshAssignment.workspaceId
          res = await queryAPI.execute(executableQuery, workspaceId)
        } else {
          throw err
        }
      }
      setQueryResults(res.data.data)
      setExecTime(res.data.data.executionTime)
    } catch (err) {
      setError(formatSqlError(err, 'Failed to execute query.'))
      setQueryResults(null)
    } finally {
      setLoading(false)
    }
  }, [sqlQuery, assignment, onRefreshWorkspace])

  const handleRunTests = useCallback(async () => {
    if (isQueryEmpty(sqlQuery)) {
      setError('Please write a SQL query first.')
      return
    }
    const executableQuery = normalizeSqlForExecution(sqlQuery)
    if (executableQuery !== sqlQuery) {
      setSqlQuery(executableQuery)
    }
    setError('')
    setValidateLoading(true)
    setRightTab('Test Result')
    try {
      let workspaceId = assignment.workspaceId
      let res
      try {
        res = await queryAPI.validate(executableQuery, workspaceId, assignment._id)
      } catch (err) {
        if (onRefreshWorkspace && shouldRefreshWorkspace(err)) {
          const freshAssignment = await onRefreshWorkspace()
          workspaceId = freshAssignment.workspaceId
          res = await queryAPI.validate(executableQuery, workspaceId, assignment._id)
        } else {
          throw err
        }
      }
      setQueryResults(res.data.data)
      setTestResult({
        passed: res.data.data.passed,
        feedback: res.data.data.feedback
      })
      
      // Save attempt if user is authenticated (save on every submit, pass or fail)
      if (isAuthenticated) {
        try {
          await progressAPI.saveAttempt(assignment._id, workspaceId, executableQuery, res.data.data.passed)
        } catch (err) {
          console.error('Failed to save progress:', err)
        }
      }
    } catch (err) {
      setError(formatSqlError(err, 'Failed to run test cases.'))
    } finally {
      setValidateLoading(false)
    }
  }, [sqlQuery, assignment, isAuthenticated, onRefreshWorkspace])

  const handleGetHint = useCallback(async () => {
    setHintLoading(true)
    setError('')
    try {
      const res = await hintAPI.generateHint(assignment._id, sqlQuery)
      setHint(res.data.data?.hint || res.data.hint || '')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate hint.')
    } finally {
      setHintLoading(false)
    }
  }, [assignment._id, sqlQuery])

  const handleClearQuery = () => {
    setSqlQuery('-- Write your SQL query here\nSELECT ')
    setQueryResults(null)
    setError('')
    setHint('')
    setTestResult(null)
    setExecTime(null)
  }

  const diff = assignment.difficulty?.toLowerCase()
  const diffColors = { easy: '#3fb950', medium: '#e3b341', hard: '#f78166' }
  const diffColor = diffColors[diff] || '#58a6ff'

  return (
    <div className="attempt">
      {/* Fixed Navbar */}
      <header className="attempt__navbar">
    <div className="attempt__navbar-inner">

    {/* LEFT */}
    <div className="attempt__navbar-left">
      <button className="attempt__back-btn" onClick={onBack} id="back-btn">
        ← Back
      </button>

      <div className="attempt__logo">
        <CipherLogo size={28} />
        <span className="attempt__logo-text">CipherSQL</span>
      </div>

      <div className="attempt__title-breadcrumb">
        <span className="attempt__separator">›</span>
        <span className="attempt__title">{assignment.title}</span>
      </div>
    </div>

    {/* RIGHT */}
    <div className="attempt__navbar-right">
      {isAuthenticated ? (
        <div className="attempt__auth-actions">
          <Link to="/profile" className="attempt__profile-button">
            <span className="attempt__profile-icon">👤</span>
            <span className="attempt__profile-name">
              {user?.firstName || user?.email?.split('@')[0]}
            </span>
          </Link>

          <button onClick={handleLogout} className="attempt__logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="attempt__auth-actions">
          {location.pathname !== '/login' && (
            <Link to="/login" className="attempt__signin-btn">
              Login
            </Link>
          )}

          {location.pathname !== '/signup' && (
            <Link to="/signup" className="attempt__signup-btn">
              Sign Up
            </Link>
          )}
        </div>
      )}
    </div>

  </div>
</header>

      {/* Main Split Layout */}
      <div className="attempt__layout">
        {/* LEFT PANEL */}
        <div className="attempt__panel attempt__panel--left">
          {/* Tabs */}
          <div className="panel-tabs">
            {TABS_LEFT.map(tab => (
              <button
                key={tab}
                className={`panel-tabs__btn ${leftTab === tab ? 'panel-tabs__btn--active' : ''}`}
                onClick={() => setLeftTab(tab)}
                id={`tab-${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="attempt__panel-body attempt__panel-body--scrollable">
            {leftTab === 'Description' ? (
              <div className="problem-panel animate-fade-in">
                {/* Problem Header Section */}
                <div className="problem-panel__header">
                  <div className="problem-panel__title-section">
                    <h2 className="problem-panel__title">{assignment.title}</h2>
                    <div className="problem-panel__badges">
                      <span
                        className="problem-panel__difficulty-badge"
                        style={{ color: diffColor, background: `${diffColor}1a`, borderColor: `${diffColor}4d` }}
                      >
                        {assignment.difficulty}
                      </span>
                      {assignment.topic && (
                        <span className="problem-panel__topic-badge">{assignment.topic}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="problem-panel__description-section">
                  <h3 className="problem-panel__section-title">Description</h3>
                  <p className="problem-panel__question">{assignment.question}</p>
                </div>

                {/* Sample Table Input Section */}
                {assignment.sampleTables?.length > 0 && (
                  <div className="problem-panel__input-section">
                    <h3 className="problem-panel__section-title">Example 1:</h3>
                    <div className="problem-panel__example-block">
                      <div className="problem-panel__example-label">Input:</div>
                      {assignment.sampleTables.map((table, tableIndex) => (
                        <div key={tableIndex} className="problem-panel__input-table">
                          <div className="problem-panel__table-name">{table.tableName} =</div>
                          <table className="problem-panel__data-table">
                            <thead>
                              <tr>
                                {table.columns?.map((col, colIndex) => (
                                  <th key={colIndex}>{col.columnName}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows?.slice(0, 3).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {table.columns?.map((col, colIndex) => (
                                    <td key={colIndex}>
                                      {row[col.columnName] === null || row[col.columnName] === undefined
                                        ? 'NULL'
                                        : String(row[col.columnName])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Output Section */}
                {assignment.expectedOutput?.columns?.length > 0 && Array.isArray(assignment.expectedOutput.value) && (
                  <div className="problem-panel__output-section">
                    <div className="problem-panel__example-block">
                      <div className="problem-panel__example-label">Output:</div>
                      <div className="problem-panel__output-table">
                        <table className="problem-panel__data-table">
                          <thead>
                            <tr>
                              {assignment.expectedOutput.columns.map((col, i) => (
                                <th key={i}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {assignment.expectedOutput.value.slice(0, 5).map((row, ri) => (
                              <tr key={ri}>
                                {assignment.expectedOutput.columns.map((col, ci) => (
                                  <td key={ci}>
                                    {row[col] === null || row[col] === undefined ? 'NULL' : String(row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {assignment.expectedOutput.value.length > 5 && (
                          <div className="problem-panel__more-rows">
                            +{assignment.expectedOutput.value.length - 5} more rows...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation Section */}
                <div className="problem-panel__explanation-section">
                  <div className="problem-panel__example-block">
                    <div className="problem-panel__example-label">Explanation:</div>
                    <p className="problem-panel__explanation-text">
                      {assignment.explanation || 'Write a SQL query to solve this problem. Your solution should match the expected output format as shown above.'}
                    </p>
                  </div>
                </div>

                {/* Hints section */}
                <div className="problem-panel__hint-section">
                  <button
                    className={`btn-hint ${hintLoading ? 'btn-hint--loading' : ''}`}
                    onClick={handleGetHint}
                    disabled={hintLoading}
                    id="get-hint-btn"
                  >
                    {hintLoading ? (
                      <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Generating hint...</>
                    ) : (
                      <>💡 Get AI Hint</>
                    )}
                  </button>

                  {hint && !hintLoading && (
                    <div className="hint-box animate-fade-in-up">
                      <div className="hint-box__header">
                        <span className="hint-box__icon">💡</span>
                        <span className="hint-box__title">AI Hint</span>
                        <button className="hint-box__close" onClick={() => setHint('')}>✕</button>
                      </div>
                      <div className="hint-box__body">
                        {hint.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Static hints from assignment */}
                  {assignment.hints?.length > 0 && !hint && (
                    <details className="static-hints">
                      <summary className="static-hints__toggle">💡 {assignment.hints.length} Built-in Hint{assignment.hints.length > 1 ? 's' : ''}</summary>
                      <ol className="static-hints__list">
                        {assignment.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>

                  {/* Footer with Problem Info */}
                <div className="problem-panel__footer">
                  <div className="problem-panel__footer-left">
                    <span className="problem-panel__footer-item">
                      <span className="problem-panel__footer-label">Problem ID:</span>
                      <span className="problem-panel__footer-value">{assignment._id?.slice(-6) || 'N/A'}</span>
                    </span>
                    <span className="problem-panel__footer-item">
                      <span className="problem-panel__footer-label">Topic:</span>
                      <span className="problem-panel__footer-value">{assignment.topic || 'SQL'}</span>
                    </span>
                  </div>
                  <div className="problem-panel__footer-right">
                    <span className="problem-panel__footer-copy">© 2026 CipherSQL</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="schema-container">
                <SchemaViewer tables={assignment.sampleTables} />
                
                {/* Footer for Schema tab */}
                <div className="problem-panel__footer">
                  <div className="problem-panel__footer-left">
                    <span className="problem-panel__footer-item">
                      <span className="problem-panel__footer-label">Tables:</span>
                      <span className="problem-panel__footer-value">{assignment.sampleTables?.length || 0}</span>
                    </span>
                    <span className="problem-panel__footer-item">
                      <span className="problem-panel__footer-label">Database:</span>
                      <span className="problem-panel__footer-value">{assignment.workspaceId || 'Default'}</span>
                    </span>
                  </div>
                  <div className="problem-panel__footer-right">
                    <span className="problem-panel__footer-copy">© 2026 CipherSQL</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="attempt__panel attempt__panel--right">
          {/* Editor Toolbar */}
          <div className="editor-toolbar">
            <span className="editor-toolbar__lang">SQL</span>
            <div className="editor-toolbar__actions">
              <button
                className="btn-clear"
                onClick={handleClearQuery}
                title="Clear editor"
              >
                🗑️ Clear
              </button>
              <button
                className="btn-run"
                onClick={handleExecute}
                disabled={loading}
                id="execute-btn"
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Running...</>
                ) : (
                  <>▶ Run</>
                )}
              </button>
              <button
                className="btn-submit"
                onClick={handleRunTests}
                disabled={validateLoading}
                id="submit-btn"
              >
                {validateLoading ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Testing...</>
                ) : (
                  <>✓ Submit</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="attempt__editor">
            <SQLEditor value={sqlQuery} onChange={setSqlQuery} onRun={handleExecute} />
          </div>

          {/* Results Area */}
          <div className="attempt__results">
            {/* Tabs */}
            <div className="panel-tabs panel-tabs--bottom">
              {TABS_RIGHT.map(tab => (
                <button
                  key={tab}
                  className={`panel-tabs__btn ${rightTab === tab ? 'panel-tabs__btn--active' : ''}`}
                  onClick={() => setRightTab(tab)}
                  id={`result-tab-${tab.toLowerCase().replace(' ', '-')}`}
                >
                  {tab}
                  {tab === 'Test Result' && testResult && (
                    <span className={`panel-tabs__indicator ${testResult.passed ? 'panel-tabs__indicator--pass' : 'panel-tabs__indicator--fail'}`}>
                      {testResult.passed ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              ))}
              {execTime != null && rightTab === 'Test Result' && (
                <span className="panel-tabs__exec-time">{execTime}ms</span>
              )}
            </div>

            <div className="attempt__results-body">
              {error && (
                <div className="status-banner status-banner--error animate-fade-in-up">
                  <span className="status-banner__icon">⚠️</span>
                  <span className="status-banner__content">{error}</span>
                  <button
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
                    onClick={() => setError('')}
                  >✕</button>
                </div>
              )}

              {rightTab === 'Test Result' && testResult && (
                <div className={`status-banner ${testResult.passed ? 'status-banner--success' : 'status-banner--error'} animate-fade-in-up`}>
                  <span className="status-banner__icon">{testResult.passed ? '✓' : '✗'}</span>
                  <div className="status-banner__content">
                    <strong>{testResult.passed ? 'Accepted' : 'Wrong Answer'}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>{testResult.feedback}</p>
                  </div>
                </div>
              )}

              {rightTab === 'Testcase' && (
                <div className="testcase-panel">
                  {assignment.sampleTables?.map((table, tableIndex) => (
                    <div key={tableIndex} className="testcase-panel__block">
                      <div className="testcase-panel__title">{table.tableName} =</div>
                      <div className="testcase-panel__table-wrap">
                        <table className="testcase-panel__table">
                          <thead>
                            <tr>
                              {table.columns?.map((col, colIndex) => (
                                <th key={colIndex}>{col.columnName}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows?.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {table.columns?.map((col, colIndex) => (
                                  <td key={colIndex}>
                                    {row[col.columnName] === null || row[col.columnName] === undefined
                                      ? 'NULL'
                                      : String(row[col.columnName])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'Test Result' && (loading || validateLoading) && (
                <div className="results-loading">
                  <span className="spinner" />
                  <span>Executing query...</span>
                </div>
              )}

              {rightTab === 'Test Result' && queryResults && !loading && !validateLoading && (
                <ResultsTable results={queryResults} />
              )}

              {rightTab === 'Test Result' && !queryResults && !loading && !validateLoading && !error && !testResult && (
                <div className="results-empty">
                  <div className="results-empty__icon">⋯</div>
                  <p>Run your query to see the test result</p>
                  <small>Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or click Run</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttemptView
