const mysql = require('mysql2');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "10042005",
  database: "StockMarketDB"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database");
});

async function updateStockPrices() {
  const stocks = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'];  // Popular stock symbols
  const apiKey = 'GB9OVZZ9X7RS2LL1';  // Replace with your API key

  for (const symbol of stocks) {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
      const price = response.data['Global Quote']['05. price'];

      if (price) {
        const sql = `UPDATE Stocks SET market_price = ?, last_updated = NOW() WHERE symbol = ?`;
        db.query(sql, [price, symbol], (err) => {
          if (err) console.error(err);
          else console.log(`Updated ${symbol}: $${price}`);
        });
      } else {
        console.log(`No valid price data for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
    }
  }
}

updateStockPrices();

// Function to hash and store a new user
async function hashAndStoreUser(username, password, email, pan, aadhar) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, password, email, pan, aadhar) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [username, hashedPassword, email, pan, aadhar], (err, result) => {
      if (err) console.error('Error inserting user:', err);
      else console.log('User successfully registered:', username);
    });
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Function to authenticate user login
async function authenticateUser(username, enteredPassword, callback) {
  const sql = `SELECT password FROM users WHERE username = ?`;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return callback(false);
    }
    if (results.length === 0) {
      console.log('User not found');
      return callback(false);
    }

    const storedHashedPassword = results[0].password;
    const match = await bcrypt.compare(enteredPassword, storedHashedPassword);
    callback(match);
  });
}
