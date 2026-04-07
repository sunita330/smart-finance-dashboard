-- Finance Dashboard MySQL Schema

CREATE DATABASE IF NOT EXISTS finance_dashboard
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finance_dashboard;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL UNIQUE,
  icon       VARCHAR(10)  NOT NULL DEFAULT '💰',
  color      VARCHAR(10)  NOT NULL DEFAULT '#6d8cff',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(180) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type        ENUM('income','expense') NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  txn_date    DATE NOT NULL,
  note        TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_txn_date      ON transactions (txn_date);
CREATE INDEX idx_txn_type      ON transactions (type);
CREATE INDEX idx_txn_category  ON transactions (category_id);
CREATE INDEX idx_txn_date_type ON transactions (txn_date, type);
