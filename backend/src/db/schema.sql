-- ─────────────────────────────────────────────────────────────────────────────
--  Finance Dashboard — MySQL Schema
--  Run: mysql -u root -p < backend/src/db/schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS finance_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE finance_dashboard;

-- ── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL UNIQUE,
  icon       VARCHAR(10)  NOT NULL DEFAULT '💰',
  color      VARCHAR(10)  NOT NULL DEFAULT '#6d8cff',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(180)  NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  type        ENUM('income','expense') NOT NULL,
  category_id INT UNSIGNED  NOT NULL,
  txn_date    DATE          NOT NULL,
  note        TEXT          DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_txn_date      ON transactions (txn_date);
CREATE INDEX IF NOT EXISTS idx_txn_type      ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_txn_category  ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_txn_date_type ON transactions (txn_date, type);
