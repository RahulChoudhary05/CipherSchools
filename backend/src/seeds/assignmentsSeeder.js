const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sampleAssignments = [
  // ===== EASY =====
  {
    title: "Select All Employees",
    difficulty: "Easy",
    description: "Practice basic SELECT queries to retrieve all records from a table.",
    topic: "SELECT",
    question: "Write a SQL query to retrieve all columns from the `employees` table.",
    hints: [
      "Use the SELECT statement with * to get all columns",
      "The syntax is: SELECT * FROM table_name"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" },
          { columnName: "hire_date", dataType: "DATE" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 75000, hire_date: "2020-01-15" },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 45000, hire_date: "2021-03-20" },
          { id: 3, name: "Carol White", department: "Engineering", salary: 82000, hire_date: "2019-07-10" },
          { id: 4, name: "David Brown", department: "HR", salary: 55000, hire_date: "2022-02-01" },
          { id: 5, name: "Eve Davis", department: "Sales", salary: 48000, hire_date: "2021-06-15" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["id", "name", "department", "salary", "hire_date"],
      value: [
        { id: 1, name: "Alice Johnson", department: "Engineering", salary: 75000, hire_date: "2020-01-15" },
        { id: 2, name: "Bob Smith", department: "Marketing", salary: 45000, hire_date: "2021-03-20" },
        { id: 3, name: "Carol White", department: "Engineering", salary: 82000, hire_date: "2019-07-10" },
        { id: 4, name: "David Brown", department: "HR", salary: 55000, hire_date: "2022-02-01" },
        { id: 5, name: "Eve Davis", department: "Sales", salary: 48000, hire_date: "2021-06-15" }
      ]
    }
  },
  {
    title: "Filter by Salary",
    difficulty: "Easy",
    description: "Use WHERE clause to filter records based on conditions.",
    topic: "WHERE",
    question: "Write a query to select all columns from the `employees` table where the salary is greater than 50000.",
    hints: [
      "Use the WHERE clause to filter rows",
      "Use the > operator for greater than comparison",
      "Think about which column stores salary information"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" },
          { columnName: "hire_date", dataType: "DATE" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 75000, hire_date: "2020-01-15" },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 45000, hire_date: "2021-03-20" },
          { id: 3, name: "Carol White", department: "Engineering", salary: 82000, hire_date: "2019-07-10" },
          { id: 4, name: "David Brown", department: "HR", salary: 55000, hire_date: "2022-02-01" },
          { id: 5, name: "Eve Davis", department: "Sales", salary: 48000, hire_date: "2021-06-15" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["id", "name", "department", "salary", "hire_date"],
      value: [
        { id: 1, name: "Alice Johnson", department: "Engineering", salary: 75000, hire_date: "2020-01-15" },
        { id: 3, name: "Carol White", department: "Engineering", salary: 82000, hire_date: "2019-07-10" },
        { id: 4, name: "David Brown", department: "HR", salary: 55000, hire_date: "2022-02-01" }
      ]
    }
  },
  {
    title: "Count Total Products",
    difficulty: "Easy",
    description: "Use aggregate COUNT function to count rows in a table.",
    topic: "Aggregate",
    question: "Write a query to count the total number of products in the `products` table. Return the result with column alias `total_products`.",
    hints: [
      "Use the COUNT() aggregate function",
      "Use AS keyword to create an alias for the result column",
      "COUNT(*) counts all rows including nulls"
    ],
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "category", dataType: "VARCHAR(50)" },
          { columnName: "price", dataType: "DECIMAL(10,2)" },
          { columnName: "stock", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Laptop Pro", category: "Electronics", price: 1299.99, stock: 50 },
          { id: 2, name: "Wireless Mouse", category: "Electronics", price: 29.99, stock: 200 },
          { id: 3, name: "Desk Chair", category: "Furniture", price: 349.99, stock: 30 },
          { id: 4, name: "Coffee Mug", category: "Kitchen", price: 12.99, stock: 500 },
          { id: 5, name: "Notebook", category: "Stationery", price: 4.99, stock: 1000 },
          { id: 6, name: "USB Hub", category: "Electronics", price: 39.99, stock: 150 }
        ]
      }
    ],
    expectedOutput: {
      type: "single_value",
      columns: ["total_products"],
      value: [{ total_products: 6 }]
    }
  },
  {
    title: "String Functions - UPPER & LENGTH",
    difficulty: "Easy",
    description: "Practice using SQL string manipulation functions.",
    topic: "String Functions",
    question: "Display all employee names in UPPERCASE along with the length of their names. Alias the columns as `name_upper` and `name_length`. Only show employees whose name length is greater than 8 characters.",
    hints: [
      "Use UPPER() function to convert string to uppercase",
      "Use LENGTH() or CHAR_LENGTH() function to get string length",
      "Apply the WHERE clause with LENGTH() to filter results"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" }
        ],
        rows: [
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Smith" },
          { id: 3, name: "Bob Johnson" },
          { id: 4, name: "Alice Williams" },
          { id: 5, name: "Tom Lee" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name_upper", "name_length"],
      value: [
        { name_upper: "JANE SMITH", name_length: 10 },
        { name_upper: "BOB JOHNSON", name_length: 11 },
        { name_upper: "ALICE WILLIAMS", name_length: 14 }
      ]
    }
  },
  {
    title: "ORDER BY - Sort Products",
    difficulty: "Easy",
    description: "Learn how to sort query results using ORDER BY.",
    topic: "ORDER BY",
    question: "Retrieve all products from the `products` table, ordered by price in descending order. Show only the `name` and `price` columns.",
    hints: [
      "Use ORDER BY clause at the end of your SELECT query",
      "Use DESC keyword for descending order (highest first)",
      "Specify only the required columns after SELECT"
    ],
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "category", dataType: "VARCHAR(50)" },
          { columnName: "price", dataType: "DECIMAL(10,2)" }
        ],
        rows: [
          { id: 1, name: "Laptop Pro", category: "Electronics", price: 1299.99 },
          { id: 2, name: "Wireless Mouse", category: "Electronics", price: 29.99 },
          { id: 3, name: "Desk Chair", category: "Furniture", price: 349.99 },
          { id: 4, name: "Coffee Mug", category: "Kitchen", price: 12.99 },
          { id: 5, name: "Notebook", category: "Stationery", price: 4.99 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "price"],
      value: [
        { name: "Laptop Pro", price: 1299.99 },
        { name: "Desk Chair", price: 349.99 },
        { name: "Wireless Mouse", price: 29.99 },
        { name: "Coffee Mug", price: 12.99 },
        { name: "Notebook", price: 4.99 }
      ]
    }
  },
  {
    title: "DISTINCT Values",
    difficulty: "Easy",
    description: "Use DISTINCT to remove duplicate values from results.",
    topic: "DISTINCT",
    question: "Write a query to get all unique departments from the `employees` table. Order results alphabetically.",
    hints: [
      "Use the DISTINCT keyword after SELECT",
      "DISTINCT removes duplicate rows from results",
      "Use ORDER BY to sort alphabetically (ASC is default)"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 82000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Sales", salary: 48000 },
          { id: 6, name: "Frank", department: "Marketing", salary: 50000 },
          { id: 7, name: "Grace", department: "HR", salary: 62000 }
        ]
      }
    ],
    expectedOutput: {
      type: "column",
      columns: ["department"],
      value: [
        { department: "Engineering" },
        { department: "HR" },
        { department: "Marketing" },
        { department: "Sales" }
      ]
    }
  },

  // ===== MEDIUM =====
  {
    title: "INNER JOIN - Employees & Departments",
    difficulty: "Medium",
    description: "Practice combining data from multiple tables using JOIN clauses.",
    topic: "JOIN",
    question: "Write a query to display employee `name` and their `dept_name` by joining the `employees` and `departments` tables.",
    hints: [
      "Use INNER JOIN to combine rows from two tables",
      "Join on the common key: employees.dept_id = departments.id",
      "Specify the columns you want from each table"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "dept_id", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", dept_id: 1 },
          { id: 2, name: "Bob Smith", dept_id: 2 },
          { id: 3, name: "Carol White", dept_id: 1 },
          { id: 4, name: "David Brown", dept_id: 3 }
        ]
      },
      {
        tableName: "departments",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "dept_name", dataType: "VARCHAR(50)" }
        ],
        rows: [
          { id: 1, dept_name: "Engineering" },
          { id: 2, dept_name: "Marketing" },
          { id: 3, dept_name: "HR" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "dept_name"],
      value: [
        { name: "Alice Johnson", dept_name: "Engineering" },
        { name: "Bob Smith", dept_name: "Marketing" },
        { name: "Carol White", dept_name: "Engineering" },
        { name: "David Brown", dept_name: "HR" }
      ]
    }
  },
  {
    title: "GROUP BY - Avg Salary per Department",
    difficulty: "Medium",
    description: "Master GROUP BY and aggregate functions like AVG.",
    topic: "GROUP BY",
    question: "Find the average salary for each department. Show `department` and `avg_salary` (rounded to 0 decimal places). Order by `avg_salary` descending.",
    hints: [
      "Use GROUP BY to group rows by department",
      "Use AVG() to calculate average salary",
      "Use ROUND() to round to 0 decimal places",
      "ORDER BY avg_salary DESC for descending order"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 82000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Marketing", salary: 48000 },
          { id: 6, name: "Frank", department: "Engineering", salary: 90000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["department", "avg_salary"],
      value: [
        { department: "Engineering", avg_salary: 82333 },
        { department: "HR", avg_salary: 55000 },
        { department: "Marketing", avg_salary: 46500 }
      ]
    }
  },
  {
    title: "HAVING Clause - High Budget Departments",
    difficulty: "Medium",
    description: "Use HAVING to filter grouped results.",
    topic: "HAVING",
    question: "Find departments where the total salary budget exceeds 100000. Show `department` and `total_salary`. Order alphabetically by department.",
    hints: [
      "Use GROUP BY to group by department",
      "Use SUM() to calculate total salary",
      "Use HAVING to filter after grouping (not WHERE)",
      "HAVING works on aggregated values, WHERE does not"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 82000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Marketing", salary: 48000 },
          { id: 6, name: "Frank", department: "Engineering", salary: 90000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["department", "total_salary"],
      value: [
        { department: "Engineering", total_salary: 247000 }
      ]
    }
  },
  {
    title: "LEFT JOIN - All Customers & Orders",
    difficulty: "Medium",
    description: "Use LEFT JOIN to include all rows from the left table.",
    topic: "JOIN",
    question: "List all customers with their order count. Include customers with no orders (show 0). Return `customer_name` and `order_count`. Order by `order_count` descending.",
    hints: [
      "Use LEFT JOIN to include all customers even without orders",
      "Use COUNT() with GROUP BY to count orders per customer",
      "COALESCE() or COUNT() on joined table handles NULLs",
      "COUNT(orders.id) returns 0 for customers with no orders"
    ],
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_name", dataType: "VARCHAR(100)" },
          { columnName: "email", dataType: "VARCHAR(100)" }
        ],
        rows: [
          { id: 1, customer_name: "Emma Wilson", email: "emma@example.com" },
          { id: 2, customer_name: "Liam Brown", email: "liam@example.com" },
          { id: 3, customer_name: "Sophia Lee", email: "sophia@example.com" },
          { id: 4, customer_name: "Noah Davis", email: "noah@example.com" }
        ]
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "product", dataType: "VARCHAR(100)" },
          { columnName: "amount", dataType: "DECIMAL(10,2)" }
        ],
        rows: [
          { id: 1, customer_id: 1, product: "Laptop", amount: 1200.00 },
          { id: 2, customer_id: 1, product: "Mouse", amount: 25.00 },
          { id: 3, customer_id: 2, product: "Keyboard", amount: 80.00 },
          { id: 4, customer_id: 1, product: "Monitor", amount: 400.00 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["customer_name", "order_count"],
      value: [
        { customer_name: "Emma Wilson", order_count: 3 },
        { customer_name: "Liam Brown", order_count: 1 },
        { customer_name: "Noah Davis", order_count: 0 },
        { customer_name: "Sophia Lee", order_count: 0 }
      ]
    }
  },
  {
    title: "Date Functions - Recent Hires",
    difficulty: "Medium",
    description: "Use date functions to filter and format date data.",
    topic: "Date Functions",
    question: "Find employees hired after January 1st, 2021. Show their `name` and `hire_date`. Order by `hire_date` ascending.",
    hints: [
      "Use WHERE with date comparison: hire_date > '2021-01-01'",
      "Dates use the format YYYY-MM-DD",
      "Use ORDER BY hire_date ASC for ascending order"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" },
          { columnName: "hire_date", dataType: "DATE" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 75000, hire_date: "2020-01-15" },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 45000, hire_date: "2021-03-20" },
          { id: 3, name: "Carol White", department: "Engineering", salary: 82000, hire_date: "2019-07-10" },
          { id: 4, name: "David Brown", department: "HR", salary: 55000, hire_date: "2022-02-01" },
          { id: 5, name: "Eve Davis", department: "Sales", salary: 48000, hire_date: "2021-06-15" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "hire_date"],
      value: [
        { name: "Bob Smith", hire_date: "2021-03-20" },
        { name: "Eve Davis", hire_date: "2021-06-15" },
        { name: "David Brown", hire_date: "2022-02-01" }
      ]
    }
  },
  {
    title: "LIKE - Search by Pattern",
    difficulty: "Medium",
    description: "Use LIKE operator for pattern matching in SQL.",
    topic: "LIKE",
    question: "Find all products whose name starts with 'W' or contains 'Pro'. Return `name` and `price`. Order by `name` ascending.",
    hints: [
      "Use LIKE with wildcard % for pattern matching",
      "'W%' matches strings starting with W",
      "'%Pro%' matches strings containing Pro",
      "Combine conditions with OR operator"
    ],
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "category", dataType: "VARCHAR(50)" },
          { columnName: "price", dataType: "DECIMAL(10,2)" }
        ],
        rows: [
          { id: 1, name: "Laptop Pro", category: "Electronics", price: 1299.99 },
          { id: 2, name: "Wireless Mouse", category: "Electronics", price: 29.99 },
          { id: 3, name: "Desk Chair", category: "Furniture", price: 349.99 },
          { id: 4, name: "Web Camera Pro", category: "Electronics", price: 89.99 },
          { id: 5, name: "Notebook", category: "Stationery", price: 4.99 },
          { id: 6, name: "WiFi Router", category: "Electronics", price: 59.99 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "price"],
      value: [
        { name: "Laptop Pro", price: 1299.99 },
        { name: "Web Camera Pro", price: 89.99 },
        { name: "WiFi Router", price: 59.99 },
        { name: "Wireless Mouse", price: 29.99 }
      ]
    }
  },

  // ===== HARD =====
  {
    title: "Subquery - Above Average Salary",
    difficulty: "Hard",
    description: "Use subqueries to solve complex filtering problems.",
    topic: "Subquery",
    question: "Find all employees whose salary is above the average salary of ALL employees. Return `name`, `department`, and `salary`. Order by `salary` descending.",
    hints: [
      "Use a subquery to calculate the average salary: SELECT AVG(salary) FROM employees",
      "Use the result in your WHERE clause: WHERE salary > (subquery)",
      "The subquery goes inside parentheses in the WHERE clause"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 95000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Marketing", salary: 52000 },
          { id: 6, name: "Frank", department: "Engineering", salary: 70000 },
          { id: 7, name: "Grace", department: "HR", salary: 48000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "department", "salary"],
      value: [
        { name: "Carol", department: "Engineering", salary: 95000 },
        { name: "Alice", department: "Engineering", salary: 75000 },
        { name: "Frank", department: "Engineering", salary: 70000 },
        { name: "David", department: "HR", salary: 55000 }
      ]
    }
  },
  {
    title: "Correlated Subquery - Dept Leaders",
    difficulty: "Hard",
    description: "Use correlated subqueries to compare values within groups.",
    topic: "Subquery",
    question: "Find employees who earn the maximum salary in their respective department. Return `name`, `department`, and `salary`.",
    hints: [
      "Use a correlated subquery that references the outer query's department",
      "The subquery: SELECT MAX(salary) FROM employees e2 WHERE e2.department = e1.department",
      "A correlated subquery references the outer table alias"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 95000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Marketing", salary: 52000 },
          { id: 6, name: "Frank", department: "Engineering", salary: 70000 },
          { id: 7, name: "Grace", department: "HR", salary: 62000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "department", "salary"],
      value: [
        { name: "Carol", department: "Engineering", salary: 95000 },
        { name: "Eve", department: "Marketing", salary: 52000 },
        { name: "Grace", department: "HR", salary: 62000 }
      ]
    }
  },
  {
    title: "Window Function - Row Number",
    difficulty: "Hard",
    description: "Use window functions to rank employees within partitions.",
    topic: "Window Functions",
    question: "Rank employees within each department by salary (highest first). Return `name`, `department`, `salary`, and `rank_in_dept`. Show only employees with rank 1 or 2.",
    hints: [
      "Use ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)",
      "Wrap the window function query in a subquery or CTE",
      "Filter the outer query: WHERE rank_in_dept <= 2"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", department: "Engineering", salary: 75000 },
          { id: 2, name: "Bob", department: "Marketing", salary: 45000 },
          { id: 3, name: "Carol", department: "Engineering", salary: 95000 },
          { id: 4, name: "David", department: "HR", salary: 55000 },
          { id: 5, name: "Eve", department: "Marketing", salary: 52000 },
          { id: 6, name: "Frank", department: "Engineering", salary: 70000 },
          { id: 7, name: "Grace", department: "HR", salary: 62000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["name", "department", "salary", "rank_in_dept"],
      value: [
        { name: "Carol", department: "Engineering", salary: 95000, rank_in_dept: 1 },
        { name: "Alice", department: "Engineering", salary: 75000, rank_in_dept: 2 },
        { name: "Grace", department: "HR", salary: 62000, rank_in_dept: 1 },
        { name: "David", department: "HR", salary: 55000, rank_in_dept: 2 },
        { name: "Eve", department: "Marketing", salary: 52000, rank_in_dept: 1 },
        { name: "Bob", department: "Marketing", salary: 45000, rank_in_dept: 2 }
      ]
    }
  },
  {
    title: "CTE - Sales Analysis",
    difficulty: "Hard",
    description: "Use Common Table Expressions (CTEs) for cleaner complex queries.",
    topic: "CTE",
    question: "Using a CTE, find customers whose total order amount exceeds 500. Return `customer_name` and `total_spent`. Order by `total_spent` descending.",
    hints: [
      "Use WITH clause to define a CTE: WITH cte_name AS (SELECT ...)",
      "In the CTE, join customers and orders, GROUP BY customer",
      "In the main query, filter WHERE total_spent > 500"
    ],
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_name", dataType: "VARCHAR(100)" }
        ],
        rows: [
          { id: 1, customer_name: "Emma Wilson" },
          { id: 2, customer_name: "Liam Brown" },
          { id: 3, customer_name: "Sophia Lee" },
          { id: 4, customer_name: "Noah Davis" }
        ]
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "amount", dataType: "DECIMAL(10,2)" }
        ],
        rows: [
          { id: 1, customer_id: 1, amount: 1200.00 },
          { id: 2, customer_id: 1, amount: 250.00 },
          { id: 3, customer_id: 2, amount: 80.00 },
          { id: 4, customer_id: 3, amount: 400.00 },
          { id: 5, customer_id: 3, amount: 350.00 },
          { id: 6, customer_id: 4, amount: 50.00 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["customer_name", "total_spent"],
      value: [
        { customer_name: "Emma Wilson", total_spent: 1450.00 },
        { customer_name: "Sophia Lee", total_spent: 750.00 }
      ]
    }
  },
  {
    title: "SELF JOIN - Employee Manager",
    difficulty: "Hard",
    description: "Use self-join to relate rows within the same table.",
    topic: "JOIN",
    question: "Display each employee's name and their manager's name. If an employee has no manager, show NULL. Return `employee_name` and `manager_name`. Order by `employee_name`.",
    hints: [
      "Self-join means joining a table with itself using aliases",
      "Use LEFT JOIN employees manager ON e.manager_id = manager.id",
      "Use two aliases: one for employees (e), one for managers (m)"
    ],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" },
          { columnName: "manager_id", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "Alice", manager_id: null },
          { id: 2, name: "Bob", manager_id: 1 },
          { id: 3, name: "Carol", manager_id: 1 },
          { id: 4, name: "David", manager_id: 2 },
          { id: 5, name: "Eve", manager_id: 2 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      columns: ["employee_name", "manager_name"],
      value: [
        { employee_name: "Alice", manager_name: null },
        { employee_name: "Bob", manager_name: "Alice" },
        { employee_name: "Carol", manager_name: "Alice" },
        { employee_name: "David", manager_name: "Bob" },
        { employee_name: "Eve", manager_name: "Bob" }
      ]
    }
  }
];

async function seedAssignments() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphersqlstudio'
    );
    console.log('✅ Connected to MongoDB');

    await Assignment.deleteMany({});
    console.log('🗑️  Cleared existing assignments');

    const result = await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Seeded ${result.length} assignments successfully\n`);

    result.forEach((assignment, index) => {
      console.log(`   ${index + 1}. [${assignment.difficulty}] ${assignment.title} (${assignment.topic})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAssignments();
