import { useState, useMemo } from 'react'
import './AssignmentsView.scss'
import AssignmentCard from './AssignmentCard'

const DIFFICULTY_FILTERS = ['All', 'Easy', 'Medium', 'Hard']
const TOPIC_FILTERS = ['All', 'SELECT', 'WHERE', 'Aggregate', 'String Functions', 'ORDER BY', 'DISTINCT', 'JOIN', 'GROUP BY', 'HAVING', 'LIKE', 'Date Functions', 'Subquery', 'Window Functions', 'CTE']

function AssignmentsView({ assignments, onSelectAssignment }) {
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const matchSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      const matchDiff = diffFilter === 'All' || a.difficulty === diffFilter
      const matchTopic = topicFilter === 'All' || a.topic === topicFilter
      return matchSearch && matchDiff && matchTopic
    })
  }, [assignments, search, diffFilter, topicFilter])

  const counts = useMemo(() => ({
    easy: assignments.filter(a => a.difficulty === 'Easy').length,
    medium: assignments.filter(a => a.difficulty === 'Medium').length,
    hard: assignments.filter(a => a.difficulty === 'Hard').length,
  }), [assignments])

  const LogoSVG = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginRight: '8px' }}>
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#3fb950" opacity="0.9"/>
      <rect x="18" y="2" width="12" height="12" rx="2" fill="#58a6ff" opacity="0.9"/>
      <rect x="2" y="18" width="12" height="12" rx="2" fill="#58a6ff" opacity="0.9"/>
      <rect x="18" y="18" width="12" height="12" rx="2" fill="#3fb950" opacity="0.9"/>
      <path d="M8 13L11 10L14 13" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    </svg>
  );

  return (
    <div className="assignments-view">
      {/* Hero Banner */}
      <div className="assignments-view__hero">
        <div className="assignments-view__hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <LogoSVG />
            <h1 className="assignments-view__hero-title">
              Master SQL with <span className="gradient-text">Interactive Challenges</span>
            </h1>
          </div>
          <p className="assignments-view__hero-desc">
            Practice real SQL queries on a live database. From basics to advanced window functions —
            level up your SQL skills like the pros do on LeetCode.
          </p>

          {/* Stat Pills */}
          <div className="assignments-view__pills">
            <div className="pill pill--easy">
              <span className="pill__dot" />
              <span>{counts.easy} Easy</span>
            </div>
            <div className="pill pill--medium">
              <span className="pill__dot" />
              <span>{counts.medium} Medium</span>
            </div>
            <div className="pill pill--hard">
              <span className="pill__dot" />
              <span>{counts.hard} Hard</span>
            </div>
          </div>
        </div>

        {/* Decorative Code Block */}
        <div className="assignments-view__hero-code">
          <div className="code-preview">
            <div className="code-preview__bar">
              <span /><span /><span />
              <small>query.sql</small>
            </div>
            <pre className="code-preview__body">
              <span className="kw">SELECT</span> name, salary{'\n'}
              <span className="kw">FROM</span> employees{'\n'}
              <span className="kw">WHERE</span> salary {'>'} ({'\n'}
              {'  '}<span className="kw">SELECT</span>{' '}
              <span className="fn">AVG</span>(salary){'\n'}
              {'  '}<span className="kw">FROM</span> employees{'\n'}
              ){'\n'}
              <span className="kw">ORDER BY</span> salary{' '}
              <span className="kw">DESC</span><span className="cursor">|</span>
            </pre>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="assignments-view__filters">
        <div className="assignments-view__filters-inner">
          {/* Search */}
          <div className="search-box">
            <span className="search-box__icon">🔍</span>
            <input
              className="search-box__input"
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-assignments"
            />
            {search && (
              <button className="search-box__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            {DIFFICULTY_FILTERS.map(d => (
              <button
                key={d}
                className={`filter-btn filter-btn--${d.toLowerCase()} ${diffFilter === d ? 'filter-btn--active' : ''}`}
                onClick={() => setDiffFilter(d)}
              >
                {d !== 'All' && <span className="filter-btn__dot" />}
                {d}
              </button>
            ))}
          </div>

          {/* Topic Filter */}
          <div className="filter-group filter-group--scroll">
            {TOPIC_FILTERS.map(t => (
              <button
                key={t}
                className={`filter-btn filter-btn--topic ${topicFilter === t ? 'filter-btn--topic-active' : ''}`}
                onClick={() => setTopicFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="assignments-view__results-bar">
        <span className="assignments-view__count">
          Showing <strong>{filtered.length}</strong> of <strong>{assignments.length}</strong> problems
        </span>
        {(search || diffFilter !== 'All' || topicFilter !== 'All') && (
          <button
            className="assignments-view__clear-all"
            onClick={() => { setSearch(''); setDiffFilter('All'); setTopicFilter('All'); }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="assignments-view__grid">
          {filtered.map((assignment, idx) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              index={idx + 1}
              onSelect={onSelectAssignment}
            />
          ))}
        </div>
      ) : (
        <div className="assignments-view__empty">
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h3 className="empty-state__title">No problems found</h3>
            <p className="empty-state__desc">Try adjusting your search or filters</p>
            <button
              className="btn-ghost"
              onClick={() => { setSearch(''); setDiffFilter('All'); setTopicFilter('All'); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentsView
