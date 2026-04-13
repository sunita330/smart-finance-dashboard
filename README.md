# 💹 FinanceOS — Full-Stack Finance Dashboard

> **React 18 + Node.js/Express + MySQL**  
> Frontend Developer Intern Assignment — all core + optional requirements covered.

---

## 📁 Project Structure

```
finance-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/db.js              ← MySQL connection pool
│   │   ├── db/
│   │   │   ├── schema.sql            ← Run once to create tables
│   │   │   └── seed.js               ← Populates mock data
│   │   ├── models/
│   │   │   ├── Transaction.js        ← All DB queries
│   │   │   └── Category.js
│   │   ├── controllers/
│   │   │   ├── transactionController.js
│   │   │   └── categoryController.js
│   │   ├── routes/
│   │   │   ├── transactions.js       ← /api/transactions
│   │   │   └── categories.js         ← /api/categories
│   │   ├── middleware/
│   │   │   └── errorHandler.js       ← asyncHandler, validate, 404, errors
│   │   └── index.js                  ← Express entry point
│   ├── .env                          ← DB credentials (pre-configured)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/index.js              ← Axios client + all API calls
│   │   ├── context/index.jsx         ← Theme, Toast, Role contexts
│   │   ├── hooks/useAsync.js         ← Data fetching + debounce hooks
│   │   ├── utils/index.js            ← Formatters and helpers
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UI.jsx                ← SummaryCard, Skeleton, ErrorBox etc.
│   │   │   ├── Charts.jsx            ← Custom SVG BarChart + DonutChart
│   │   │   └── TransactionForm.jsx   ← Add / Edit form panel
│   │   ├── pages/
│   │   │   ├── Overview.jsx          ← Dashboard tab
│   │   │   ├── Transactions.jsx      ← Table with full CRUD
│   │   │   └── Insights.jsx          ← Analytics tab
│   │   ├── App.jsx
│   │   ├── index.css                 ← Global styles, glassmorphism, tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                      ← Root convenience scripts
└── README.md
```

---

## 🚀 Setup — Step by Step

### Prerequisites
| Tool    | Version |
|---------|---------|
| Node.js | 18+     |
| MySQL   | 8+      |
| npm     | 9+      |

---

### Step 1 — Create the database schema

Open **MySQL Workbench**, connect, then run:

```sql
SOURCE path/to/finance-dashboard/backend/src/db/schema.sql;
```

Or from terminal:

```bash
mysql -u root -pSunita@29 < backend/src/db/schema.sql
```

This creates the `finance_dashboard` database with `categories` and `transactions` tables.

---

### Step 2 — Check your .env

The `.env` file is already configured with your credentials:

```
backend/.env
```

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sunita@29
DB_NAME=finance_dashboard
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> If your MySQL user is not `root`, update `DB_USER` accordingly.

---

### Step 3 — Install all dependencies

From the **root** `finance-dashboard/` folder:

```bash
npm run install:all
```

This installs both backend and frontend packages.

---

### Step 4 — Seed the database

```bash
npm run seed
```

This inserts **8 categories** and **45 transactions** across January–June 2025.

Expected output:
```
✅  Connected!
🌱  Seeding database...
🧹  Cleared existing data
✅  Inserted 8 categories
✅  Inserted 45 transactions
🎉  Database seeded successfully!
```

---

### Step 5 — Run both servers

Open **two terminals** in the root folder:

**Terminal 1 — Backend (port 5000):**
```bash
npm run dev:backend
```

Expected output:
```
✅  MySQL connected — host: localhost db: finance_dashboard
🚀  Finance API running  →  http://localhost:5000
🔍  Health check         →  http://localhost:5000/api/health
```

**Terminal 2 — Frontend (port 5173):**
```bash
npm run dev:frontend
```

Then open → **http://localhost:5173**

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### Transactions

| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| GET    | `/transactions`                | List all (search, filter, sort, paginate) |
| POST   | `/transactions`                | Create transaction              |
| GET    | `/transactions/:id`            | Get single                      |
| PUT    | `/transactions/:id`            | Update                          |
| DELETE | `/transactions/:id`            | Delete                          |
| GET    | `/transactions/summary`        | Monthly income/expense totals   |
| GET    | `/transactions/trend`          | 6-month trend data              |
| GET    | `/transactions/breakdown`      | Category spending breakdown     |
| GET    | `/transactions/top`            | Top N by amount                 |

**Query params for `/transactions`:**

| Param    | Example            |
|----------|--------------------|
| search   | `?search=netflix`  |
| type     | `?type=expense`    |
| sort     | `?sort=amount`     |
| order    | `?order=ASC`       |
| page     | `?page=2`          |
| limit    | `?limit=15`        |

### Categories

| Method | Endpoint          |
|--------|-------------------|
| GET    | `/categories`     |
| POST   | `/categories`     |
| PUT    | `/categories/:id` |
| DELETE | `/categories/:id` |

### Health check

```
GET /api/health
→ { "status": "ok", "timestamp": "...", "env": "development", "db": "finance_dashboard" }
```

---

## ✅ Assignment Requirements

| Requirement                         | Status |
|-------------------------------------|--------|
| Dashboard overview with summary cards | ✅   |
| Time-based chart (6-month trend)    | ✅     |
| Categorical chart (spending donut)  | ✅     |
| Transactions table with search      | ✅     |
| Filter by type                      | ✅     |
| Sort by any column                  | ✅     |
| Pagination                          | ✅     |
| Role-based UI (Viewer / Admin)      | ✅     |
| Add transaction (Admin)             | ✅     |
| Edit transaction (Admin)            | ✅     |
| Delete transaction (Admin)          | ✅     |
| Insights section                    | ✅     |
| State management (Context + hooks)  | ✅     |
| Responsive layout                   | ✅     |
| Empty states                        | ✅     |
| Error states with retry             | ✅     |
| Loading skeletons                   | ✅     |
| Dark / Light mode                   | ✅     |
| CSV export                          | ✅     |
| Toast notifications                 | ✅     |
| Glassmorphism + animated orbs       | ✅     |
| Gradient text                       | ✅     |

---

## 🐞 Bugs Fixed (vs original)

| File                        | Fix                                                                 |
|-----------------------------|---------------------------------------------------------------------|
| `backend/.env`              | Password set to `Sunita@29`                                        |
| `backend/src/index.js`      | Fixed `dotenv` path — resolves correctly from any working directory |
| `backend/src/db/seed.js`    | Fixed `dotenv` path — seed now loads `.env` properly               |
| `backend/src/config/db.js`  | Added `decimalNumbers: true` — amounts return as JS numbers        |
| `backend/src/models/Transaction.js` | Fixed `DATE_FORMAT` on all date fields (no timezone shift) |
| `backend/src/models/Transaction.js` | Fixed `categoryBreakdown` with `LEFT JOIN` + `HAVING total > 0` |
| `backend/src/db/schema.sql` | Added `IF NOT EXISTS` on indexes — safe to re-run                 |
| `frontend/src/utils/index.js` | Fixed `fmtDate` — uses `Date.UTC` to avoid timezone off-by-one  |
| `frontend/src/components/Charts.jsx` | Fixed empty-data guard, correct SVG path math              |
| `frontend/src/pages/Transactions.jsx` | Fixed edit → form prefill for `category_id` and date      |
| `frontend/src/components/TransactionForm.jsx` | Fixed `useEffect` dep on `initial?.id` only      |

---

## 🎨 Design Features

- **Glassmorphism** — `backdrop-filter: blur(20px)` on all cards
- **Animated orbs** — 3 floating gradient blobs in background
- **Dark / Light mode** — full CSS variable token system, saved to `localStorage`
- **Gradient text** — `-webkit-background-clip` headings
- **Custom SVG charts** — zero chart library dependency
- **Staggered animations** — card entrance with `animation-delay`
- **Outfit + JetBrains Mono** — distinctive type pairing
