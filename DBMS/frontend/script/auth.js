const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '10042005', // Replace with your actual database password
  database: 'StockMarketDB'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Function to authenticate user login
async function authenticateUser(username, enteredPassword) {
  const sql = `SELECT password FROM users WHERE username = ?`;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return;
    }

    if (results.length === 0) {
      console.log('User not found');
      return;
    }

    const storedHashedPassword = results[0].password;

    // Compare entered password with stored hashed password
    const match = await bcrypt.compare(enteredPassword, storedHashedPassword);
    if (match) {
      console.log('Login successful!');
      // Redirect or return success response
    } else {
      console.log('Incorrect password');
    }
  });
}

// Example Usage
const username = 'testUser';
const enteredPassword = 'securePassword123';
authenticateUser(username, enteredPassword);
