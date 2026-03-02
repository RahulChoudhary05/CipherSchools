import { useState } from 'react'
import './SchemaViewer.scss'
import ERDiagram from './ERDiagram'

function SchemaViewer({ tables }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {}
    // Expand first table by default
    if (tables?.length > 0) init[0] = true
    return init
  })
  const [activeDataTab, setActiveDataTab] = useState({})

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))
  const toggleDataTab = (i, tab) => setActiveDataTab(prev => ({ ...prev, [i]: tab }))

  if (!tables || tables.length === 0) {
    return (
      <div className="schema-viewer">
        <div className="schema-viewer__empty">No tables available for this assignment.</div>
      </div>
    )
  }

  return (
    <div className="schema-viewer">
      {/* ER Diagram Section */}
      <div className="schema-viewer__diagram-section">
        <ERDiagram tables={tables} />
      </div>

      {/* Table Details Section */}
      <div className="schema-viewer__details-section">
        <div className="schema-viewer__header">
          <span className="schema-viewer__title">🗃️ Database Schema</span>
          <span className="schema-viewer__count">{tables.length} table{tables.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="schema-viewer__tables">
        {tables.map((table, idx) => {
          const isOpen = !!expanded[idx]
          const dataTab = activeDataTab[idx] || 'columns'

          return (
            <div key={idx} className={`schema-table ${isOpen ? 'schema-table--open' : ''}`}>
              {/* Table Header */}
              <button
                className="schema-table__header"
                onClick={() => toggle(idx)}
                id={`table-${table.tableName}`}
              >
                <div className="schema-table__header-left">
                  <span className="schema-table__icon">🗄️</span>
                  <span className="schema-table__name">{table.tableName}</span>
                  <span className="schema-table__col-count">{table.columns?.length} cols</span>
                </div>
                <span className={`schema-table__chevron ${isOpen ? 'schema-table__chevron--open' : ''}`}>
                  ›
                </span>
              </button>

              {/* Table Body */}
              {isOpen && (
                <div className="schema-table__body">
                  {/* Sub tabs */}
                  <div className="schema-table__tabs">
                    <button
                      className={`schema-table__tab ${dataTab === 'columns' ? 'schema-table__tab--active' : ''}`}
                      onClick={() => toggleDataTab(idx, 'columns')}
                    >
                      Columns ({table.columns?.length})
                    </button>
                    <button
                      className={`schema-table__tab ${dataTab === 'data' ? 'schema-table__tab--active' : ''}`}
                      onClick={() => toggleDataTab(idx, 'data')}
                    >
                      Sample Data ({table.rows?.length || 0} rows)
                    </button>
                  </div>

                  {dataTab === 'columns' && (
                    <div className="schema-table__columns">
                      {table.columns?.map((col, ci) => (
                        <div key={ci} className="schema-col">
                          <span className="schema-col__name">{col.columnName}</span>
                          <span className="schema-col__type">{col.dataType}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {dataTab === 'data' && table.rows?.length > 0 && (
                    <div className="schema-table__data-view">
                      <div className="schema-data-table">
                        <table>
                          <thead>
                            <tr>
                              {table.columns?.map((col, ci) => (
                                <th key={ci}>{col.columnName}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.slice(0, 5).map((row, ri) => (
                              <tr key={ri}>
                                {table.columns?.map((col, ci) => (
                                  <td key={ci}>
                                    {row[col.columnName] === null || row[col.columnName] === undefined
                                      ? <span className="null-val">NULL</span>
                                      : String(row[col.columnName])
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {table.rows.length > 5 && (
                        <div className="schema-table__more-rows">
                          +{table.rows.length - 5} more rows
                        </div>
                      )}
                    </div>
                  )}

                  {dataTab === 'data' && (!table.rows || table.rows.length === 0) && (
                    <div className="schema-table__no-data">No sample data available</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* SQL Query hint */}
      <div className="schema-viewer__tip">
        💡 Tip: Use table names exactly as shown above in your SQL queries
      </div>
    </div>
  )
}

export default SchemaViewer
