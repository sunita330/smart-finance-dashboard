# 💹 FinanceOS — Full-Stack Finance Dashboard

> A premium, production-grade personal finance dashboard built with **React + Node.js/Express + MySQL**.  

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)

---

## 📁 Project Structure

```
finance-dashboard/
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MySQL connection pool
│   │   ├── db/
│   │   │   ├── schema.sql      # Database schema (run once)
│   │   │   └── seed.js         # Mock data seeder
│   │   ├── models/
│   │   │   ├── Transaction.js  # All transaction DB queries
│   │   │   └── Category.js     # Category DB queries
│   │   ├── controllers/
│   │   │   ├── transactionController.js
│   │   │   └── categoryController.js
│   │   ├── routes/
│   │   │   ├── transactions.js # /api/transactions
│   │   │   └── categories.js   # /api/categories
│   │   ├── middleware/
│   │   │   └── errorHandler.js # asyncHandler, validate, 404, errors
│   │   └── index.js            # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js        # Axios client + all API calls
│   │   ├── context/
│   │   │   └── index.jsx       # Theme, Toast, Role contexts
│   │   ├── hooks/
│   │   │   └── useAsync.js     # Data fetching + debounce hooks
│   │   ├── utils/
│   │   │   └── index.js        # Formatters, helpers
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Sticky nav with tabs + controls
│   │   │   ├── UI.jsx          # SummaryCard, Skeleton, ErrorBox, etc.
│   │   │   ├── Charts.jsx      # SVG BarChart + DonutChart
│   │   │   └── TransactionForm.jsx  # Add/edit form panel
│   │   ├── pages/
│   │   │   ├── Overview.jsx    # Dashboard tab
│   │   │   ├── Transactions.jsx # Table tab with full CRUD
│   │   │   └── Insights.jsx    # Analytics tab
│   │   ├── App.jsx             # Root component + context providers
│   │   ├── index.css           # Global CSS (glassmorphism, tokens, animations)
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                # Root scripts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool    | Version |
|---------|---------|
| Node.js | 18+     |
| MySQL   | 8+      |
| npm     | 9+      |

### 1. Clone / download the project

```bash
cd finance-dashboard
```

### 2. Set up the database

```sql
-- In MySQL Workbench or mysql CLI:
SOURCE backend/src/db/schema.sql;
```

Or run directly:

```bash
mysql -u root -p < backend/src/db/schema.sql
```

### 3. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=finance_dashboard
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Install dependencies

```bash
# Install both backend and frontend at once
npm run install:all

# Or separately:
npm install --prefix backend
npm install --prefix frontend
```

### 5. Seed the database with mock data

```bash
npm run seed
# Inserts 8 categories + 45 transactions across Jan–Jun 2025
```

### 6. Start development servers

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### Transactions

| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/transactions`                  | List all (search, filter, sort, paginate) |
| POST   | `/transactions`                  | Create a transaction               |
| GET    | `/transactions/:id`              | Get single transaction             |
| PUT    | `/transactions/:id`              | Update a transaction               |
| DELETE | `/transactions/:id`              | Delete a transaction               |
| GET    | `/transactions/summary`          | Income/expense totals for a month  |
| GET    | `/transactions/trend`            | 6-month income vs expense trend    |
| GET    | `/transactions/breakdown`        | Spending by category (monthly)     |
| GET    | `/transactions/top`              | Top N transactions by amount       |

**Query params for GET `/transactions`:**

| Param         | Type   | Example          |
|---------------|--------|------------------|
| `search`      | string | `?search=netflix` |
| `type`        | string | `?type=expense`  |
| `sort`        | string | `?sort=amount`   |
| `order`       | string | `?order=ASC`     |
| `page`        | number | `?page=2`        |
| `limit`       | number | `?limit=20`      |

**Query params for analytics endpoints:**

| Param    | Endpoint         | Example        |
|----------|------------------|----------------|
| `year`   | summary, breakdown | `?year=2025` |
| `month`  | summary, breakdown | `?month=6`   |
| `months` | trend            | `?months=6`  |
| `limit`  | top              | `?limit=5`   |
| `type`   | top              | `?type=income` |

