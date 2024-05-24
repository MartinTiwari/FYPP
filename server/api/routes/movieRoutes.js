const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middlewares/authMiddleware');

// Movie routes
module.exports = (upload) => {
  router.post('/add', authMiddleware.verifyAdmin, upload, movieController.addMovie);
  router.put('/update/:movie_id', authMiddleware.verifyAdmin, movieController.updateMovie);
  router.delete('/delete/:movie_id', authMiddleware.verifyAdmin, movieController.deleteMovie);
  return router;
};
