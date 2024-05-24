const db = require('../models/db');

exports.getUserProfile = (req, res) => {
  const { user_id } = req.params;
  const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
  db.query(getUserQuery, [user_id], (err, result) => {
    if (err) {
      console.error('Error retrieving user profile:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result[0]);
    }
  });
};

exports.updateUserProfile = (req, res) => {
  const { user_id } = req.params;
  const { user_name, user_email } = req.body;
  const updateUserQuery = 'UPDATE users SET user_name = ?, user_email = ? WHERE user_id = ?';
  db.query(updateUserQuery, [user_name, user_email, user_id], (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'User profile updated successfully' });
    }
  });
};

exports.deleteUser = (req, res) => {
  const { user_id } = req.params;

  // Delete related ratings first
  const deleteRatingsQuery = 'DELETE FROM MovieRatings WHERE user_id = ?';
  db.query(deleteRatingsQuery, [user_id], (ratingErr, ratingResult) => {
    if (ratingErr) {
      console.error('Error deleting ratings:', ratingErr);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // After deleting ratings, delete related reviews
      const deleteReviewsQuery = 'DELETE FROM MovieReviews WHERE user_id = ?';
      db.query(deleteReviewsQuery, [user_id], (reviewErr, reviewResult) => {
        if (reviewErr) {
          console.error('Error deleting reviews:', reviewErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // After deleting reviews, delete the user itself
          const deleteUserQuery = 'DELETE FROM users WHERE user_id = ?';
          db.query(deleteUserQuery, [user_id], (userErr, userResult) => {
            if (userErr) {
              console.error('Error deleting user:', userErr);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              res.json({ message: 'User deleted successfully' });
            }
          });
        }
      });
    }
  });
};
