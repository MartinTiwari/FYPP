import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/description.css';

const Description = () => {
  const { movieId } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(2); // Number of reviews initially visible
  const [newReviewText, setNewReviewText] = useState('');
  const [showReviews, setShowReviews] = useState(true); // State to track showing/hiding reviews
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movie/details/${movieId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const data = await response.json();
        setMovieDetails(data.movie);

        const userToken = localStorage.getItem('userToken');
        if (userToken) {
          const ratingResponse = await fetch(`http://localhost:5000/api/movie/userRating/${movieId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            setUserRating(ratingData.user_rating);
          }
        }

        setIsLoggedIn(!!userToken);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setMovieDetails(null);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movie/reviews/${movieId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
    };

    fetchMovieDetails();
    fetchReviews();
  }, [movieId]);

  const handleRatingChange = (event) => {
    setUserRating(parseInt(event.target.value));
  };

  const handleRatingSubmit = async () => {
    if (userRating > 0) {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`http://localhost:5000/api/movie/rate/${movieId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: userRating }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to submit rating: ${errorData.error}`);
        }

        setMovieDetails((prevDetails) => ({
          ...prevDetails,
          user_rating: userRating,
        }));

        alert('Rating submitted successfully');
      } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating');
      }
    } else {
      alert('Please select a rating.');
    }
  };

  const handleReviewTextChange = (event) => {
    setNewReviewText(event.target.value);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (newReviewText.trim() === '') {
      alert('Please enter your review.');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/movie/review/${movieId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newReviewText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to submit review: ${errorData.error}`);
      }

      const updatedReviewsResponse = await fetch(`http://localhost:5000/api/movie/reviews/${movieId}`);
      if (updatedReviewsResponse.ok) {
        const updatedReviewsData = await updatedReviewsResponse.json();
        setReviews(updatedReviewsData.reviews);
      }

      setNewReviewText('');
      alert('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleShowMoreReviews = () => {
    setVisibleReviews(reviews.length);
    setShowReviews(true); // Show reviews when "Show More Reviews" is clicked
  };

  const handleHideReviews = () => {
    setVisibleReviews(2); // Show only the first two reviews
    setShowReviews(false); // Hide the reviews
  };

  return (
    <div className="container">
      <div className="movie-content">
        <div className="image-container">
          {movieDetails && (
            <img src={`http://localhost:5000/Images/${movieDetails.poster_url}`} alt={movieDetails.title} />
          )}
        </div>
        <div className="ratings-container">
          {movieDetails ? (
            <>
              <h1>{movieDetails.title}</h1>
              <p>{movieDetails.description}</p>
              <p>Average Rating: {movieDetails.average_rating}</p>
              {isLoggedIn && userRating !== null && (
                <p>Your Rating: {userRating}</p>
              )}
              {isLoggedIn ? (
                <div className="rating-section">
                  <label htmlFor="rating">Rate this movie:</label>
                  <select id="rating" value={userRating || 0} onChange={handleRatingChange}>
                    <option value="0">Select Rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                  <button onClick={handleRatingSubmit}>Submit Rating</button>
                </div>
              ) : (
                <button onClick={handleLoginRedirect}>Login to Rate</button>
              )}
            </>
          ) : (
            <p className="error-message">Failed to load movie details.</p>
          )}
        </div>
      </div>
      <div className="reviews-section">
        <h2>Reviews</h2>
        {showReviews && (
          <>
            <ul>
              {reviews.slice(0, visibleReviews).map((review) => (
                <li key={review.review_id} className="comment-container">
                  <p className="user-name">{review.user_name}</p>
                  <p className="comment-text">{review.review_text}</p>
                  <p className="review-date">Posted on: {new Date(review.review_date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
            {reviews.length > 2 && visibleReviews < reviews.length && (
              <button onClick={handleShowMoreReviews}>Show More Reviews</button>
            )}
          </>
        )}
        {!showReviews && (
          <>
            <button onClick={() => setShowReviews(true)}>Show Reviews</button>
            <button onClick={handleHideReviews}>Hide Reviews</button>
          </>
        )}
        {showReviews && isLoggedIn && (
          <form onSubmit={handleReviewSubmit}>
            <label htmlFor="reviewText">Write your review:</label>
            <textarea id="reviewText" value={newReviewText} onChange={handleReviewTextChange}></textarea>
            <button type="submit">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Description;
