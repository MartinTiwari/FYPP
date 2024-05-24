import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/Admin.css';

const AdminPage = () => {
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie_id: '',
    title: '',
    description: '',
    release_date: '',
    genre: '',
    poster_url: '',
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getNepaliMovies');
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePosterImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      poster_url: file, // Store the file object directly in formData
    }));
  };

  const handleAddMovie = async () => {
    try {
      const formDataWithImage = new FormData();
      formDataWithImage.append('title', formData.title);
      formDataWithImage.append('description', formData.description);
      formDataWithImage.append('release_date', formData.release_date);
      formDataWithImage.append('genre', formData.genre);
      formDataWithImage.append('poster_url', formData.poster_url); // Append the poster image file

      await axios.post('http://localhost:5000/addMovie', formDataWithImage);
      alert('Movie added successfully');
      setFormData({
        movie_id: '',
        title: '',
        description: '',
        release_date: '',
        genre: '',
        poster_url: '',
      }); // Reset form data after adding movie
      fetchMovies(); // Refresh the movie list after adding a movie
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Error adding movie');
    }
  };

  const handleUpdateMovie = async () => {
    try {
      await axios.put(`http://localhost:5000/updateMovie/${formData.movie_id}`, formData);
      alert('Movie updated successfully');
      setFormData({
        movie_id: '',
        title: '',
        description: '',
        release_date: '',
        genre: '',
        poster_url: '',
      }); // Reset form data after updating movie
      fetchMovies(); // Refresh the movie list after updating a movie
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error updating movie');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await axios.delete(`http://localhost:5000/deleteMovie/${movieId}`);
      alert('Movie deleted successfully');
      fetchMovies(); // Refresh the movie list after deleting a movie
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie');
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <label>Title:</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} />
      <label>Description:</label>
      <textarea name="description" value={formData.description} onChange={handleChange} />
      <label>Release Date:</label>
      <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
      <label>Genre:</label>
      <input type="text" name="genre" value={formData.genre} onChange={handleChange} />
      <label>Poster Image:</label>
      <input type="file" name="poster_url" onChange={handlePosterImageChange} />
      <button onClick={handleAddMovie}>Add Movie</button>
      <button onClick={handleUpdateMovie}>Update Movie</button>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Release Date</th>
            <th>Genre</th>
            <th>Poster Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.movie_id}>
              <td>{movie.title}</td>
              <td>{movie.description}</td>
              <td>{movie.release_date}</td>
              <td>{movie.genre}</td>
              <td>
                {movie.poster_url && (
                  <img src={`http://localhost:5000/Images/${movie.poster_url}`} alt={movie.title} style={{ maxWidth: '100px' }} />
                )}
              </td>
              <td>
                <button onClick={() => setFormData(movie)}>Edit</button>
                <button onClick={() => handleDeleteMovie(movie.movie_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
