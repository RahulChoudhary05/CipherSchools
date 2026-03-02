import './ResultsTable.scss'

function ResultsTable({ results }) {
  if (!results || !results.columns) return null

  const { columns, rows, rowCount } = results

  return (
    <div className="results-table">
      <div className="results-table__meta">
        <span className="results-table__row-count">
          📊 {rowCount} row{rowCount !== 1 ? 's' : ''} returned
        </span>
        {columns.length > 0 && (
          <span className="results-table__col-count">{columns.length} column{columns.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {columns.length === 0 ? (
        <div className="results-table__empty">Query executed successfully (no columns returned).</div>
      ) : (
        <div className="results-table__scroll">
          <table className="results-table__table">
            <thead>
              <tr>
                <th className="results-table__th results-table__th--row-num">#</th>
                {columns.map((col, i) => (
                  <th key={i} className="results-table__th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows && rows.length > 0 ? (
                rows.map((row, ri) => (
                  <tr key={ri} className="results-table__tr">
                    <td className="results-table__td results-table__td--row-num">{ri + 1}</td>
                    {columns.map((col, ci) => {
                      const val = row[col]
                      const isNull = val === null || val === undefined
                      const isNum = typeof val === 'number'
                      // Format Date objects as YYYY-MM-DD for display
                      const displayVal = val instanceof Date
                        ? val.toISOString().split('T')[0]
                        : String(val)
                      return (
                        <td
                          key={ci}
                          className={`results-table__td ${isNum ? 'results-table__td--num' : ''}`}
                        >
                          {isNull
                            ? <span className="results-table__null">NULL</span>
                            : displayVal
                          }
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="results-table__td results-table__no-rows"
                  >
                    No rows returned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ResultsTable
