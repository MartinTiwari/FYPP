const db = require('../models/db');

exports.addMovie = (req, res) => {
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
};

exports.updateMovie = (req, res) => {
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
};

exports.deleteMovie = (req, res) => {
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
          // After deleting reviews, delete the movie itself
          const deleteMovieQuery = 'DELETE FROM NepaliMovies WHERE movie_id = ?';
          db.query(deleteMovieQuery, [movie_id], (movieErr, movieResult) => {
            if (movieErr) {
              console.error('Error deleting movie:', movieErr);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              res.json({ message: 'Movie deleted successfully' });
            }
          });
        }
      });
    }
  });
};
