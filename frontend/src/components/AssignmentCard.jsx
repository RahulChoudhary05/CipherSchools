import './AssignmentCard.scss'

const DIFF_ICONS = { Easy: '🟢', Medium: '🟡', Hard: '🔴' }
const TOPIC_ICONS = {
  'SELECT': '📋', 'WHERE': '🔍', 'JOIN': '🔗', 'GROUP BY': '📊',
  'ORDER BY': '↕️', 'Aggregate': '∑', 'Subquery': '🔄', 'CTE': '🌿',
  'Window Functions': '🪟', 'HAVING': '🎯', 'DISTINCT': '✨',
  'LIKE': '🎭', 'String Functions': '📝', 'Date Functions': '📅', 'SQL': '💾'
}

function AssignmentCard({ assignment, index, onSelect }) {
  const tableCount = assignment.sampleTables?.length || 0
  const topicIcon = TOPIC_ICONS[assignment.topic] || '💾'
  const diffIcon = DIFF_ICONS[assignment.difficulty] || '⚪'

  return (
    <div
      className={`acard acard--${assignment.difficulty.toLowerCase()}`}
      onClick={() => onSelect(assignment)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(assignment)}
      id={`assignment-${assignment._id}`}
    >
      {/* Card Number */}
      <div className="acard__num">#{index}</div>

      {/* Header */}
      <div className="acard__header">
        <div className="acard__topic-icon" title={assignment.topic}>
          {topicIcon}
        </div>
        <div className="acard__meta">
          <span className={`badge badge--${assignment.difficulty.toLowerCase()}`}>
            {diffIcon} {assignment.difficulty}
          </span>
          {assignment.topic && (
            <span className="badge badge--topic">{assignment.topic}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="acard__title">{assignment.title}</h3>

      {/* Description */}
      <p className="acard__desc">{assignment.description}</p>

      {/* Footer */}
      <div className="acard__footer">
        <div className="acard__info">
          <span className="acard__tables">
            🗄️ {tableCount} table{tableCount !== 1 ? 's' : ''}
          </span>
          {assignment.sampleTables?.slice(0, 2).map((t, i) => (
            <span key={i} className="acard__table-name">
              {t.tableName}
            </span>
          ))}
          {tableCount > 2 && (
            <span className="acard__table-name">+{tableCount - 2}</span>
          )}
        </div>
        <span className="acard__cta">
          Solve <span className="acard__arrow">→</span>
        </span>
      </div>
    </div>
  )
}

export default AssignmentCard
