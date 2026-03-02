# 🔐 CipherSQLStudio

**A browser-based SQL learning platform** where students practice SQL queries against pre-configured assignments with real-time execution and AI-powered hints — inspired by LeetCode and SQL-Practice.com.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.x
- npm ≥ 9.x
- MongoDB Atlas account (free tier)
- PostgreSQL on Neon.tech (free tier)
- Google Gemini API key (free)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies  
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` → `backend/.env`:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ciphersqlstudio
DATABASE_URL=postgresql://<user>:<pass>@ep-xxxx.neon.tech/neondb?sslmode=require

LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
ALLOW_HINT_FALLBACK=true
```

**Frontend** — `frontend/.env` already set to:

```env
VITE_API_URL=https://ciphersqlstudio-1km8.onrender.com/api
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This seeds SQL assignments across Easy / Medium / Hard difficulty.

### 4. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
CipherSQLStudio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL (Neon) + MongoDB connections
│   │   ├── controllers/
│   │   │   ├── assignmentController.js  # Workspace creation & CRUD
│   │   │   ├── queryController.js       # SQL execution + test case validation
│   │   │   └── hintController.js        # AI hint generation
│   │   ├── models/
│   │   │   └── Assignment.js        # MongoDB schema
│   │   ├── routes/
│   │   │   ├── assignmentRoutes.js
│   │   │   ├── queryRoutes.js       # /execute + /validate endpoints
│   │   │   ├── hintRoutes.js
│   │   │   └── progressRoutes.js
│   │   ├── seeds/
│   │   │   └── assignmentsSeeder.js # 14 SQL problems (Easy/Medium/Hard)
│   │   ├── services/
│   │   │   └── llmService.js        # Google Gemini integration (hints only)
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentsView.jsx  # Problem listing page (with filters)
│   │   │   ├── AssignmentsView.scss
│   │   │   ├── AssignmentCard.jsx   # Individual problem card
│   │   │   ├── AssignmentCard.scss
│   │   │   ├── AttemptView.jsx      # Split-panel coding interface
│   │   │   ├── AttemptView.scss
│   │   │   ├── SQLEditor.jsx        # Monaco Editor wrapper
│   │   │   ├── SQLEditor.scss
│   │   │   ├── SchemaViewer.jsx     # Table schema + sample data viewer
│   │   │   ├── SchemaViewer.scss
│   │   │   ├── ResultsTable.jsx     # Query results display
│   │   │   └── ResultsTable.scss
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── styles/
│   │   │   ├── _variables.scss      # Design tokens (dark theme)
│   │   │   ├── _mixins.scss         # Responsive breakpoints, utilities
│   │   │   └── _base.scss           # Global reset + base styles
│   │   ├── App.jsx
│   │   ├── App.scss
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🏗️ Architecture & Data Flow

```
User Browser (React + Vite)
        │
        │  1. GET /api/assignments     → Load assignment list (MongoDB)
        │  2. GET /api/assignments/:id → Create PostgreSQL workspace + return data
        │
        ↓
Backend API (Express.js : 5000)
        │
        ├─ MongoDB Atlas ──────────── Stores assignments, schemas, expected output
        │                             (Accessed via Mongoose)
        │
        ├─ PostgreSQL (Neon.tech) ─── Isolated sandbox per assignment session
        │   Workspace Schema:         (Each user gets workspace_<timestamp>_<id>)
        │   workspace_xxx.employees
        │   workspace_xxx.orders
        │
        └─ Google Gemini 2.0 Flash ── Hint generation (never reveals solutions)
```

### Query Execution Flow

```
User writes SQL query
        ↓
Click "Run" → POST /api/query/execute
        ↓
Backend validates: only SELECT / WITH allowed
        ↓
SET search_path TO "workspace_xxx"
        ↓
Execute query against isolated schema
        ↓
Return { columns, rows, rowCount, executionTime }
        ↓
ResultsTable renders output

Click "Submit" → POST /api/query/validate
        ↓
Execute query + compare with expectedOutput in MongoDB
        ↓
Return { passed: true/false, feedback }
        ↓
