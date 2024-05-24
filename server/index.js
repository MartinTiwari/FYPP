const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Create the "Images" folder if it doesn't exist
const imagesFolderPath = path.join(__dirname, '..', 'client', 'src', 'Images');
if (!fs.existsSync(imagesFolderPath)) {
  fs.mkdirSync(imagesFolderPath);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'client', 'src', 'Images')); // Adjust the path to save images in the client/Images folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename for each uploaded image
  },
});

const upload = multer({ storage }).single('poster_url');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nepflick',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

const JWT_SECRET = 'your_secret_key';

// Serve static files (including images) from the Images directory
app.use('/Images', express.static(path.join(__dirname, '..', 'client', 'src', 'Images')));

// User Signup Endpoint
app.post('/signup', async (req, res) => {
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
});

const ADMIN_SECRET = 'your_admin_secret_key_here'; // Define your admin secret key

// User Login Endpoint
app.post('/login', async (req, res) => {
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
});


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and attach decoded user information to the request object
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Example protected endpoint requiring a valid token
app.get('/getUserData', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// API endpoint to fetch Nepali movies
app.get('/getNepaliMovies', (req, res) => {
  const query = 'SELECT * FROM NepaliMovies';

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching Nepali movies:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ movies: result });
    }
  });
});

// Add a new movie
app.post('/addMovie', upload, (req, res) => {
  const { title, description, release_date, genre } = req.body;
  const posterUrl = req.file ? req.file.filename : ''; // Get the filename of the uploaded image
  const insertMovieQuery = 'INSERT INTO NepaliMovies (title, description, release_date, genre, poster_url) VALUES (?, ?, ?, ?, ?)';
  db.query(insertMovieQuery, [title, description, release_date, genre, posterUrl], (err, result) => {
    if (err) {
      console.error('Error adding movie:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Movie added successfully' });
    }
  });
});

// Update an existing movie
app.put('/updateMovie/:movie_id', (req, res) => {
  const { movie_id } = req.params;
  const { title, description, release_date, genre, poster_url } = req.body;
  const updateMovieQuery = 'UPDATE NepaliMovies SET title = ?, description = ?, release_date = ?, genre = ?, poster_url = ? WHERE movie_id = ?';
  db.query(updateMovieQuery, [title, description, release_date, genre, poster_url, movie_id], (err, result) => {
    if (err) {
      console.error('Error updating movie:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Movie updated successfully' });
    }
  });
});

