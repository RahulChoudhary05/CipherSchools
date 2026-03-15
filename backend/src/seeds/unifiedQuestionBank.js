module.exports = {
  packName: 'community-pack-v1',
  generatedAt: '2026-03-15',
  datasets: {
    adventureworks: {
      name: 'AdventureWorks',
      sourceUrl: 'https://github.com/microsoft/sql-server-samples/releases/tag/adventureworks'
    },
    superstore: {
      name: 'Global Superstore',
      sourceUrl: 'https://www.kaggle.com/datasets/shekpaul/global-superstore'
    },
    olympics: {
      name: '120 Years of Olympic History',
      sourceUrl: 'https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results'
    },
    netflix: {
      name: 'Netflix Shows',
      sourceUrl: 'https://www.kaggle.com/datasets/shivamb/netflix-shows'
    },
    sqlqa: {
      name: 'SQL Practice Questions',
      sourceUrl: 'https://www.kaggle.com/datasets/ahmedshahriarsakib/sql-practice-questions'
    }
  },
  problems: [
    {
      title: 'Top 5 Customers by Revenue',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['aggregation', 'order by', 'limit'],
      datasetKey: 'superstore',
      description: 'Find the top customers by total revenue using order-level sales data.',
      question: 'Using orders and customers tables, return customer_name and total_revenue for the top 5 customers sorted by revenue descending.',
      starterSql: 'SELECT c.customer_name, SUM(o.sales) AS total_revenue\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nGROUP BY c.customer_name\nORDER BY total_revenue DESC\nLIMIT 5;',
      solutionSql: 'SELECT c.customer_name, SUM(o.sales) AS total_revenue\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nGROUP BY c.customer_name\nORDER BY total_revenue DESC, c.customer_name ASC\nLIMIT 5;',
      hints: [
        'Join orders with customers using customer_id.',
        'Use SUM on sales and GROUP BY customer_name.',
        'Sort descending and limit to 5 rows.'
      ],
      sampleTables: [
        {
          tableName: 'customers',
          columns: [
            { columnName: 'customer_id', dataType: 'VARCHAR(20)' },
            { columnName: 'customer_name', dataType: 'VARCHAR(100)' }
          ],
          rows: [
            { customer_id: 'C1', customer_name: 'Aarav Traders' },
            { customer_id: 'C2', customer_name: 'Blue Retail' },
            { customer_id: 'C3', customer_name: 'City Stores' },
            { customer_id: 'C4', customer_name: 'Delta Supply' },
            { customer_id: 'C5', customer_name: 'Ecom One' },
            { customer_id: 'C6', customer_name: 'Fast Mart' }
          ]
        },
        {
          tableName: 'orders',
          columns: [
            { columnName: 'order_id', dataType: 'VARCHAR(20)' },
            { columnName: 'customer_id', dataType: 'VARCHAR(20)' },
            { columnName: 'sales', dataType: 'DECIMAL(10,2)' }
          ],
          rows: [
            { order_id: 'O1', customer_id: 'C1', sales: 900.0 },
            { order_id: 'O2', customer_id: 'C2', sales: 1200.0 },
            { order_id: 'O3', customer_id: 'C3', sales: 450.0 },
            { order_id: 'O4', customer_id: 'C4', sales: 800.0 },
            { order_id: 'O5', customer_id: 'C5', sales: 700.0 },
            { order_id: 'O6', customer_id: 'C1', sales: 350.0 },
            { order_id: 'O7', customer_id: 'C2', sales: 500.0 },
            { order_id: 'O8', customer_id: 'C6', sales: 400.0 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['customer_name', 'total_revenue'],
        value: [
          { customer_name: 'Blue Retail', total_revenue: 1700.0 },
          { customer_name: 'Aarav Traders', total_revenue: 1250.0 },
          { customer_name: 'Delta Supply', total_revenue: 800.0 },
          { customer_name: 'Ecom One', total_revenue: 700.0 },
          { customer_name: 'City Stores', total_revenue: 450.0 }
        ]
      }
    },
    {
      title: 'Monthly Revenue Growth',
      difficulty: 'Hard',
      topic: 'Window Functions',
      tags: ['window', 'lag', 'date_trunc'],
      datasetKey: 'superstore',
      description: 'Calculate month-over-month growth based on monthly revenue.',
      question: 'Return month_start, revenue and growth_pct where growth_pct compares against previous month revenue.',
      starterSql: 'WITH monthly AS (\n  SELECT DATE_TRUNC(\'month\', order_date)::date AS month_start, SUM(sales) AS revenue\n  FROM orders\n  GROUP BY 1\n)\nSELECT month_start, revenue,\n       ROUND(((revenue - LAG(revenue) OVER (ORDER BY month_start)) / NULLIF(LAG(revenue) OVER (ORDER BY month_start),0)) * 100, 2) AS growth_pct\nFROM monthly\nORDER BY month_start;',
      solutionSql: 'WITH monthly AS (\n  SELECT DATE_TRUNC(\'month\', order_date)::date AS month_start, SUM(sales) AS revenue\n  FROM orders\n  GROUP BY 1\n)\nSELECT month_start, revenue,\n       ROUND(((revenue - LAG(revenue) OVER (ORDER BY month_start)) / NULLIF(LAG(revenue) OVER (ORDER BY month_start),0)) * 100, 2) AS growth_pct\nFROM monthly\nORDER BY month_start;',
      hints: [
        'Aggregate by DATE_TRUNC month first.',
        'Use LAG to get previous month revenue.',
        'Guard divide-by-zero using NULLIF.'
      ],
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { columnName: 'order_id', dataType: 'VARCHAR(20)' },
            { columnName: 'order_date', dataType: 'DATE' },
            { columnName: 'sales', dataType: 'DECIMAL(10,2)' }
          ],
          rows: [
            { order_id: 'O1', order_date: '2025-01-03', sales: 300.0 },
            { order_id: 'O2', order_date: '2025-01-18', sales: 700.0 },
            { order_id: 'O3', order_date: '2025-02-06', sales: 900.0 },
            { order_id: 'O4', order_date: '2025-02-20', sales: 600.0 },
            { order_id: 'O5', order_date: '2025-03-05', sales: 1000.0 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['month_start', 'revenue', 'growth_pct'],
        value: [
          { month_start: '2025-01-01', revenue: 1000.0, growth_pct: null },
          { month_start: '2025-02-01', revenue: 1500.0, growth_pct: 50.0 },
          { month_start: '2025-03-01', revenue: 1000.0, growth_pct: -33.33 }
        ]
      }
    },
    {
      title: 'Country With Most Gold Medals',
      difficulty: 'Easy',
      topic: 'Aggregate',
      tags: ['count', 'group by'],
      datasetKey: 'olympics',
      description: 'Identify top country by gold medals.',
      question: 'Return country and gold_count for the country with maximum gold medals.',
      starterSql: 'SELECT country, COUNT(*) AS gold_count\nFROM medals\nWHERE medal = \'Gold\'\nGROUP BY country\nORDER BY gold_count DESC\nLIMIT 1;',
      solutionSql: 'SELECT country, COUNT(*) AS gold_count\nFROM medals\nWHERE medal = \'Gold\'\nGROUP BY country\nORDER BY gold_count DESC, country ASC\nLIMIT 1;',
      hints: [
        'Filter rows where medal is Gold.',
        'Group by country and count rows.',
        'Order by count descending.'
      ],
      sampleTables: [
        {
          tableName: 'medals',
          columns: [
            { columnName: 'athlete', dataType: 'VARCHAR(80)' },
            { columnName: 'country', dataType: 'VARCHAR(50)' },
            { columnName: 'medal', dataType: 'VARCHAR(10)' }
          ],
          rows: [
            { athlete: 'A1', country: 'USA', medal: 'Gold' },
            { athlete: 'A2', country: 'USA', medal: 'Silver' },
            { athlete: 'A3', country: 'China', medal: 'Gold' },
            { athlete: 'A4', country: 'USA', medal: 'Gold' },
            { athlete: 'A5', country: 'India', medal: 'Bronze' },
            { athlete: 'A6', country: 'China', medal: 'Gold' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['country', 'gold_count'],
        value: [
          { country: 'USA', gold_count: 2 }
        ]
      }
    },
    {
      title: 'Top 10 Athletes by Total Medals',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['count', 'order by', 'limit'],
      datasetKey: 'olympics',
      description: 'Rank athletes by medal count.',
      question: 'Return athlete and medal_count sorted by medal_count desc and athlete asc, top 10 only.',
      starterSql: 'SELECT athlete, COUNT(*) AS medal_count\nFROM medals\nGROUP BY athlete\nORDER BY medal_count DESC, athlete ASC\nLIMIT 10;',
      solutionSql: 'SELECT athlete, COUNT(*) AS medal_count\nFROM medals\nGROUP BY athlete\nORDER BY medal_count DESC, athlete ASC\nLIMIT 10;',
      hints: [
        'Group by athlete.',
        'Use COUNT(*).',
        'Sort with deterministic tie-breaker.'
      ],
      sampleTables: [
        {
          tableName: 'medals',
          columns: [
            { columnName: 'athlete', dataType: 'VARCHAR(80)' },
            { columnName: 'medal', dataType: 'VARCHAR(10)' }
          ],
          rows: [
            { athlete: 'Bolt', medal: 'Gold' },
            { athlete: 'Bolt', medal: 'Gold' },
            { athlete: 'Phelps', medal: 'Gold' },
            { athlete: 'Phelps', medal: 'Silver' },
            { athlete: 'Nadia', medal: 'Gold' },
            { athlete: 'Nadia', medal: 'Bronze' },
            { athlete: 'Bolt', medal: 'Silver' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['athlete', 'medal_count'],
        value: [
          { athlete: 'Bolt', medal_count: 3 },
          { athlete: 'Nadia', medal_count: 2 },
          { athlete: 'Phelps', medal_count: 2 }
        ]
      }
    },
    {
      title: 'Netflix Shows After 2020',
      difficulty: 'Easy',
      topic: 'WHERE',
      tags: ['filter'],
      datasetKey: 'netflix',
      description: 'Filter shows by release year.',
      question: 'Return title and release_year for entries where release_year > 2020 sorted by release_year then title.',
      starterSql: 'SELECT title, release_year\nFROM shows\nWHERE release_year > 2020\nORDER BY release_year ASC, title ASC;',
      solutionSql: 'SELECT title, release_year\nFROM shows\nWHERE release_year > 2020\nORDER BY release_year ASC, title ASC;',
      hints: [
        'Use WHERE release_year > 2020.',
        'Select only requested columns.',
        'Add ORDER BY for deterministic result.'
      ],
      sampleTables: [
        {
          tableName: 'shows',
          columns: [
            { columnName: 'title', dataType: 'VARCHAR(120)' },
            { columnName: 'release_year', dataType: 'INTEGER' }
          ],
          rows: [
            { title: 'Show A', release_year: 2019 },
            { title: 'Show B', release_year: 2021 },
            { title: 'Show C', release_year: 2023 },
            { title: 'Show D', release_year: 2020 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['title', 'release_year'],
        value: [
          { title: 'Show B', release_year: 2021 },
          { title: 'Show C', release_year: 2023 }
        ]
      }
    },
    {
      title: 'Top Directors by Show Count',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['aggregation'],
      datasetKey: 'netflix',
      description: 'Rank directors by number of shows.',
      question: 'Return director and show_count sorted by show_count desc then director asc.',
      starterSql: 'SELECT director, COUNT(*) AS show_count\nFROM shows\nGROUP BY director\nORDER BY show_count DESC, director ASC;',
      solutionSql: 'SELECT director, COUNT(*) AS show_count\nFROM shows\nGROUP BY director\nORDER BY show_count DESC, director ASC;',
      hints: [
        'Count rows grouped by director.',
        'Alias aggregate as show_count.',
        'Sort descending on show_count.'
      ],
      sampleTables: [
        {
          tableName: 'shows',
          columns: [
            { columnName: 'title', dataType: 'VARCHAR(120)' },
            { columnName: 'director', dataType: 'VARCHAR(80)' }
          ],
          rows: [
            { title: 'A', director: 'Dir 1' },
            { title: 'B', director: 'Dir 2' },
            { title: 'C', director: 'Dir 1' },
            { title: 'D', director: 'Dir 3' },
            { title: 'E', director: 'Dir 2' },
            { title: 'F', director: 'Dir 2' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['director', 'show_count'],
        value: [
          { director: 'Dir 2', show_count: 3 },
          { director: 'Dir 1', show_count: 2 },
          { director: 'Dir 3', show_count: 1 }
        ]
      }
    },
    {
      title: 'Superstore Sales By Region',
      difficulty: 'Easy',
      topic: 'GROUP BY',
      tags: ['superstore', 'aggregation'],
      datasetKey: 'superstore',
      description: 'Aggregate sales totals by region.',
      question: 'Return region and total_sales sorted by total_sales descending.',
      starterSql: 'SELECT region, SUM(sales) AS total_sales\nFROM orders\nGROUP BY region\nORDER BY total_sales DESC;',
      solutionSql: 'SELECT region, SUM(sales) AS total_sales\nFROM orders\nGROUP BY region\nORDER BY total_sales DESC, region ASC;',
      hints: [
        'Use SUM(sales) with GROUP BY region.',
        'Sort by total_sales descending.',
        'Add a tie-breaker for deterministic order.'
      ],
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { columnName: 'order_id', dataType: 'VARCHAR(20)' },
            { columnName: 'region', dataType: 'VARCHAR(20)' },
            { columnName: 'sales', dataType: 'DECIMAL(10,2)' }
          ],
          rows: [
            { order_id: 'S1', region: 'East', sales: 500.0 },
            { order_id: 'S2', region: 'West', sales: 900.0 },
            { order_id: 'S3', region: 'East', sales: 400.0 },
            { order_id: 'S4', region: 'South', sales: 600.0 },
            { order_id: 'S5', region: 'West', sales: 300.0 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['region', 'total_sales'],
        value: [
          { region: 'West', total_sales: 1200.0 },
          { region: 'East', total_sales: 900.0 },
          { region: 'South', total_sales: 600.0 }
        ]
      }
    },
    {
      title: 'Superstore Top Product By Quantity',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['superstore', 'limit'],
      datasetKey: 'superstore',
      description: 'Find most sold product by quantity.',
      question: 'Return product_name and total_qty for the highest sold product.',
      starterSql: 'SELECT product_name, SUM(quantity) AS total_qty\nFROM orders\nGROUP BY product_name\nORDER BY total_qty DESC\nLIMIT 1;',
      solutionSql: 'SELECT product_name, SUM(quantity) AS total_qty\nFROM orders\nGROUP BY product_name\nORDER BY total_qty DESC, product_name ASC\nLIMIT 1;',
      hints: [
        'Aggregate quantity per product.',
        'Sort by total_qty descending.',
        'Return only one row using LIMIT 1.'
      ],
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { columnName: 'order_id', dataType: 'VARCHAR(20)' },
            { columnName: 'product_name', dataType: 'VARCHAR(80)' },
            { columnName: 'quantity', dataType: 'INTEGER' }
          ],
          rows: [
            { order_id: 'Q1', product_name: 'Chair', quantity: 3 },
            { order_id: 'Q2', product_name: 'Table', quantity: 2 },
            { order_id: 'Q3', product_name: 'Chair', quantity: 4 },
            { order_id: 'Q4', product_name: 'Pen', quantity: 10 },
            { order_id: 'Q5', product_name: 'Pen', quantity: 5 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['product_name', 'total_qty'],
        value: [
          { product_name: 'Pen', total_qty: 15 }
        ]
      }
    },
    {
      title: 'Superstore Orders With High Discount',
      difficulty: 'Easy',
      topic: 'WHERE',
      tags: ['superstore', 'filter'],
      datasetKey: 'superstore',
      description: 'Filter rows by discount threshold.',
      question: 'Return order_id and discount where discount >= 0.20 sorted by discount desc.',
      starterSql: 'SELECT order_id, discount\nFROM orders\nWHERE discount >= 0.20\nORDER BY discount DESC, order_id ASC;',
      solutionSql: 'SELECT order_id, discount\nFROM orders\nWHERE discount >= 0.20\nORDER BY discount DESC, order_id ASC;',
      hints: [
        'Use WHERE with >= 0.20.',
        'Return only the required columns.',
        'Sort by discount descending.'
      ],
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { columnName: 'order_id', dataType: 'VARCHAR(20)' },
            { columnName: 'discount', dataType: 'DECIMAL(4,2)' }
          ],
          rows: [
            { order_id: 'D1', discount: 0.10 },
            { order_id: 'D2', discount: 0.25 },
            { order_id: 'D3', discount: 0.30 },
            { order_id: 'D4', discount: 0.05 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['order_id', 'discount'],
        value: [
          { order_id: 'D3', discount: 0.30 },
          { order_id: 'D2', discount: 0.25 }
        ]
      }
    },
    {
      title: 'Olympics Medal Count By Country',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['olympics', 'aggregation'],
      datasetKey: 'olympics',
      description: 'Count total medals won by each country.',
      question: 'Return country and medal_count sorted by medal_count desc then country asc.',
      starterSql: 'SELECT country, COUNT(*) AS medal_count\nFROM medals\nGROUP BY country\nORDER BY medal_count DESC, country ASC;',
      solutionSql: 'SELECT country, COUNT(*) AS medal_count\nFROM medals\nGROUP BY country\nORDER BY medal_count DESC, country ASC;',
      hints: [
        'Group by country.',
        'Use COUNT(*) for total medals.',
        'Sort with count descending.'
      ],
      sampleTables: [
        {
          tableName: 'medals',
          columns: [
            { columnName: 'country', dataType: 'VARCHAR(50)' },
            { columnName: 'medal', dataType: 'VARCHAR(10)' }
          ],
          rows: [
            { country: 'USA', medal: 'Gold' },
            { country: 'USA', medal: 'Bronze' },
            { country: 'China', medal: 'Gold' },
            { country: 'India', medal: 'Silver' },
            { country: 'China', medal: 'Bronze' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['country', 'medal_count'],
        value: [
          { country: 'China', medal_count: 2 },
          { country: 'USA', medal_count: 2 },
          { country: 'India', medal_count: 1 }
        ]
      }
    },
    {
      title: 'Olympics Countries With More Than 1 Gold',
      difficulty: 'Hard',
      topic: 'HAVING',
      tags: ['olympics', 'having'],
      datasetKey: 'olympics',
      description: 'Use HAVING to filter grouped gold medal counts.',
      question: 'Return country and gold_count for countries with gold_count > 1.',
      starterSql: 'SELECT country, COUNT(*) AS gold_count\nFROM medals\nWHERE medal = \'Gold\'\nGROUP BY country\nHAVING COUNT(*) > 1\nORDER BY gold_count DESC, country ASC;',
      solutionSql: 'SELECT country, COUNT(*) AS gold_count\nFROM medals\nWHERE medal = \'Gold\'\nGROUP BY country\nHAVING COUNT(*) > 1\nORDER BY gold_count DESC, country ASC;',
      hints: [
        'Filter medal type first in WHERE.',
        'Group by country and count.',
        'Use HAVING COUNT(*) > 1.'
      ],
      sampleTables: [
        {
          tableName: 'medals',
          columns: [
            { columnName: 'country', dataType: 'VARCHAR(50)' },
            { columnName: 'medal', dataType: 'VARCHAR(10)' }
          ],
          rows: [
            { country: 'USA', medal: 'Gold' },
            { country: 'USA', medal: 'Gold' },
            { country: 'China', medal: 'Gold' },
            { country: 'China', medal: 'Silver' },
            { country: 'India', medal: 'Gold' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['country', 'gold_count'],
        value: [
          { country: 'USA', gold_count: 2 }
        ]
      }
    },
    {
      title: 'Netflix Shows Count By Type',
      difficulty: 'Easy',
      topic: 'GROUP BY',
      tags: ['netflix', 'count'],
      datasetKey: 'netflix',
      description: 'Count Movies and TV Shows.',
      question: 'Return type and total_count sorted by total_count descending.',
      starterSql: 'SELECT type, COUNT(*) AS total_count\nFROM shows\nGROUP BY type\nORDER BY total_count DESC, type ASC;',
      solutionSql: 'SELECT type, COUNT(*) AS total_count\nFROM shows\nGROUP BY type\nORDER BY total_count DESC, type ASC;',
      hints: [
        'Group by type.',
        'Count rows in each group.',
        'Sort by total_count descending.'
      ],
      sampleTables: [
        {
          tableName: 'shows',
          columns: [
            { columnName: 'title', dataType: 'VARCHAR(120)' },
            { columnName: 'type', dataType: 'VARCHAR(20)' }
          ],
          rows: [
            { title: 'M1', type: 'Movie' },
            { title: 'M2', type: 'Movie' },
            { title: 'S1', type: 'TV Show' },
            { title: 'S2', type: 'TV Show' },
            { title: 'S3', type: 'TV Show' }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['type', 'total_count'],
        value: [
          { type: 'TV Show', total_count: 3 },
          { type: 'Movie', total_count: 2 }
        ]
      }
    },
    {
      title: 'Netflix Top Release Year',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['netflix', 'year'],
      datasetKey: 'netflix',
      description: 'Find the year with highest number of releases.',
      question: 'Return release_year and total_releases for the top year.',
      starterSql: 'SELECT release_year, COUNT(*) AS total_releases\nFROM shows\nGROUP BY release_year\nORDER BY total_releases DESC, release_year DESC\nLIMIT 1;',
      solutionSql: 'SELECT release_year, COUNT(*) AS total_releases\nFROM shows\nGROUP BY release_year\nORDER BY total_releases DESC, release_year DESC\nLIMIT 1;',
      hints: [
        'Group by release_year.',
        'Count records per year.',
        'Limit result to one row.'
      ],
      sampleTables: [
        {
          tableName: 'shows',
          columns: [
            { columnName: 'title', dataType: 'VARCHAR(120)' },
            { columnName: 'release_year', dataType: 'INTEGER' }
          ],
          rows: [
            { title: 'A', release_year: 2019 },
            { title: 'B', release_year: 2020 },
            { title: 'C', release_year: 2020 },
            { title: 'D', release_year: 2021 },
            { title: 'E', release_year: 2020 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['release_year', 'total_releases'],
        value: [
          { release_year: 2020, total_releases: 3 }
        ]
      }
    },
    {
      title: 'AdventureWorks Sales By Territory',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['adventureworks', 'aggregation'],
      datasetKey: 'adventureworks',
      description: 'Compute sales by territory from sales headers.',
      question: 'Return territory_name and total_sales sorted by total_sales descending.',
      starterSql: 'SELECT t.territory_name, SUM(h.total_due) AS total_sales\nFROM sales_order_header h\nJOIN sales_territory t ON t.territory_id = h.territory_id\nGROUP BY t.territory_name\nORDER BY total_sales DESC;',
      solutionSql: 'SELECT t.territory_name, SUM(h.total_due) AS total_sales\nFROM sales_order_header h\nJOIN sales_territory t ON t.territory_id = h.territory_id\nGROUP BY t.territory_name\nORDER BY total_sales DESC, t.territory_name ASC;',
      hints: [
        'Join sales header with territory lookup.',
        'Aggregate SUM(total_due).',
        'Group by territory_name.'
      ],
      sampleTables: [
        {
          tableName: 'sales_territory',
          columns: [
            { columnName: 'territory_id', dataType: 'INTEGER' },
            { columnName: 'territory_name', dataType: 'VARCHAR(60)' }
          ],
          rows: [
            { territory_id: 1, territory_name: 'Northwest' },
            { territory_id: 2, territory_name: 'Southwest' }
          ]
        },
        {
          tableName: 'sales_order_header',
          columns: [
            { columnName: 'sales_order_id', dataType: 'INTEGER' },
            { columnName: 'territory_id', dataType: 'INTEGER' },
            { columnName: 'total_due', dataType: 'DECIMAL(10,2)' }
          ],
          rows: [
            { sales_order_id: 10, territory_id: 1, total_due: 1500.0 },
            { sales_order_id: 11, territory_id: 1, total_due: 800.0 },
            { sales_order_id: 12, territory_id: 2, total_due: 2600.0 }
          ]
        }
      ],
      expectedOutput: {
        type: 'table',
        columns: ['territory_name', 'total_sales'],
        value: [
          { territory_name: 'Southwest', total_sales: 2600.0 },
          { territory_name: 'Northwest', total_sales: 2300.0 }
        ]
      }
    },
    {
      title: 'AdventureWorks Customers Without Orders',
      difficulty: 'Hard',
      topic: 'JOIN',
      tags: ['left join', 'null checks'],
      datasetKey: 'adventureworks',
      description: 'Find customers who never placed an order.',
      question: 'Return customer_id values that do not appear in sales_order_header.',
      starterSql: 'SELECT c.customer_id\nFROM customer c\nLEFT JOIN sales_order_header h ON h.customer_id = c.customer_id\nWHERE h.customer_id IS NULL\nORDER BY c.customer_id;',
      solutionSql: 'SELECT c.customer_id\nFROM customer c\nLEFT JOIN sales_order_header h ON h.customer_id = c.customer_id\nWHERE h.customer_id IS NULL\nORDER BY c.customer_id;',
      hints: [
        'Use LEFT JOIN from customer to orders.',
        'Filter rows where right side is NULL.',
        'Order by customer_id.'
      ],
      sampleTables: [
        {
          tableName: 'customer',
          columns: [
            { columnName: 'customer_id', dataType: 'INTEGER' }
          ],
          rows: [
            { customer_id: 1 },
            { customer_id: 2 },
            { customer_id: 3 },
            { customer_id: 4 }
          ]
        },
        {
          tableName: 'sales_order_header',
          columns: [
            { columnName: 'sales_order_id', dataType: 'INTEGER' },
            { columnName: 'customer_id', dataType: 'INTEGER' }
          ],
          rows: [
            { sales_order_id: 100, customer_id: 1 },
            { sales_order_id: 101, customer_id: 3 }
          ]
        }
      ],
      expectedOutput: {
        type: 'column',
        columns: ['customer_id'],
        value: [
          { customer_id: 2 },
          { customer_id: 4 }
        ]
      }
    }
  ]
};
