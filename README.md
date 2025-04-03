Prequisites:
Package	              Purpose
express	              Backend server framework
mysql2	              Connects to MySQL database
bcryptjs	            Hashes passwords for security
express-session	      Manages user sessions
body-parser	          Parses request bodies
dotenv	               Manages environment variables


Mysql Codes To Create A Database:
CREATE DATABASE StockMarketDB;
USE StockMarketDB;
\\Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    pan VARCHAR(10) NOT NULL UNIQUE CHECK (pan REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    aadhar VARCHAR(12) NOT NULL UNIQUE CHECK (aadhar REGEXP '^[0-9]{12}$'),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\\Stocks Table 

CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    market_price DECIMAL(10,2) NOT NULL,
    change DECIMAL(10,2) NOT NULL,
    percent_change DECIMAL(5,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

\\Transactions Table

CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_symbol) REFERENCES stocks(symbol) ON DELETE CASCADE
);

\\Holdings Table

CREATE TABLE holdings (
    holding_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_symbol) REFERENCES stocks(symbol) ON DELETE CASCADE,
    UNIQUE (user_id, stock_symbol)
);

\\Admin Panel Table

CREATE TABLE admin_actions (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);


Sample data To Insert:

\\Users Sample
INSERT INTO users (username, email, password, pan, aadhar, role)
VALUES 
('john_doe', 'john@example.com', 'hashed_password', 'ABCDE1234F', '123456789012', 'user'),
('admin', 'admin@example.com', 'hashed_password', 'FGHIJ5678K', '987654321012', 'admin');

\\Stocks Sample
INSERT INTO stocks (symbol, company_name, market_price, change, percent_change)
VALUES 
('AAPL', 'Apple Inc.', 175.50, 2.30, 1.33),
('TSLA', 'Tesla Inc.', 225.75, -1.80, -0.79),
('GOOGL', 'Alphabet Inc.', 2850.60, 5.20, 0.18);

\\Transactions Sample
INSERT INTO transactions (user_id, stock_symbol, quantity, price, transaction_type)
VALUES 
(1, 'AAPL', 5, 175.50, 'BUY'),
(1, 'TSLA', 3, 225.75, 'BUY');

\\Holdings Sample
INSERT INTO holdings (user_id, stock_symbol, quantity)
VALUES 
(1, 'AAPL', 5),
(1, 'TSLA', 3);
