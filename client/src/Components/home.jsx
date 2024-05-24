import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchNepaliMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/getNepaliMovies');
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        // Shuffle the movies array
        const shuffledMovies = shuffleArray(data.movies);
        // Slice the first 5 movies
        const selectedMovies = shuffledMovies.slice(0, 4);
        // Fetch and update average ratings for each movie
        const moviesWithRatings = await Promise.all(
          selectedMovies.map(async (movie) => {
            const ratingResponse = await fetch(`http://localhost:5000/api/movie/averageRating/${movie.movie_id}`);
            if (!ratingResponse.ok) {
              throw new Error('Failed to fetch average rating');
            }
            const ratingData = await ratingResponse.json();
            return { ...movie, average_rating: ratingData.average_rating };
          })
        );
        setMovies(moviesWithRatings);
      } catch (error) {
        console.error('Error fetching Nepali movies or ratings:', error);
        setMovies([]);
      }
    };

    fetchNepaliMovies();
  }, []);

  // Function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <div className="home-page-container">
      <div className="big-image-container">
        {/* Big image content goes here */}
        <h1 className='igh'>WELCOME TO NEPFLICKS!!</h1>
      </div>
      <h2 className="trending-title">Trending Movies</h2>
      <div className="movie-list-container">
        {movies.map((movie) => (
          <div key={movie.movie_id} className="movie-card">
            {movie.poster_url && (
              <img
                src={`http://localhost:5000/Images/${movie.poster_url}`}
                alt={movie.title}
                className="movie-poster"
              />
            )}
            <div className="movie-details">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-rating">Rating: {movie.average_rating}</p>
              <Link to={`/description/${movie.movie_id}`}>
                <button className="description-button">Description</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