### Categories

| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| GET    | `/categories`      | List all        |
| POST   | `/categories`      | Create category |
| GET    | `/categories/:id`  | Get single      |
| PUT    | `/categories/:id`  | Update          |
| DELETE | `/categories/:id`  | Delete          |

### Health check

```
GET /api/health
→ { status: "ok", timestamp: "...", env: "development" }
```

---

## ✅ Assignment Requirements Coverage

### 1. Dashboard Overview
- 4 KPI summary cards: Balance, Income, Expenses, Savings Rate
- Sparkline trend charts on each card
- 6-month income vs expenses bar chart (animated SVG)
- Interactive donut chart with per-slice hover
- Recent transactions list with category icons

### 2. Transactions Section
- Full paginated table (15 per page) with server-side sort
- Columns: Date, Description, Category, Type, Amount, Actions
- **Search**: live debounced search across description + category
- **Filter**: by type (income/expense)
- **Sort**: any column, toggle ASC/DESC
- Add/Edit/Delete form panel (Admin only)
- CSV export of current view
- Empty state and error states handled

### 3. Role-Based UI
| Feature             | Viewer | Admin |
|---------------------|:------:|:-----:|
| View all data       | ✅     | ✅    |
| Add transaction     | ❌     | ✅    |
| Edit transaction    | ❌     | ✅    |
| Delete transaction  | ❌     | ✅    |
| Export CSV          | ✅     | ✅    |

Switch via the dropdown in the top-right navbar.

### 4. Insights Section
- Top spending category with amount
- Best savings month across 6-month trend
- Average monthly expense
- Month-over-month expense delta
- Animated category breakdown with progress bars
- Top 5 expenses and Top 5 income transactions side by side

### 5. State Management
- `useState` + `useMemo` for local UI state
- Custom `useAsync` hook for data fetching (loading/error/data states)
- `useDebounce` hook for search input
- React Context for: Theme, Toast notifications, Role

### 6. UI & UX
- Responsive grid layout (auto-fit, collapses on mobile)
- Loading skeletons for every async section
- Error states with retry buttons
- Toast notifications for all CRUD operations
- Hover effects on rows, cards, and nav items
- Empty states with illustrations

---

## 🎨 Design Highlights

- **Glassmorphism**: `backdrop-filter: blur(20px) saturate(160%)` on all cards
- **Animated orbs**: 3 floating gradient orbs behind the UI via pure CSS keyframes
- **Dark / Light mode**: Full CSS variable dual-token system, persisted in `localStorage`
- **Gradient text**: `-webkit-background-clip` on headings and KPI numbers
- **Custom SVG charts**: hand-rolled bar chart + donut chart — no chart library dependency
- **Staggered card animations**: entrance animations with `animation-delay` per card
- **Typography**: Outfit (body) + JetBrains Mono (numbers)

---

## 🌟 Optional Enhancements Implemented

- ✅ Dark / Light mode with persistence
- ✅ Animations and transitions throughout
- ✅ CSV export (filtered view)
- ✅ Advanced filtering + server-side pagination
- ✅ Mock API integration (real REST API, not static data)
- ✅ Graceful empty and error state handling

---

## 🛠️ Tech Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend framework | Express | Lightweight, flexible, widely understood |
| ORM | None (mysql2 raw) | Full query control, no abstraction overhead for this scope |
| State management | React built-ins + Context | Sufficient without Redux complexity |
| Charts | Custom SVG | Zero dependency, full visual control |
| Styling | CSS variables + inline | Theming without a CSS-in-JS library |
| Validation | express-validator | Battle-tested, declarative |

---

## 📝 Notes

- All data is served from a real MySQL database via the REST API
- No authentication (as per assignment spec) — role is simulated on the frontend
- The frontend proxies `/api/*` to `localhost:5000` via Vite's dev proxy
- For production, configure `VITE_API_BASE_URL` and serve the built frontend separately

---

