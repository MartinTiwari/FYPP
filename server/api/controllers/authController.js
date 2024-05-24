const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { JWT_SECRET, ADMIN_SECRET } = require('../config');

exports.signup = async (req, res) => {
  const { user_name, user_email, password } = req.body;

  try {
    // Check if email is already in use
    const emailCheckQuery = 'SELECT * FROM users WHERE user_email = ?';
    db.query(emailCheckQuery, [user_email], async (emailCheckErr, emailCheckResult) => {
      if (emailCheckErr) {
        console.error('Error checking email:', emailCheckErr);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (emailCheckResult.length > 0) {
        res.status(400).json({ error: 'Email already in use' });
      } else {
        // Hash the password and insert the user into the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = 'INSERT INTO users (user_name, user_email, password) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [user_name, user_email, hashedPassword], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error inserting user:', insertErr);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            // Generate a JWT token and send it in the response
            const token = jwt.sign({ user_id: insertResult.insertId, user_email, user_name }, JWT_SECRET);
            res.json({ token, message: 'Signup successful' });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  const { user_email, password } = req.body;

  try {
    // Retrieve user information from the database based on email
    const getUserQuery = 'SELECT * FROM users WHERE user_email = ?';
    db.query(getUserQuery, [user_email], async (getUserErr, getUserResult) => {
      if (getUserErr) {
        console.error('Error retrieving user:', getUserErr);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (getUserResult.length === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        // Compare the provided password with the hashed password in the database
        const user = getUserResult[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          // Generate a JWT token and send it in the response
          const token = jwt.sign(
            { user_id: user.user_id, user_email: user.user_email, user_name: user.user_name },
            JWT_SECRET
          );

          if (user.user_email === 'admin@admin.com') {
            // User is admin, send admin access token
            const adminToken = jwt.sign(
              { user_id: user.user_id, user_email: user.user_email, user_name: user.user_name },
              ADMIN_SECRET
            );
            res.json({ token: adminToken, message: 'Admin login successful' });
          } else {
            // Regular user login
            res.json({ token, message: 'Login successful' });
          }
          console.log(`Successfully logged in as ${user.user_name} (Email: ${user.user_email})`);
        } else {
          // Invalid password
          res.status(401).json({ error: 'Invalid credentials' });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