// Delete a movie along with its related ratings and reviews
app.delete('/deleteMovie/:movie_id', (req, res) => {
  const { movie_id } = req.params;

  // Delete related ratings first
  const deleteRatingsQuery = 'DELETE FROM MovieRatings WHERE movie_id = ?';
  db.query(deleteRatingsQuery, [movie_id], (ratingErr, ratingResult) => {
    if (ratingErr) {
      console.error('Error deleting ratings:', ratingErr);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // After deleting ratings, delete related reviews
      const deleteReviewsQuery = 'DELETE FROM MovieReviews WHERE movie_id = ?';
      db.query(deleteReviewsQuery, [movie_id], (reviewErr, reviewResult) => {
        if (reviewErr) {
          console.error('Error deleting reviews:', reviewErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // After deleting reviews, delete the movie
          const deleteMovieQuery = 'DELETE FROM NepaliMovies WHERE movie_id = ?';
          db.query(deleteMovieQuery, [movie_id], (err, result) => {
            if (err) {
              console.error('Error deleting movie:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              res.json({ message: 'Movie, ratings, and reviews deleted successfully' });
            }
          });
        }
      });
    }
  });
});



// Fetch movie details including ratings and average rating without token
app.get('/api/movie/details/:movieId', (req, res) => {
  const { movieId } = req.params;
  const getMovieDetailsQuery = `
    SELECT m.*, AVG(r.rating) AS average_rating
    FROM NepaliMovies m
    LEFT JOIN MovieRatings r ON m.movie_id = r.movie_id
    WHERE m.movie_id = ?
    GROUP BY m.movie_id
  `;

  db.query(getMovieDetailsQuery, [movieId], (err, result) => {
    if (err) {
      console.error('Error fetching movie details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length === 0) {
        res.status(404).json({ error: 'Movie not found' });
      } else {
        const movieDetails = result[0];
        res.json({ movie: movieDetails });
      }
    }
  });
});



// Fetch user's personal rating for a movie (requires token)
app.get('/api/movie/userRating/:movieId', verifyToken, (req, res) => {
  const { movieId } = req.params;
  const userId = req.user ? req.user.user_id : null; // Get user ID if logged in
  const getUserRatingQuery = `
    SELECT rating
    FROM MovieRatings
    WHERE movie_id = ? AND user_id = ?
  `;

  db.query(getUserRatingQuery, [movieId, userId], (err, result) => {
    if (err) {
      console.error('Error fetching user rating:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length === 0) {
        res.json({ user_rating: null }); // User has not rated the movie
      } else {
        const userRating = result[0].rating;
        res.json({ user_rating: userRating });
      }
    }
  });
});

// Handle rating submissions for a movie (requires token)
app.post('/api/movie/rate/:movieId', verifyToken, (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.user_id; // Assume user is authenticated (verified by verifyToken middleware)
  const { rating } = req.body;

  // Validate rating (e.g., check if it's between 1 and 5)
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  const insertRatingQuery = `
    INSERT INTO MovieRatings (movie_id, user_id, rating)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;

  db.query(insertRatingQuery, [movieId, userId, rating], (err, result) => {
    if (err) {
      console.error('Error submitting rating:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Rating submitted successfully' });
    }
  });
});

// Add a review for a movie (requires token)
app.post('/api/movie/review/:movieId', verifyToken, (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.user_id; // Assume user is authenticated (verified by verifyToken middleware)
  const { text } = req.body;

  // Validate review text (ensure it's not empty)
  if (!text.trim()) {
    return res.status(400).json({ error: 'Review text is required' });
  }

  const insertReviewQuery = `
    INSERT INTO MovieReviews (movie_id, user_id, review_text)
    VALUES (?, ?, ?)
  `;

  db.query(insertReviewQuery, [movieId, userId, text], (err, result) => {
    if (err) {
      console.error('Error adding review:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Review added successfully' });
    }
  });
});

// API endpoint to fetch reviews for a movie with user names
app.get('/api/movie/reviews/:movieId', (req, res) => {
  const { movieId } = req.params;

  // Query to fetch reviews with user names using a JOIN on user_id
  const getReviewsQuery = `
    SELECT moviereviews.*, users.user_name 
    FROM moviereviews 
    JOIN users ON moviereviews.user_id = users.user_id 
    WHERE moviereviews.movie_id = ?
  `;

  db.query(getReviewsQuery, [movieId], (err, result) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ reviews: result });
    }
  });
});

// API endpoint to search movies
app.get('/searchMovies', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Use SQL LIKE operator to search for movies containing the query in their title or description
  const searchQuery = `
    SELECT * FROM NepaliMovies
    WHERE title LIKE ? OR description LIKE ?
  `;
  const searchValue = `%${query}%`;

  db.query(searchQuery, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error('Error searching movies:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ movies: result });
    }
  });
});

// Endpoint to change user's password
app.put('/changePassword', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.user_id; // token ma userid huna parcha

  try {
    // user line
    const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
    db.query(getUserQuery, [userId], async (getUserErr, getUserResult) => {
      if (getUserErr) {
        console.error('Error retrieving user:', getUserErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (getUserResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = getUserResult[0];

      // Compare gareko hash password sanga
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid current password' });
      }

      // hash 
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // update garne
      const updatePasswordQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
      db.query(updatePasswordQuery, [hashedNewPassword, userId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to fetch comedy movies
app.get('/getMoviesByGenre', (req, res) => {
  const { genre } = req.query;
  const query = 'SELECT * FROM nepalimovies WHERE genre LIKE ?';
  const genreQuery = '%' + genre + '%';

  db.query(query, [genreQuery], (err, result) => {
    if (err) {
      console.error('Error fetching movies by genre:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ movies: result });
    }
  });
});

// API endpoint to fetch average rating of Nepali movies
app.get('/api/movie/averageRating/:movieId', (req, res) => {
  const { movieId } = req.params;
  const getAverageRatingQuery = `
    SELECT AVG(rating) AS average_rating
    FROM MovieRatings
    WHERE movie_id = ?
  `;

  db.query(getAverageRatingQuery, [movieId], (err, result) => {
    if (err) {
      console.error('Error fetching average rating:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const averageRating = result[0]?.average_rating || 0; // Handle case where no rating is found
      res.json({ average_rating: averageRating });
    }
  });
});

// API endpoint to search movies
app.get('/api/searchMovies', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Use SQL LIKE operator to search for movies containing the query in their title or description
  const searchQuery = `
    SELECT * FROM NepaliMovies
    WHERE title LIKE ? OR genre LIKE ?
  `;
  const searchValue = `%${query}%`;

  db.query(searchQuery, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error('Error searching movies:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ movies: result });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
