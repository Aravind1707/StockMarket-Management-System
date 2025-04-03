const bcrypt = require('bcryptjs');

// Example: Hash the password before storing it in the database
const plainPassword = 'userpassword123'; // The password entered by the user

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed Password:', hashedPassword);

    // Now insert the user data into the database, with the hashed password
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, ['user1', hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting user into database:', err);
      } else {
        console.log('User registered successfully:', results);
      }
    });
  }
});
