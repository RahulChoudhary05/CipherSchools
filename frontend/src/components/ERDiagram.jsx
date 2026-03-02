import './ERDiagram.scss'

function ERDiagram({ tables }) {
  if (!tables || tables.length === 0) {
    return <div className="er-diagram--empty">No tables to display</div>
  }

  // Calculate positions for tables in a grid layout
  const padding = 60
  const tableWidth = 200
  const tableHeight = 140
  const canvasWidth = 900
  const canvasHeight = 600

  // Simple grid positioning
  const positions = {}
  let row = 0, col = 0
  const colsPerRow = 3
  
  tables.forEach((table, idx) => {
    row = Math.floor(idx / colsPerRow)
    col = idx % colsPerRow
    positions[table.tableName] = {
      x: padding + col * (tableWidth + 100),
      y: padding + row * (tableHeight + 80)
    }
  })

  // Detect foreign key relationships (simple heuristic: if column name contains another table's singular form)
  const relationships = []
  tables.forEach((table) => {
    table.columns?.forEach((col) => {
      const colNameLower = col.columnName.toLowerCase()
      tables.forEach((otherTable) => {
        if (table.tableName !== otherTable.tableName) {
          const singularName = otherTable.tableName.slice(0, -1).toLowerCase()
          if (colNameLower.includes(singularName) || colNameLower.includes('id')) {
            relationships.push({
              from: otherTable.tableName,
              to: table.tableName,
              column: col.columnName
            })
          }
        }
      })
    })
  })

  // Remove duplicates
  const uniqueRelationships = []
  relationships.forEach((rel) => {
    if (!uniqueRelationships.some(r => r.from === rel.from && r.to === rel.to)) {
      uniqueRelationships.push(rel)
    }
  })

  return (
    <div className="er-diagram">
      <div className="er-diagram__container">
        <svg
          className="er-diagram__svg"
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        >
          {/* Draw relationship lines */}
          {uniqueRelationships.map((rel, idx) => {
            const fromPos = positions[rel.from]
            const toPos = positions[rel.to]
            if (!fromPos || !toPos) return null

            const x1 = fromPos.x + tableWidth / 2
            const y1 = fromPos.y + tableHeight
            const x2 = toPos.x + tableWidth / 2
            const y2 = toPos.y

            // Draw connection line
            return (
              <g key={`rel-${idx}`}>
                <path
                  d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 30} ${x2} ${y2}`}
                  className="er-diagram__line"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {/* Crow's foot notation - one-to-many */}
                <circle cx={x2} cy={y2 + 8} r="3" fill="#22c55e" />
              </g>
            )
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
            </marker>
          </defs>

          {/* Draw table boxes */}
          {tables.map((table) => {
            const pos = positions[table.tableName]
            if (!pos) return null

            return (
              <g key={table.tableName}>
                {/* Table box border */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={tableWidth}
                  height={tableHeight}
                  fill="#0d1117"
                  stroke="#22c55e"
                  strokeWidth="2"
                  rx="4"
                />

                {/* Table name header */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={tableWidth}
                  height="30"
                  fill="#22c55e"
                  rx="4"
                />

                <text
                  x={pos.x + tableWidth / 2}
                  y={pos.y + 20}
                  textAnchor="middle"
                  className="er-diagram__table-name"
                  fill="#0d1117"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {table.tableName}
                </text>

                {/* Column list */}
                {table.columns?.slice(0, 4).map((col, idx) => (
                  <text
                    key={`${table.tableName}-${idx}`}
                    x={pos.x + 8}
                    y={pos.y + 50 + idx * 16}
                    className="er-diagram__column-name"
                    fill="#c9d1d9"
                    fontSize="11"
                  >
                    {col.columnName}
                  </text>
                ))}

                {table.columns && table.columns.length > 4 && (
                  <text
                    x={pos.x + 8}
                    y={pos.y + 50 + 4 * 16}
                    className="er-diagram__more-columns"
                    fill="#9ca3af"
                    fontSize="10"
                  >
                    +{table.columns.length - 4} more
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Table Details Below Diagram */}
      <div className="er-diagram__details">
        <h4 className="er-diagram__details-title">📊 Relationships Overview</h4>
        {uniqueRelationships.length > 0 ? (
          <div className="er-diagram__relationships">
            {uniqueRelationships.map((rel, idx) => (
              <div key={idx} className="er-diagram__relationship-item">
                <span className="er-diagram__rel-from">{rel.from}</span>
                <span className="er-diagram__rel-arrow">→</span>
                <span className="er-diagram__rel-to">{rel.to}</span>
                <span className="er-diagram__rel-column">({rel.column})</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="er-diagram__no-relations">No explicit foreign key relationships detected. Tables may be related through the query context.</p>
        )}
      </div>
    </div>
  )
}

export default ERDiagram
