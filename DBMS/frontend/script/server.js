const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' data:;");
  next();
});


// Create a connection pool to the database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "10042005",
  database: "StockMarketDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("C:\\Users\\aravi\\OneDrive\\Documents\\DBMS\\frontend\\html"));
app.use(session({
  secret: 'stock_secret',
  resave: false,
  saveUninitialized: true
}));

// Serve login page as default if not logged in
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  // Redirect based on user role
  if (req.session.userRole === 'admin') {
    return res.redirect('/admin');
  }
  res.redirect('/home');
});

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password, pan, aadhar } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO users (username, email, password, pan, aadhar, role) VALUES (?, ?, ?, ?, ?, 'user')",
      [username, email, hashedPassword, pan, aadhar]
    );
    res.json({ success: true, message: "Registration successful!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error registering user!" });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [users] = await db.query("SELECT user_id, password, role FROM users WHERE username = ?", [username]);

  if (users.length === 0) return res.status(400).json({ success: false, message: "User not found!" });

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password!" });

  // Store user details in session
  req.session.userId = user.user_id;
  req.session.userRole = user.role;

  // If user is admin, redirect to admin panel
  if (user.role === 'admin') {
    return res.json({ success: true, redirect: "/admin" });
  }
  res.json({ success: true, redirect: "/home" });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Home Page for normal users
app.get('/home', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  if (req.session.userRole === 'admin') {
    return res.redirect('/admin');
  }
  res.sendFile(path.join("C:\\Users\\aravi\\OneDrive\\Documents\\DBMS\\frontend\\html", 'home.html'));
});

// Admin Panel Route
app.get('/admin', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join("C:\\Users\\aravi\\OneDrive\\Documents\\DBMS\\frontend\\html", 'admin.html'));
});

// API Endpoint: Fetch stock data (for home page)
app.get('/api/stocks', async (req, res) => {
  try {
    const [stocks] = await db.query("SELECT symbol, market_price, change, percent_change FROM Stocks");
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching stocks" });
  }
});

// API Endpoint: Fetch stock market news
app.get('/api/news', async (req, res) => {
  const stockNews = [
    "Sensex rises 150 points amid market rally.",
    "Nifty 50 at all-time high, investor confidence grows.",
    "US Fed rate decision expected next week.",
    "Apple stock surges after record-breaking iPhone sales."
  ];
  res.json(stockNews);
});

// API Endpoint: Buy/Sell Stocks
app.post('/api/trade', async (req, res) => {
  const { user_id, stock_symbol, quantity, transaction_type } = req.body;

  if (!req.session.userId || req.session.userId != user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // For simplicity, assume market_price is obtained from Stocks table
    const [stockResult] = await db.query("SELECT market_price FROM Stocks WHERE symbol = ?", [stock_symbol]);
    if (stockResult.length === 0) return res.status(400).json({ success: false, message: "Stock not found" });

    const price = stockResult[0].market_price;

    if (transaction_type === 'BUY') {
      await db.query(
        "INSERT INTO transactions (user_id, stock_symbol, quantity, price, transaction_type) VALUES (?, ?, ?, ?, 'BUY')",
        [user_id, stock_symbol, quantity, price]
      );
      await db.query(
        "INSERT INTO holdings (user_id, stock_symbol, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
        [user_id, stock_symbol, quantity, quantity]
      );
      return res.json({ success: true, message: "Stock purchased successfully!" });
    } else if (transaction_type === 'SELL') {
      const [holdingResult] = await db.query("SELECT quantity FROM holdings WHERE user_id = ? AND stock_symbol = ?", [user_id, stock_symbol]);
      if (holdingResult.length === 0 || holdingResult[0].quantity < quantity) {
        return res.status(400).json({ success: false, message: "Insufficient holdings" });
      }
      await db.query(
        "INSERT INTO transactions (user_id, stock_symbol, quantity, price, transaction_type) VALUES (?, ?, ?, ?, 'SELL')",
        [user_id, stock_symbol, quantity, price]
      );
      await db.query(
        "UPDATE holdings SET quantity = quantity - ? WHERE user_id = ? AND stock_symbol = ?",
        [quantity, user_id, stock_symbol]
      );
      return res.json({ success: true, message: "Stock sold successfully!" });
    }
    res.json({ success: false, message: "Invalid transaction type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API Endpoint: Fetch user's holdings
app.get('/api/holdings/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [holdings] = await db.query("SELECT * FROM holdings WHERE user_id = ?", [user_id]);
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: "Error fetching holdings" });
  }
});

// API Endpoint: Fetch user's transaction history
app.get('/api/transactions/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [transactions] = await db.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC", [user_id]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

// API Endpoint for Admin Panel: Fetch all user accounts
app.get('/api/admin/users', async (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const [users] = await db.query("SELECT user_id, username, email, role FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
