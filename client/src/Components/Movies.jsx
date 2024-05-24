import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/movies.css';

const MoviesPage = () => {
  const [movies, setMovies] = useState({ Comedy: [], Romantic: [], Documentary: [], Action: [] });

  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      try {
        const comedyResponse = await fetch('http://localhost:5000/getMoviesByGenre?genre=Comedy');
        const romanticResponse = await fetch('http://localhost:5000/getMoviesByGenre?genre=Romance');
        const documentaryResponse = await fetch('http://localhost:5000/getMoviesByGenre?genre=Documentary');
        const actionResponse = await fetch('http://localhost:5000/getMoviesByGenre?genre=Action');

        const comedyData = await comedyResponse.json();
        const romanticData = await romanticResponse.json();
        const documentaryData = await documentaryResponse.json();
        const actionData = await actionResponse.json();

        const moviesWithRatings = await Promise.all([
          addRatingsToMovies(comedyData.movies, 'Comedy'),
          addRatingsToMovies(romanticData.movies, 'Romance'),
          addRatingsToMovies(documentaryData.movies, 'Documentary'),
          addRatingsToMovies(actionData.movies, 'Action')
        ]);

        setMovies({ Comedy: moviesWithRatings[0], Romantic: moviesWithRatings[1], Documentary: moviesWithRatings[2], Action: moviesWithRatings[3] });
      } catch (error) {
        console.error('Error fetching movies by genre:', error);
      }
    };

    fetchMoviesByGenre();
  }, []);

  // Function to add ratings to movies
  const addRatingsToMovies = async (movies, genre) => {
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        try {
          const ratingResponse = await fetch(`http://localhost:5000/api/movie/averageRating/${movie.movie_id}`);
          if (!ratingResponse.ok) {
            throw new Error('Failed to fetch average rating');
          }
          const ratingData = await ratingResponse.json();
          return { ...movie, rating: ratingData.average_rating, genre };
        } catch (error) {
          console.error(`Error fetching rating for ${movie.title}:`, error);
          return { ...movie, rating: null, genre };
        }
      })
    );

    return moviesWithRatings;
  };

  return (
    <div className="movies-page-container">
      <div className="genre-section">
        <h2 className="genre-title">Comedy Movies</h2>
        <div className="movie-list-container">
          {movies.Comedy && movies.Comedy.length > 0 ? (
            movies.Comedy.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img src={`http://localhost:5000/Images/${movie.poster_url}`} alt={movie.title} className="movie-poster" />
                <div className="movie-details">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-rating">Rating: {movie.rating}</p>
                  <Link to={`/description/${movie.movie_id}`}>
                    <button className="description-button">Description</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No comedy movies available</p>
          )}
        </div>
      </div>

      <div className="genre-section">
        <h2 className="genre-title">Romantic Movies</h2>
        <div className="movie-list-container">
          {movies.Romantic && movies.Romantic.length > 0 ? (
            movies.Romantic.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img src={`http://localhost:5000/Images/${movie.poster_url}`} alt={movie.title} className="movie-poster" />
                <div className="movie-details">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-rating">Rating: {movie.rating}</p>
                  <Link to={`/description/${movie.movie_id}`}>
                    <button className="description-button">Description</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No romantic movies available</p>
          )}
        </div>
      </div>

      <div className="genre-section">
        <h2 className="genre-title">Documentary Movies</h2>
        <div className="movie-list-container">
          {movies.Documentary && movies.Documentary.length > 0 ? (
            movies.Documentary.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img src={`http://localhost:5000/Images/${movie.poster_url}`} alt={movie.title} className="movie-poster" />
                <div className="movie-details">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-rating">Rating: {movie.rating}</p>
                  <Link to={`/description/${movie.movie_id}`}>
                    <button className="description-button">Description</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No documentary movies available</p>
          )}
        </div>
      </div>

      <div className="genre-section">
        <h2 className="genre-title">Action Movies</h2>
        <div className="movie-list-container">
          {movies.Action && movies.Action.length > 0 ? (
            movies.Action.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img src={`http://localhost:5000/Images/${movie.poster_url}`} alt={movie.title} className="movie-poster" />
                <div className="movie-details">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-rating">Rating: {movie.rating}</p>
                  <Link to={`/description/${movie.movie_id}`}>
                    <button className="description-button">Description</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No action movies available</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default MoviesPage;
