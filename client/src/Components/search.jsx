import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/searchMovies?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data.movies);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="search-page-container">
      <h2 className="search-title">Search Movies</h2>
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search movies"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="button" className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="search-results-container">
        {searchResults.length > 0 ? (
          <div className="search-results-list">
            {searchResults.map((movie) => (
              <div key={movie.movie_id} className="search-result-item">
                <div className="movie-card">
                  {movie.poster_url && (
                    <img
                      src={`http://localhost:5000/Images/${movie.poster_url}`}
                      alt={movie.title}
                      className="movie-poster"
                    />
                  )}
                  <h3 className="movie-title">{movie.title}</h3>
                  <Link to={`/description/${movie.movie_id}`}>
                    <button className="description-button">Description</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results-message">No results found for "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
};

export default Search;