Test case panel shows ✓ or ✗
```

---

## 📚 Assignment Topics (14 Problems)

| # | Title | Difficulty | Topic |
|---|-------|-----------|-------|
| 1 | Select All Employees | 🟢 Easy | SELECT |
| 2 | Filter by Salary | 🟢 Easy | WHERE |
| 3 | Count Total Products | 🟢 Easy | Aggregate |
| 4 | String Functions - UPPER & LENGTH | 🟢 Easy | String Functions |
| 5 | ORDER BY - Sort Products | 🟢 Easy | ORDER BY |
| 6 | DISTINCT Values | 🟢 Easy | DISTINCT |
| 7 | INNER JOIN - Employees & Departments | 🟡 Medium | JOIN |
| 8 | GROUP BY - Avg Salary per Department | 🟡 Medium | GROUP BY |
| 9 | HAVING Clause - High Budget Departments | 🟡 Medium | HAVING |
| 10 | LEFT JOIN - All Customers & Orders | 🟡 Medium | JOIN |
| 11 | Date Functions - Recent Hires | 🟡 Medium | Date Functions |
| 12 | LIKE - Search by Pattern | 🟡 Medium | LIKE |
| 13 | Subquery - Above Average Salary | 🔴 Hard | Subquery |
| 14 | Correlated Subquery - Dept Leaders | 🔴 Hard | Subquery |
| 15 | Window Function - Row Number | 🔴 Hard | Window Functions |
| 16 | CTE - Sales Analysis | 🔴 Hard | CTE |
| 17 | SELF JOIN - Employee Manager | 🔴 Hard | JOIN |

> Re-run `npm run seed` in `/backend` to add all assignments.

---

## 🛠️ Technology Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| Frontend | React 18 + Vite | Fast dev server, component architecture |
| Styling | Vanilla SCSS | Mobile-first, BEM naming, variables, mixins |
| Code Editor | Monaco Editor | Professional SQL editing with syntax highlighting |
| Backend | Node.js + Express | Lightweight, fast REST API |
| Sandbox DB | PostgreSQL (Neon) | Isolated schemas per session for safety |
| Persistence DB | MongoDB Atlas | Flexible schema for assignment data |
| AI Hints | Google Gemini 2.0 Flash | Free tier, strong SQL understanding |

---

## 🔒 Security Features

- Only `SELECT` and `WITH...SELECT` (CTE) queries are allowed
- Whole-word keyword detection prevents false positives on column names
- Every user gets an isolated PostgreSQL schema (`workspace_<id>`) 
- Parameterized inserts when loading sample data
- Schema names are validated with strict regex before use
- Rate limiting: 100 requests per 15 minutes
- `statement_timeout = 10000ms` prevents runaway queries

---

## 🌱 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `DATABASE_URL` | PostgreSQL (Neon) | `postgresql://...` |
| `LLM_PROVIDER` | AI provider | `gemini` |
| `GEMINI_API_KEY` | Google Gemini key | `AIza...` |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `ALLOW_HINT_FALLBACK` | Allow local fallback hints if Gemini fails (set `false` in production strict mode) | `true` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://ciphersqlstudio-1km8.onrender.com/api` |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | 320px+ | Stacked panels, vertical layout |
| Tablet | 641px+ | 2-column assignment grid |
| Desktop | 1024px+ | Split LeetCode-style layout |
| Wide | 1281px+ | 4-column assignment grid |

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/assignments` | List all assignments (supports `?difficulty=Easy&topic=JOIN`) |
| GET | `/api/assignments/:id` | Get assignment + create workspace |
| POST | `/api/assignments` | Create assignment (admin) |
| DELETE | `/api/assignments/workspace/:id` | Cleanup workspace schema |
| POST | `/api/query/execute` | Execute SQL query |
| POST | `/api/query/validate` | Execute + validate against expected output |
| POST | `/api/hint/generate` | Generate AI hint |

---

## 🎨 Design System

- **Theme**: Dark (GitHub-inspired — #0d1117 background)
- **Font**: Inter (UI) + JetBrains Mono (code)
- **Colors**: Electric blue (#58a6ff), Success green (#3fb950), Purple (#bc8cff)
- **Difficulty**: 🟢 Easy (#3fb950) | 🟡 Medium (#e3b341) | 🔴 Hard (#f78166)
- **Animations**: FadeInUp, slide, cursor blink, hover glows

---

## ✅ Assignment Submission Checklist

- Include your hand-drawn data-flow diagram in the repo (image/PDF), showing: Execute Query click → API call → PostgreSQL query → state update → result render.
- For assignment demos, keep `ALLOW_HINT_FALLBACK=true` to avoid hard failures when Gemini is temporarily unavailable; set it to `false` for strict production mode.
- Commit `README.md`, `.env.example` files, and source code only (never commit `.env` files).
